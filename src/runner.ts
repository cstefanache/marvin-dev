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
                        if (type === 'fill') {
                            await page.type(locator, parameters[locator]);
                        } else {
                            await page.click(locator);
                        }
                    }
                    await page.waitForNetworkIdle();
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
