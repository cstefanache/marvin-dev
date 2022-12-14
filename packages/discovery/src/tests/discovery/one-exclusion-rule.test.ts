import Discovery from '../../discovery';
import {Config} from '../../models/config';
import {PageDiscoveryResult} from '../../models/models';

describe('Test discovery - One Exclusion rule', () => {
    it('simple discovery test', async () => {
        const discovery = new Discovery({} as Config);
        await page.evaluate(() => {
            document.body.innerHTML = `
                <body>
                    <h1>My First Heading</h1>
                    <p>My first paragraph.</p>
                    <input type="text" id="input1" />
                    <input type="text" name="input2" />
                </body>
            `;
        });
        const discoveryResults: PageDiscoveryResult =
            await discovery.discoverPage(page);

        const result = discoveryResults.items?.input?.map((item: any) => item.locator);
        expect(result).toEqual(['input#input1', 'input[name="input2"]']);
    });

    it('exclusion - only tag - by value - only one match', async () => {
        const discovery = new Discovery({
            optimizer: {
                exclude: [
                    {
                        type: 'tag',
                        value: ['input'],
                    },
                ],
            },
        } as Config);
        await page.evaluate(() => {
            document.body.innerHTML = `
                <body>                        
                    <input id="input1" type="text"/>
                    <input id="input2" type="text" name="input2" />
                </body>
            `;
        });
        const discoveryResults: PageDiscoveryResult =
            await discovery.discoverPage(page);
        const result = discoveryResults.items?.input?.map((item: any) => item.locator);
        expect(result).toEqual(['#input1', '#input2']);
    });

    it('exclusion - only tag - by value - multiple matches', async () => {
        
    });

    it('exclusion - only tag - by regex - only one match', async () => {});

    it('exclusion - only tag - by regex - multiple matches', async () => {});

    it('exclusion - only tag - by regex & by value - only one match per each value / regex', async () => {});

    it('exclusion - only tag - by regex & by value - multiple matches per each value / regex', async () => {});

    it('exclusion - id property', async () => {
        const discovery = new Discovery({
            optimizer: {
                exclude: [
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
                    <input id="input1" type="text"/>
                    <input id="input2" type="text" name="input2" />
                </body>
            `;
        });
        const discoveryResults: PageDiscoveryResult =
            await discovery.discoverPage(page);
        const result = discoveryResults.items?.input?.map((item: any) => item.locator);
        expect(result).toEqual(['body > input', 'input[name="input2"]']);
    });
});
