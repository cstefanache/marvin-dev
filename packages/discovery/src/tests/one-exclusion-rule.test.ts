import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

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
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const result = discoveryResults.items?.input?.map(
      (item: any) => item.locator
    );
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
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.input?.map(
      (item: any) => item.locator
    );
    expect(result).toEqual(['#input1', '#input2']);
  });

  it('exclusion - only tag - by value - multiple matches in config', async () => {
      const discovery = new Discovery({
        aliases: {
          info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        },
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['legend', 'label'],
            },
          ],
        },
      } as Config);
      // await page.goto(`file://${process.cwd()}/packages/discovery/src/tests/pages/base.html`)
      await page.evaluate(() => {
        document.body.innerHTML = `
        <body>
        <label class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
        <div class="cls2">
           <span>Port</span>
        </div>
        <fieldset aria-hidden="true" class="legend">
           <legend class="identifier-class">
              <span>Identifier</span>
           </legend>
        </fieldset>
        <label class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
       </body>
        `;
      });
      const discoveryResults: PageDiscoveryResult =
        await discovery.discoverPage(page);
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual([
        '#mui-59-label',
        'div[class="cls2"] > span',
        '[class="identifier-class"] > span',
        '#mui-60-label',
      ]);
  });

  it('exclusion - id property - in general', async () => {
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
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.input?.map(
      (item: any) => item.locator
    );
    expect(result).toEqual(['body > input', 'input[name="input2"]']);
  });
});
