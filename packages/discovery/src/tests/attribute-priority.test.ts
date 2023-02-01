import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

describe('Test Discovery - attribute priority', () => {
  it('without exclusion', async () => {
    const discovery = new Discovery({
        aliases: {
          info: [{ name: 'Legend', selectors: ['span', 'label'] }],
          optimizer: {
            priority: ['data', 'placeholder', 'type', 'id']
         },
         store: []
        },
      } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData"for="mui-59">Dependency Name</label>
            <label class="cls1" data-shrink="false" for="mui-60">Identifier</label>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual(['label[data="labelData"]', 'label[for="mui-60"]']);
  })

  it('exclusion - by id - all ids', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          priority: ['data', 'placeholder', 'type', 'id'],
          exclude: [
            {
              type: 'attribute',
              name: 'id',
            },
          ],
        },
      },
    } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData" for="mui-59" id="id1">Dependency Name</label>
            <label class="cls1" data-shrink="false" for="mui-60" id="id2">Identifier</label>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual(['label[data="labelData"]', 'label[for="mui-60"]']);
  })

  it('exclusion - by id - only the ids that matches value', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          priority: ['data', 'placeholder', 'type'],
          exclude: [
            {
              type: 'attribute',
              name: 'id',
              value: ["id1"]
            },
          ],
        },
      }
    } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData" for="mui-59", id="id1">Dependency Name</label>
            <label class="cls1" data-shrink="false" for="mui-60" id="id2">Identifier</label>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual(['label[data="labelData"]', 'label#id2']);
  })

  it('exclusion - by atribute name', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          priority: ['data', 'placeholder', 'type'],
          exclude: [
            {
              type: 'attribute',
              name: 'data',
            },
          ],
        },
      },
    } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData" for="mui-59">Dependency Name</label>
            <label class="cls1" data-shrink="false" for="mui-60" id="id2">Identifier</label>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual(['label[placeholder="placeholderLabel"]', 'label#id2']);
  })
  it('exclusion - by atribute name and value', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          priority: ['data', 'placeholder', 'type'],
          exclude: [
            {
              type: 'attribute',
              name: 'data',
              value: ['labelData']
            },
          ],
        },
      }
    } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData"for="mui-59">Dependency Name</label>
            <label class="cls1" data-shrink="false" for="mui-60" data="label">Identifier</label>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual(['label[placeholder="placeholderLabel"]', 'label[data="label"]']);
  })

  it('exclusion - by id and attribute name', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          priority: ['type', 'data', 'placeholder'],
          exclude: [
            {
              type: 'attribute',
              name: 'role'
            },
            {
              type: 'attribute',
              name: 'id'
            }
          ],
        },
      }
    } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData"for="mui-59" type="type" id="id1">Dependency Name</label>
            <label class="cls1" role="text" data-shrink="false" for="mui-60" data="label" id="id2">Identifier</label>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual(['label[type="type"]', 'label[data="label"]']);
  })

  it('exclusion - any id, name attr that has a specific value', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          priority: ['role', 'type', 'data', 'placeholder'],
          exclude: [
            {
              type: 'attribute',
              name: 'role',
              value: ['role1']
            },
            {
              type: 'attribute',
              name: 'id'
            }
          ],
        },
      }
    } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData"for="mui-59" type="type" role="role1" id="id1">Dependency Name</label>
            <label class="cls1" placeholder="xxx" role="role2" data-shrink="false" for="mui-60" data="label" id="id2">Identifier</label>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const result = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      expect(result).toEqual(['label[type="type"]', 'label[role="role2"]']);
  })

  it('exclusion - tag, id, name attr that has a specific value, a specific class', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [{ name: 'Legend', selectors: ['span', 'label'] }],
        optimizer: {
          priority: ['role', 'type', 'data', 'placeholder'],
          exclude: [
            {
              type: 'tag',
              value: ['input']
            },
            {
              type: 'attribute',
              name: 'role',
              value: ['role1']
            },
            {
              type: 'attribute',
              name: 'type',
              value: ['type3']
            },
            {
              type: 'attribute',
              name: 'placeholder',
              value: ['yyy']
            },
            {
              type: 'attribute',
              name: 'data',
              value: ['label3']
            },
            {
              type: 'attribute',
              name: 'id'
            },
            {
              type: 'attribute',
              name: 'class',
              value: ['cls1']
            }
          ],
        },
      }
    } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
          <body>
            <label class="cls1" data-shrink="false" placeholder="placeholderLabel" data="labelData"for="mui-59" type="type" role="role1" id="id1">Dependency Name</label>
            <label class="cls1" placeholder="xxx" type="type" data-shrink="false" for="mui-60" data="label" id="id2">Identifier</label>
            <input data="label3" type="type3" placeholder="yyy" class="cls1 cls2 cls3"></input>
            <input data="label4" type="type5" placeholder="zzz" class="cls1 cls4 cls5"></input>
          </body>
          `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
      const resultInfo = discoveryResults.items?.info.map(
        (item: any) => item.locator
      );
      const resultInput = discoveryResults.items?.input.map((item: any) => item.locator)
      expect(resultInfo).toEqual(['label[data="labelData"]', 'label[data="label"]']);
      expect(resultInput).toEqual([ '.cls2', '[type="type5"]' ])
  })
});
