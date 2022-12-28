import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';


describe('Test Discovery - Iterators', () => {
    it('Only by name identifier', async () => {
      const discovery = new Discovery({
        aliases: {
          info: [
            { name: 'info', selectors: ['span', 'label', 'h3', 'h5'] },
            { name: 'para', selectors: ['p', 'legend'] },
          ],
          action: [{ name: 'customButton', selectors: ['button', 'fieldset'] }],
          input: [
            {
              selectors: ['input'],
            },
          ],
          iterators: [
            {
                name: "Select Company By Name",
                selectors: ["form > div"],
                identifiers: [
                    {
                        name: "Company Name"
                    }
                ]
            }
        ]
        },
      } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
        <body>
          <input id="input1" type="text" name="name_input1"/>
          <input id="input2" type="text" name="name_input2" />
        <div class="cls2">
           <label>Label1</label>
           <span>Port</span>
        </div>
        <h3>First Title</h3>
        <fieldset aria-hidden="true" class="legend">
           <legend class="identifier-class" name="Legend">
              <p>Label2</p>
           </legend>
        </fieldset>
        <h5>Second Title</h5>
        <div class="g-1t62lt9">
            <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="add-button" disabled="">Add</button>
            <button class="button-clst g-dbdtjz" tabindex="0" type="button" id="cancel-button">Cancel</button>
        </div>
        <form>
           <div>Ascentcore</div>
           <div>Gremlin Inc.</div>
           <div>Gremlin UAT</div>
        </form>
       </body>
              `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
  
      const resultInfo = discoveryResults.items?.info?.map(
        (item: any) => item.locator
      );
      expect(resultInfo).toEqual(['label', 'span', 'h3', 'h5', 'legend', 'p']);
      const resultAction = discoveryResults.items?.actions?.map(
        (item: any) => item.locator
      );
      expect(resultAction).toEqual([
        'fieldset',
        'button#add-button',
        'button#cancel-button',
      ]);
      const resultInput = discoveryResults.items?.input?.map(
        (item: any) => item.locator
      );
      expect(resultInput).toEqual(['input#input1', 'input#input2']);

      const resultIteration = discoveryResults.items?.iterable
      expect(resultIteration).toEqual([
        {
          text: 'Select Company By Name',
          locator: 'form > div',
          identifiers: []
        }
      ])
    });

    it('By name and selector ', async () => {
      const discovery = new Discovery({
        aliases: {
          info: [
            { name: 'info', selectors: ['span', 'label', 'h3', 'h5'] },
            { name: 'para', selectors: ['p', 'legend'] },
          ],
          action: [{ name: 'customButton', selectors: ['button', 'fieldset'] }],
          input: [
            {
              selectors: ['input'],
            },
          ],
          iterators: [
            {
                name: "Select Company By Name",
                selectors: ["form > div"],
                identifiers: [
                    {
                        name: "Company Name", selector: ".card button"
                    }
                ]
            }
        ]
        },
      } as Config);
      await page.evaluate(() => {
        document.body.innerHTML = `
        <body>
          <input id="input1" type="text" name="name_input1"/>
          <input id="input2" type="text" name="name_input2" />
        <div class="cls2">
           <label>Label1</label>
           <span>Port</span>
        </div>
        <h3>First Title</h3>
        <fieldset aria-hidden="true" class="legend">
           <legend class="identifier-class" name="Legend">
              <p>Label2</p>
           </legend>
        </fieldset>
        <h5>Second Title</h5>
        <div class="g-1t62lt9">
            <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="add-button" disabled="">Add</button>
            <button class="button-clst g-dbdtjz" tabindex="0" type="button" id="cancel-button">Cancel</button>
        </div>
        <form>
           <div calss="card>
              <label>Ascentcore</label>
              <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="submit-button" disabled="">Submit</button>
           </div>
           <div calss="card>
              <label>Gremlin Inc.</label>
              <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="submit-button" disabled="">Submit</button>
           </div>
           <div calss="card>
              <label>Gremlin UAT</label>
              <button class="button-clst g-1lig5nk" tabindex="-1" type="submit" id="submit-button" disabled="">Submit</button>
           </div>
        </form>
       </body>
              `;
      });
      const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
        page
      );
  
      const resultInfo = discoveryResults.items?.info?.map(
        (item: any) => item.locator
      );
      expect(resultInfo).toEqual(['label', 'span', 'h3', 'h5', 'legend', 'p']);
      const resultAction = discoveryResults.items?.actions?.map(
        (item: any) => item.locator
      );
      expect(resultAction).toEqual([
        'fieldset',
        'button#add-button',
        'button#cancel-button',
      ]);
      const resultInput = discoveryResults.items?.input?.map(
        (item: any) => item.locator
      );
      expect(resultInput).toEqual(['input#input1', 'input#input2']);

      const resultIteration = discoveryResults.items?.iterable
      expect(resultIteration).toEqual([
        {
          text: 'Select Company By Name',
          locator: 'form > div',
          identifiers: []
        }
      ])
    })
  });