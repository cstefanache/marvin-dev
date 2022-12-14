import Discovery from '../../discovery';
import {Config} from '../../models/config';
import {PageDiscoveryResult} from '../../models/models';

describe('Test discovery', () => {
    it('exclusion - id and tag property', async () => {
        const discovery = new Discovery({
            optimizer: {
                exclude: [
                    {
                        type: 'tag',
                        value: ['input'],
                    },
                    {
                        type: 'attribute',
                        name: 'id',
                    },
                ],
            },
        } as Config);
        await page.evaluate(() => {
            document.body.innerHTML = `
                <body>                        
                    <input id="input1" type="text" name="name_input1"/>
                    <input id="input2" type="text" name="name_input2" />
                </body>
            `;
        });
        const discoveryResults: PageDiscoveryResult =
            await discovery.discoverPage(page);
        const result = discoveryResults.items?.input?.map(item => item.locator);
        expect(result).toEqual([
            '[name="name_input1"]',
            '[name="name_input2"]',
        ]);
    });
});
