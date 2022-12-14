import Discovery from './discovery';
import {Config} from './models/config';
import {PageDiscoveryResult} from './models/models';

describe('Test discovery', () => {
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

        const result = discoveryResults.items?.input?.map(item => item.locator);
        expect(result).toEqual(['input#input1', 'input[name="input2"]']);
    });

    it('exclusion - tag name', async () => {
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
        const result = discoveryResults.items?.input?.map(item => item.locator);
        expect(result).toEqual(['#input1', '#input2']);
    });

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
        const result = discoveryResults.items?.input?.map(item => item.locator);
        expect(result).toEqual(['body > input', 'input[name="input2"]']);
    });

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
