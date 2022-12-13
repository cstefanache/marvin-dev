import Discovery from './discovery';
import {Config} from './models/config';
import {PageDiscoveryResult} from './models/models';

describe('Test Local', () => {
    const discovery = new Discovery({} as Config);
    it('simple discovery test', async () => {
        await page.goto(`file://${process.cwd()}/specs/pages/basic.html`);
        const discoveryResults: PageDiscoveryResult =
            await discovery.discoverPage(page);

        console.log(discoveryResults);
    });
});
