import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

describe('Test Discovery - One Exclusion rule - ID or Tag', () => {
  it('simple discovery test', async () => {
    const discovery = new Discovery({aliases: {}} as any);
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

  it('exclusion - only tag - by value - only one value matches', async () => {
    const discovery = new Discovery({
      aliases: {
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['input'],
            },
          ],
        },
      }
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

  it('exclusion - only tag - by value - multiple values match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['legend', 'label', 'aside'],
            },
          ],
        },
      }
    } as Config);
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
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(result).toEqual([
      '#mui-59-label',
      'div > span',
      '.identifier-class > span',
      '#mui-60-label',
    ]);
  });

  it('exclusion - only id property - any value', async () => {
    const discovery = new Discovery({
      aliases: {
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'id',
            },
          ],
        },
      }
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
    expect(result).toEqual(['body > input:nth-of-type(1)', 'input[name="input2"]']);
  });

  it('exclusion - only id property - single value matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'id',
              value: ['mui-200'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
      <body>
      <input class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
      <div class="cls2">
         <span>Port</span>
      </div>
      <fieldset aria-hidden="true" class="legend">
         <legend class="identifier-class" id="mui-200">
            <span>Identifier</span>
         </legend>
      </fieldset>
      <input class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
     </body>
            `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultInput = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInput).toEqual(['input#mui-59-label', 'input#mui-60-label']);
    const resultInfo = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfo).toEqual(['div > span', 'legend > span']);
  });

  it('exclusion - only id property - multiple values match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'id',
              value: ['mui-200', 'mui-60-label', 'add-button', 'xxxx'],
            },
          ],
        },
      }
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
      <body>
      <input class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
      <div class="cls2">
         <span>Port</span>
      </div>
      <fieldset aria-hidden="true" class="legend">
         <legend class="identifier-class" id="mui-200">
            <span>Identifier</span>
         </legend>
      </fieldset>
      <input class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
      <div class="g-1t62lt9">
         <button class="button-clst g-1lig5nk" type="submit" id="add-button"disabled="">Add</button>
         <button class="button-clst g-dbdtjz" type="cancel" id="cancel-button">Cancel</button>
      </div>
     </body>
            `;
    });

    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const resultInfos = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfos).toEqual(['div.cls2 > span', 'legend > span']);
    const resultInputs = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInputs).toEqual(['input#mui-59-label', 'input[for="mui-60"]']);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button[type="submit"]',
      'button#cancel-button',
    ]);
  });

  it('exclusion - only id property - single regex matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'id',
              regex: ['mui-[0-9]{1,}', 'tab-[0-9]{1,}'],
            },
          ],
        },
      }
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
      <body>
      <input class="cls1" data-shrink="false" placeholder="Dependency Name" id="mui-59-label">Dependency Name</label>
      <div class="cls2">
         <span>Port</span>
      </div>
      <fieldset aria-hidden="true" class="legend">
         <legend data="legend1" class="identifier-class" id="mui-200">
            <span>Identifier</span>
         </legend>
         <legend data="legend2" class="identifier-class" id="mui-200">
            <span>Identifier</span>
         </legend>
      </fieldset>
      <input class="cls1" data-shrink="false" placeholder="Identifier" id="mui-60-label">Identifier</label>
      <div class="g-1t62lt9">
         <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="add-button"disabled="">Add</button>
         <button class="button-clst g-dbdtjz" tabindex="0" type="button" id="cancel-button">Cancel</button>
      </div>
     </body>
            `;
    });

    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const resultInfos = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfos).toEqual([
      'div.cls2 > span',
      'legend[data="legend1"] > span',
      'legend[data="legend2"] > span',
    ]);
    const resultInputs = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInputs).toEqual([
      'input[placeholder="Dependency Name"]',
      'input[placeholder="Identifier"]',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - only id property - multiple regex match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'id',
              regex: [
                'mui-[0-9]{1,}',
                'tab-[0-9]{1,}',
                'add-button',
                'xxx-[0-9]{1,}',
              ],
            },
          ],
        },
      }
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
      <body>
      <input class="cls1" data-shrink="false" placeholder="Dependency Name" id="tab-59-label">Dependency Name</label>
      <div class="cls2">
         <span>Port</span>
      </div>
      <fieldset aria-hidden="true" class="legend">
         <legend class="identifier-class" id="mui-200">
            <span>Identifier</span>
         </legend>
      </fieldset>
      <input class="cls1" data-shrink="false" placeholder="Identifier" id="mui-60-label">Identifier</label>
      <div class="g-1t62lt9">
         <button class="button-clst g-1lig5nk" type="submit" id="add-button"disabled="">Add</button>
         <button class="button-clst g-dbdtjz" tabindex="0" type="button" id="cancel-button">Cancel</button>
      </div>
     </body>
            `;
    });

    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const resultInfos = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfos).toEqual(['div.cls2 > span', 'legend > span']);
    const resultInputs = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInputs).toEqual([
      'input[placeholder="Dependency Name"]',
      'input[placeholder="Identifier"]',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button[type="submit"]',
      'button#cancel-button',
    ]);
  });

  it('exclusion - only id property - value and regex - single match', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'id',
              regex: ['mui-[0-9]{1,}', 'xxx-[0-9]{1,}'],
              value: ['tab-59-label', 'yyyy'],
            },
          ],
        },
      }
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
      <body>
      <input class="cls1" data-shrink="false" placeholder="Dependency Name" id="tab-59-label">Dependency Name</label>
      <div class="cls2">
         <span>Port</span>
      </div>
      <fieldset aria-hidden="true" class="legend">
         <legend class="identifier-class" id="mui-200">
            <span>Identifier</span>
         </legend>
      </fieldset>
      <input class="cls1" data-shrink="false" placeholder="Identifier" id="mui-60-label">Identifier</label>
      <div class="g-1t62lt9">
         <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="add-button"disabled="">Add</button>
         <button class="button-clst g-dbdtjz" tabindex="0" type="button" id="cancel-button">Cancel</button>
      </div>
     </body>
            `;
    });

    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const resultInfos = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfos).toEqual(['div.cls2 > span', 'legend > span']);
    const resultInputs = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInputs).toEqual([
      'input[placeholder="Dependency Name"]',
      'input[placeholder="Identifier"]',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button#add-button',
      'button#cancel-button',
    ]);
  });

  it('exclusion - only id property - value and regex - multiple matches', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'attribute',
              name: 'id',
              regex: ['mui-[0-9]{1,}', 'tab-[0-9]{1,}', 'xxx-[0-9]{1,}'],
              value: ['tab-add-button', 'tab-cancel-button', 'yyyy'],
            },
          ],
        }
      }
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
      <body>
      <input class="cls1" data-shrink="false" placeholder="Dependency Name" id="tab-59-label">Dependency Name</label>
      <div class="cls2">
         <span>Port</span>
      </div>
      <fieldset aria-hidden="true" class="legend">
         <legend class="identifier-class" id="mui-200">
            <span>Identifier</span>
         </legend>
      </fieldset>
      <input class="cls1" data-shrink="false" placeholder="Identifier" id="mui-60-label">Identifier</label>
      <div class="g-1t62lt9">
         <button class="button-clst g-1lig5nk" type="submit" id="tab-add-button"disabled="">Add</button>
         <button class="button-clst g-dbdtjz" type="button" id="tab-cancel-button">Cancel</button>
      </div>
     </body>
            `;
    });

    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const resultInfos = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(resultInfos).toEqual(['div.cls2 > span', 'legend > span']);
    const resultInputs = discoveryResults.items?.input.map(
      (item: any) => item.locator
    );
    expect(resultInputs).toEqual([
      'input[placeholder="Dependency Name"]',
      'input[placeholder="Identifier"]',
    ]);
    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'button[type="submit"]',
      'button[type="button"]',
    ]);
  });

  it('exclusion - tag - only one direct parent excluded - one child', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['legend', 'label', 'aside'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
        <body>
        <label class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
        <div class="cls2">
           <span>Port</span>
        </div>
        <fieldset aria-hidden="true" class="legend">
           <legend class="cls2">
              <span>Identifier</span>
           </legend>
        </fieldset>
        <label class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
       </body>
        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(result).toEqual([
      '#mui-59-label',
      'div > span',
      'fieldset span',
      '#mui-60-label',
    ]);
  });

  it('exclusion - tag - multiple direct parents excluded - one child', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['legend', 'label', 'aside'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
        <body>
        <label class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
        <div class="cls2">
           <span>Port</span>
        </div>
        <fieldset aria-hidden="true" class="legend">
           <legend class="cls2">
              <aside>
                <span>Identifier</span>
              </aside>
           </legend>
        </fieldset>
        <label class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
       </body>
        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(result).toEqual([
      '#mui-59-label',
      'div > span',
      'fieldset span',
      '#mui-60-label',
    ]);
  });
  it('exclusion - tag - multiple direct parents excluded - multiple children under the same excluded parent', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['legend', 'label', 'aside'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
        <body>
        <label class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
        <div class="cls2">
           <span>Port</span>
        </div>
        <fieldset aria-hidden="true" class="legend">
           <legend class="cls2">
              <aside>
                <span id="id1">Identifier</span>
              </aside>
              <aside>
                <span id="id2">Identifier</span>
              </aside>
           </legend>
        </fieldset>
        <label class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
       </body>
        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(result).toEqual([
      '#mui-59-label',
      'div > span',
      'span#id1',
      'span#id2',
      '#mui-60-label',
    ]);
  });

  it('exclusion - tag - multiple direct parents excluded - multiple children under different excluded parents', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['legend', 'label', 'aside'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
        <body>
        <label class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
        <div class="cls2">
           <span>Port</span>
        </div>
        <fieldset aria-hidden="true" class="legend1">
           <legend class="cls2">
              <aside>
                <span>Identifier</span>
              </aside>
           </legend>
        </fieldset>
        <fieldset aria-hidden="true" class="legend2">
           <legend class="cls2">
              <aside>
                <span>Identifier</span>
              </aside>
           </legend>
        </fieldset>
        <label class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
       </body>
        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(result).toEqual([
      '#mui-59-label',
      'div > span',
      'fieldset.legend1 span',
      'fieldset.legend2 span',
      '#mui-60-label',
    ]);
  });

  it('exclusion - tag - multiple direct parents excluded - one child - multiple levels ', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          exclude: [
            {
              type: 'tag',
              value: ['legend', 'label', 'aside'],
            },
          ],
        },
      }
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
        <body>
        <label class="cls1" data-shrink="false" for="mui-59" id="mui-59-label">Dependency Name</label>
        <div class="cls2">
           <span>Port</span>
        </div>
         <fieldset>
           <legend class="cls2">
              <aside>
                 <label>
                   <span>Identifier</span>
                </label>
              </aside>
           </legend>
         </fieldset>
        <label class="cls1" data-shrink="false" for="mui-60" id="mui-60-label">Identifier</label>
       </body>
        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );
    const result = discoveryResults.items?.info.map(
      (item: any) => item.locator
    );
    expect(result).toEqual([
      '#mui-59-label',
      'div > span',
      'fieldset',
      'fieldset span',
      '#mui-60-label',
    ]);
  });
});
