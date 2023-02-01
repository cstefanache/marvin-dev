import Discovery from '../discovery';
import { Config } from '../models/config';
import { PageDiscoveryResult } from '../models/models';

describe('Use of nth-of-type to identify the elements', () => {
  it('Same elements under the same div', async () => {
    const discovery = new Discovery({
      aliases: {
        action: [{ name: 'Link', selectors: ['a'] }],
        store: []
      },
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
                  <body>
                     <div class='cls1'>
                       <p>
                         <a href="#">Forgot password</a>
                      </p>
                      <p>
                         <a href="#">Sign Up</a>
                      </p>
                      <p>
                         <a href="#">Sign In</a>
                      </p>
                     </div>
                 </body>
                        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );

    expect(resultActions).toEqual([
      'div > p:nth-of-type(1) > a',
      'div > p:nth-of-type(2) > a',
      'div > p:nth-of-type(3) > a',
    ]);
  });

  it('Same elements under different divs, with different paths', async () => {
    const discovery = new Discovery({
      aliases: {
        action: [{ name: 'Link', selectors: ['a'] }],
      },
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
                  <body>
                     <div class='cls1'>
                       <p>
                         <a href="#">Forgot password</a>
                      </p>
                     </div>
                     <div class='cls2'>
                      <p>
                        <a href="#">Sign Up</a>
                      </p>
                      <p>
                        <a href="#">Sign In</a>
                      </p>
                    </div>
                 </body>
                        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'div.cls1 > p > a',
      'div.cls2 > p:nth-of-type(1) > a',
      'div.cls2 > p:nth-of-type(2) > a'
    ]);
  });

  it('Same elements under different divs, with the same paths', async () => {
    const discovery = new Discovery({
      aliases: {
        action: [{ name: 'Link', selectors: ['a'] }],
      },
    } as Config);

    await page.evaluate(() => {
      document.body.innerHTML = `
                  <body>
                     <div class='cls1'>
                       <p>
                         <a href="#">Forgot password</a>
                      </p>
                     </div>
                     <div class='cls1'>
                      <p>
                        <a href="#">Sign Up</a>
                      </p>
                      <p>
                        <a href="#">Sign In</a>
                      </p>
                    </div>
                 </body>
                        `;
    });
    const discoveryResults: PageDiscoveryResult = await discovery.discoverPage(
      page
    );

    const resultActions = discoveryResults.items?.actions.map(
      (item: any) => item.locator
    );
    expect(resultActions).toEqual([
      'body > div:nth-of-type(1) > p > a',
      'body > div:nth-of-type(2) > p:nth-of-type(1) > a',
      'body > div:nth-of-type(2) > p:nth-of-type(2) > a'
    ]);
  });
});
