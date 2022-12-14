import {Page} from 'puppeteer';
import Flow from './flow';
import {Aliases, Config, Sequence} from './models/config';
import {ActionItem, Actions} from './models/models';
import {State} from './state';
import {log} from './utils/logger';
import {processUrl} from './utils/processes';

export default class Runner {
    constructor(
        private readonly config: Config,
        private readonly flow: Flow,
        private readonly state: State | undefined
    ) {}

    public async run(page: Page, sequence: String[]) {
        const {graph, actions} = this.flow.flow;
        let currentStep = graph;
        for (const step of sequence) {
            let url = page.url();
            url = processUrl(url, this.config.urlReplacers);
            log(`Current path: ${url}`, 'yellow');
            let action = currentStep.find(
                (item: ActionItem) => item.sequence_step === step
            );
            if (action) {
                const {method: methodName, parameters} = action;
                const urlActions = actions[url];
                let method: any;
                if (urlActions) {
                    method = urlActions.find(
                        (item: Actions) => item.method === methodName
                    );
                } else {
                    throw new Error(
                        `Current path ${url} not found in flow. Please update your flow according to the latest discovered pages`
                    );
                }
                if (method) {
                    let prefix = '';

                    if (method.itemRoot && this.config.aliases.iterators) {
                        const {itemRoot} = method;

                        const iteratorConfig =
                            this.config.aliases.iterators.find(
                                configIterator =>
                                    configIterator.name === itemRoot
                            );

                        if (iteratorConfig && iteratorConfig.identifiers) {
                            console.log(iteratorConfig.selectors.join(', '));
                            const elements = await page.$$(
                                iteratorConfig.selectors.join(', ')
                            );

                            if (elements && elements.length) {
                                console.log(elements);
                                for (const [
                                    index,
                                    element,
                                ] of elements.entries()) {
                                    let isRoot = true;
                                    for (const identifier of iteratorConfig.identifiers) {
                                        const {name, selector} = identifier;
                                        const valueElement = selector
                                            ? await element.$(selector)
                                            : element;
                                        if (valueElement) {
                                            const text =
                                                (await valueElement.evaluate(
                                                    el => el.textContent
                                                )) as string;
                                            console.log(
                                                `[${index}] ${name}: ${text} - ${parameters[name]}`
                                            );
                                            if (text !== parameters[name]) {
                                                isRoot = false;
                                                break;
                                            }
                                        } else {
                                            isRoot = false;
                                        }
                                    }
                                    if (isRoot) {
                                        prefix = `${
                                            iteratorConfig.selectors[0]
                                        }:nth-of-type(${index + 1})`;
                                        break;
                                    }
                                }
                            } else {
                                log(`No elements found for ${itemRoot}`, 'red');
                            }
                        } else {
                            throw new Error(
                                `Missing iterator config for ${itemRoot}`
                            );
                        }

                        if (prefix === '') {
                            throw new Error(
                                `No root element found for ${itemRoot} for parameters ${JSON.stringify(
                                    parameters
                                )}`
                            );
                        }
                    }

                    for (const sequenceItem of method.sequence) {
                        let {type, locator} = sequenceItem;
                        locator = `${prefix !== '' ? prefix : ''}${
                            prefix !== '' && locator ? ' ' : ''
                        }${locator || ''}`;
                        console.log(type, locator);
                        if (type === 'fill') {
                            log(
                                `Filling ${locator} with ${parameters[locator]}`,
                                'yellow'
                            );
                            // await element.type(parameters[locator]);
                            // await page.$eval(locator, (e: any) => e.blur());
                            await page.focus(locator);
                            await page.keyboard.type(parameters[locator]);
                        } else {
                            const element = await page.$(locator);
                            if (element) {
                                var attributes = await page.evaluate(
                                    element =>
                                        Array.from(
                                            element.attributes,
                                            ({name, value}) => [name, value]
                                        ),
                                    element
                                );
                                console.log(attributes);
                                const text = await element.evaluate(el =>
                                    el.textContent?.trim()
                                );
                                log(`Clicking on ${text}`, 'yellow');
                                await element.click();
                                log(`Clicked on ${text}`, 'yellow');
                            }
                        }
                    }
                    try {
                        await page.waitForNetworkIdle({
                            timeout: this.config.defaultTimeout,
                        });
                    } catch (e) {
                        log(
                            'Network idle timeout. Runner will continue.',
                            'red'
                        );
                        if (this.state) {
                            this.state.reportOnPendingRequests();
                        }
                    }
                } else {
                    throw new Error(`Method ${methodName} not found`);
                }
            } else {
                throw new Error(`Action ${step} not found in flow`);
            }
            if (action.children) {
                currentStep = action.children;
            } else {
                throw new Error(
                    `children[] array does not exist in the current node << ${step} >> in the graph flow`
                );
            }
        }

        log(`Sequence ended on page: ${page.url()}`, 'green');
    }
}
