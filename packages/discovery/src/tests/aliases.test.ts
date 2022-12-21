import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

describe('Test Discovery - Identify aliases', () => {
  it('Duplicate Aliases', async () => {
    const discovery = new Discovery({
      aliases: {
        info: [
          { name: 'info', selectors: ['span','label', 'h3', 'h5'] },
          { name: 'para', selectors: ['p']}
        ],
      },
    } as Config);
    await page.evaluate(() => {
      document.body.innerHTML = `
      <body>
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
     </body>
            `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultInput = discoveryResults.items?.info?.map(
      (item: any) => item.locator
    );
   // expect(resultInput).toEqual(['label', 'span', 'h3', 'p']);
  });
});
