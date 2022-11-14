import {Page} from 'puppeteer';
import Flow from './flow';
import {Aliases, Config, Sequence} from './models/config';
import {ActionItem, Actions} from './models/models';
import {log} from './utils/logger';

export default class Runner {
    constructor(private readonly config: Config, private readonly flow: Flow) {}

    public async run(page: Page, sequence: String[]) {
        const {graph, actions} = this.flow.flow;
        let currentStep = graph;

        for (const step of sequence) {
            const url = page.url();
            log(`Current path: ${url}`, 'yellow');
            const action = currentStep.find(
                (item: ActionItem) => item.description === step
            );
            if (action) {
                const {method: methodName, parameters} = action;
                const urlActions = actions[url];
                const method = urlActions.find(
                    (item: Actions) => item.name === methodName
                );
                if (method) {
                    for (const sequenceItem of method.sequence) {
                        const {type, locator} = sequenceItem;
                        const element = await page.$(locator);
                        if (element) {
                            if (type === 'fill') {
                                log(
                                    `Filling ${locator} with ${parameters[locator]}`,
                                    'yellow'
                                );
                                await element.type(parameters[locator]);
                            } else {
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
                        await page.waitForNetworkIdle();
                    } catch (e) {
                        log(
                            'Network idle timeout. Runner will continue.',
                            'red'
                        );
                    }
                } else {
                    throw new Error(`Method ${methodName} not found`);
                }
            } else {
                throw new Error(`Action ${step} not found in flow`);
            }
            currentStep = action.children;
        }

        log(`Sequence ended on page: ${page.url()}`, 'green');
    }
}
