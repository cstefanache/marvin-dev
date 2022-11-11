import {Aliases, Config} from './models/config';
import {log} from './utils/logger';

export default class Runner {
    constructor(private readonly config: Config) {}

    public async run(page: any) {
        for (const [path, useCase] of this.config.discover) {
            if (path === null) {
                continue;
            }

            const actions = this.config.actions[path].find(
                obj => obj.name === useCase
            );

            if (actions) {
                const {sequence} = actions;
                for (const item of sequence) {
                    const {type, locator, value} = item;
                    log(`Executing ${type} on ${locator} ...`, 'blue');
                    if (type === 'fill') {
                        await page.type(locator, value);
                    } else {
                        await page.click(locator);
                    }
                }
            }
            await page.waitForNetworkIdle();
        }
    }
}
