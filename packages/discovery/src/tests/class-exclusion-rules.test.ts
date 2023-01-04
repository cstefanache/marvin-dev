import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

describe('Test Discovery - class exclusion rule', () => {
  it('exclusion - class - only value', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'class',
              value: ['cls11'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class1">
                  <span>Identifier</span>
               </legend>
               <legend class="identifier-class2">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls12">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" tabindex="0" type="button" id="cancel-button">Cancel</button>
            </div>
           </body>
                  `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultInput = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInput).toEqual(['body > input', 'input.cls12']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend.identifier-class1 > span',
      'legend.identifier-class2 > span'
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - class - only regex', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'class',
              regex: ['mui-[0-9]{1,}'],
            },
          ],
        },
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="mui-789">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend1">
                  <span>Identifier</span>
               </legend>
               <legend class="identifier-class" name="Legend2">
               <span>Identifier</span>
            </legend>
            </fieldset>
            <input class="cls11">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk">Add</button>
               <button class="button-clst g-dbdtjz">Cancel</button>
            </div>
           </body>
                  `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultInput = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInput).toEqual(['body > input', 'input.cls11']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[name="Legend1"] > span',
      'legend[name="Legend2"] > span'
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual(['button.g-1lig5nk', 'button.g-dbdtjz']);
  });

  it('exclusion - class - value and regex', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'class',
              value: ['cls11'],
              regex: ['mui-[0-9]{1,}'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="mui-455-class">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls12">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" tabindex="0" type="button" id="cancel-button">Cancel</button>
            </div>
           </body>
                  `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultInput = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInput).toEqual(['body > input', 'input.cls12']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual(['div.cls2 > span', 'legend > span']);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });
});
