import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

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
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.input?.map(
      (item: any) => item.locator
    );
    expect(result).toEqual(['[name="name_input1"]', '[name="name_input2"]']);
  });

  it('exclusion - id and attribute name', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'attribute',
            name: 'id',
          },
          {
            type: 'attribute',
            name: 'name',
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="DepName Placeholder" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual([
      'input[placeholder="DepName Placeholder"]',
      'body > input',
    ]);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual(['div.cls2 > span', 'legend > span']);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button[type="submit"]',
      'button[type="button"]',
    ]);
  });

  it('exclusion - id and attribute name and value', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'attribute',
            name: 'id',
          },
          {
            type: 'attribute',
            name: 'name',
            value: ['DepName'],
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="DepName Placeholder" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual([
      'input[placeholder="DepName Placeholder"]',
      'input[name="Identif"]',
    ]);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[name="Legend"] > span',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button[type="submit"]',
      'button[type="button"]',
    ]);
  });

  it('exclusion - id and attribute name and regex', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'attribute',
            name: 'id',
          },
          {
            type: 'attribute',
            name: 'name',
            value: ['DepName'],
          },
          {
            type: 'attribute',
            name: 'placeholder',
            regex: ['mui-[0-9]{1,}'],
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="mui-6788" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" role="mui-7888" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['body > input', 'input[role="mui-7888"]']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[name="Legend"] > span',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button[type="submit"]',
      'button[type="button"]',
    ]);
  });

  it('exclusion - id and class', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'attribute',
            name: 'id',
          },
          {
            type: 'attribute',
            name: 'class',
            value: ['cls11'],
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" id="depName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" role="mui-7888" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['body > input', 'input[role="mui-7888"]']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[name="Legend"] > span',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button[type="submit"]',
      'button[type="button"]',
    ]);
  });

  it('exclusion - tag and attribute name', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'tag',
            value: ['legend'],
          },
          {
            type: 'attribute',
            name: 'name',
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="DepName Placeholder" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['input#depName', 'input#Identif']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual(['div.cls2 > span', '.identifier-class > span']);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - tag and class', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'tag',
            value: ['legend'],
          },
          {
            type: 'attribute',
            name: 'class',
            value: ['cls11'],
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="cls11">
               <legend class="identifier-class">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['body > input', 'input#Identif']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual(['div.cls2 > span', '.identifier-class > span']);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - tag, id, and class', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'tag',
            value: ['legend'],
          },
          {
            type: 'attribute',
            name: 'id',
            value: ['depName'],
          },
          {
            type: 'attribute',
            name: 'class',
            value: ['cls11'],
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="DepName Placeholder" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls11">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['input[name="DepName"]', 'input#Identif']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual(['body > div > span', '[name="Legend"] > span']);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - tag, id, and attribute', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'tag',
            value: ['legend'],
          },
          {
            type: 'attribute',
            name: 'id',
            value: ['depName'],
          },
          {
            type: 'attribute',
            name: 'name',
            value: ['Legend'],
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="DepName Placeholder" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls11">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['input[name="DepName"]', 'input#Identif']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls11 > span',
      '.identifier-class > span',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - no match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
      optimizer: {
        exclude: [
          {
            type: 'tag',
            value: ['zzz'],
          },
          {
            type: 'attribute',
            name: 'id',
            value: ['yyy'],
          },
          {
            type: 'attribute',
            name: 'name',
            value: ['zzz'],
          },
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="DepName Placeholder" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls11">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['input#depName', 'input#Identif']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls11 > span',
      'legend[name="Legend"] > span',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - not defined', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="DepName Placeholder" data-shrink="false" id="depName">Dependency Name</label>
            <div class="cls11">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false" id="Identif">Identifier</label>
            <div class="g-1t62lt9">
               <button class="button-clst g-1lig5nk" type="submit" tabindex="-1" id="add-button" disabled="">Add</button>
               <button class="button-clst g-dbdtjz" type="button" tabindex="0" id="cancel-button">Cancel</button>
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
    expect(resultInput).toEqual(['input#depName', 'input#Identif']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls11 > span',
      'legend[name="Legend"] > span',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });
});
