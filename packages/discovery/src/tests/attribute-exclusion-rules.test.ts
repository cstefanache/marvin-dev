import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

describe('Test Discovery - attribute exclusion rule', () => {
  it('exclusion - attribute - only name - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'name',
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="DepName Placeholder" name="DepName"  data-shrink="false" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[placeholder="DepName Placeholder"]',
      'body > input:nth-of-type(2)',
    ]);
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

  it('exclusion - attribute - only name - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'name',
            },
            {
              type: 'attribute',
              name: 'placeholder',
            },
          ],
        },
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="DepName Placeholder" name="DepName"  data-shrink="true" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="Identif" data-shrink="false">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[data-shrink="true"]',
      'input[data-shrink="false"]',
    ]);
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

  it('exclusion - one attribute - only value - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              value: ['false', 'xxx'],
            },
          ],
        },
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" data-shrink="false" placeholder="DepName" name="DepName" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class1" name="Legend">
                  <span>Identifier</span>
               </legend>
               <legend class="identifier-class2">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" data-shrink="true" name="Identif">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[placeholder="DepName"]',
      'input[data-shrink="true"]',
    ]);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[name="Legend"] > span',
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

  it('exclusion - one attribute - only value - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              value: ['false', 'true'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" data-shrink="false" placeholder="DepName" name="DepName" >Dependency Name</label>
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
            <input class="cls11" data-shrink="true" name="Identif">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[placeholder="DepName"]',
      'input[name="Identif"]',
    ]);
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
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - one attribute - only regex - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              regex: ['mui-[0-9]{1,}'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="mui-456" name="DepName" data-shrink="false" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Legend1">
                  <span>Identifier</span>
               </legend>
               <legend class="identifier-class" name="Legend2", id="id2">
               <span>Identifier</span>
            </legend>
            </fieldset>
            <input class="cls11" placeholder="mui-89-0" name="Identif" data-shrink="true">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[name="DepName"]',
      'input[name="Identif"]',
    ]);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[name="Legend1"] > span',
      'legend#id2 > span'
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - one attribute - only regex - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              regex: ['mui-[0-9]{1,}', 'DepName'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="mui-456" name="DepName" data-shrink="false" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class1" name="Legend">
                  <span>Identifier</span>
               </legend>
               <legend class="identifier-class2" name="Legend">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" placeholder="mui-89-0" name="DepName" data-shrink="true">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[data-shrink="false"]',
      'input[data-shrink="true"]',
    ]);
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

  it('exclusion - one atttribute - name and value - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'name',
              value: ['DepName'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="mui-456" data-shrink="false" >Dependency Name</label>
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
            <input class="cls11" name="Identifier" placeholder="mui-89-0" data-shrink="true">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[placeholder="mui-456"]',
      'input[name="Identifier"]',
    ]);
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
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - one attribute - name and value - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'name',
              value: ['DepName', 'Identifier'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" name="DepName" placeholder="mui-456" data-shrink="false" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" name="Identifier">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" placeholder="mui-89-0" name="Identifier" data-shrink="true">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[placeholder="mui-456"]',
      'input[placeholder="mui-89-0"]',
    ]);
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

  it('exclusion - only attribute - name and regex - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'placeholder',
              regex: ['mui-[0-9]{1,}'],
            },
          ],
        }
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="mui-456" name="DepName" data-shrink="false" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" placeholder="Identifier 1">
                  <span>Identifier</span>
               </legend>               
            </fieldset>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" placeholder="Identifier 2">
                  <span>Identifier 2</span>
               </legend>               
            </fieldset>
            <input class="cls11" placeholder="mui-89-0" name="Identifier" data-shrink="true">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[name="DepName"]',
      'input[name="Identifier"]',
    ]);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[placeholder="Identifier 1"] > span',
      'legend[placeholder="Identifier 2"] > span',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - only attribute - name and regex - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'placeholder',
              regex: ['mui-[0-9]{1,}', 'tab-[0-9]{1,}'],
            },
          ],
        }
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="mui-456" name="DepName" data-shrink="false" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" placeholder="tab-54656">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" placeholder="mui-89-0" name="Identifier" data-shrink="true">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[name="DepName"]',
      'input[name="Identifier"]',
    ]);
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

  it('exclusion - only attribute - value and regex - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              value: ['mui-456'],
              regex: ['mui-[0-9]{1,}'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="mui-456" name="DepName" data-shrink="false" >Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" placeholder="mui-54656">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" name="mui-456" placeholder="mui-89-0" role="Identifier" data-shrink="Identifier" >Identifier</label>
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
    expect(resultInput).toEqual([
      'input[name="DepName"]',
      'input[role="Identifier"]',
    ]);
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

  it('exclusion - only attribute - value and regex - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              value: ['true', 'false'],
              regex: ['mui-[0-9]{1,}', 'tab-[0-9]{1,}'],
            },
          ],
        }
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" data-shrink="false" placeholder="mui-456" name="DepName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" placeholder="tab-54656">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" data-shrink="true" name="mui-456" placeholder="mui-89-0" role="Identifier">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[name="DepName"]',
      'input[role="Identifier"]',
    ]);
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

  it('exclusion - only attribute - name and value and regex - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'data-shrink',
              value: ['true'],
              regex: ['mui-[0-9]{1,}'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" data-shrink="false" placeholder="mui-456" name="DepName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" placeholder="mui-54656">
                  <span>Identifier</span>
               </legend>
               <legend class="identifier-class" placeholder="mui-7777">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" data-shrink="true" name="mui-456" placeholder="tab-89-0" role="Identifier">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[data-shrink="false"]',
      'input[name="mui-456"]',
    ]);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual([
      'div.cls2 > span',
      'legend[placeholder="mui-54656"] > span',
      'legend[placeholder="mui-7777"] > span'
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - only attribute - name and value and regex - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'data-shrink',
              value: ['true'],
              regex: ['mui-[0-9]{1,}'],
            },
            {
              type: 'attribute',
              name: 'placeholder',
              value: ['tab-456'],
              regex: ['mui-[0-9]{1,}'],
            },
          ],
        },
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
            <body>
            <input class="cls11" placeholder="tab-456" data-shrink="false" name="DepName">Dependency Name</label>
            <div class="cls2">
               <span>Port</span>
            </div>
            <fieldset aria-hidden="true" class="legend">
               <legend class="identifier-class" placeholder="mui-54656">
                  <span>Identifier</span>
               </legend>
            </fieldset>
            <input class="cls11" data-shrink="true" name="mui-456" placeholder="tab-89-0" role="Identifier">Identifier</label>
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
    expect(resultInput).toEqual([
      'input[data-shrink="false"]',
      'input[name="mui-456"]',
    ]);
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
