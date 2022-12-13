import Discovery from './discovery';
import {Config} from './models/config';
import {PageDiscoveryResult} from './models/models';

describe('Test Local', () => {
    const discovery = new Discovery({} as Config);
    it('simple discovery test', async () => {
        await page.evaluate(() => {
            document.body.innerHTML += `
            <!DOCTYPE html>
                <html>
                    <body>
                        <h1>My First Heading</h1>
                        <p>My first paragraph.</p>
                        <input type="text" id="input1" />
                        <input type="text" name="input2" />

                    </body>
                </html>
            `;
        });
        const discoveryResults: PageDiscoveryResult =
            await discovery.discoverPage(page);

        console.log(discoveryResults);
    });
});
