import { Page } from 'puppeteer';
import Flow from './flow';
import { Aliases, Config, Sequence } from './models/config';
import { ActionItem, Actions, IdentifiableIterator } from './models/models';
import { State } from './state';
import { log } from './utils/logger';
import { processUrl } from './utils/processes';

const library = {
  func: {
    random: () => Math.random()
  }
}

export default class Runner {
  constructor(
    private readonly config: Config,
    private readonly flow: Flow,
    private readonly state: State | undefined
  ) {}

  public async run(
    page: Page,
    sequence: String[],
    sequenceCallback?: Function
  ) {
    const { graph, actions, store } = this.flow.flow;
    let currentStep = graph;
    for (const step of sequence) {
      let url = page.url();
      url = processUrl(url, this.config.aliases.urlReplacers);
      log(`Current path: ${url}`, 'yellow');
      let action = currentStep.find(
        (item: ActionItem) => item.sequenceStep === step
      );

      if (action) {
          const { method: methodName, parameters } = action;
          const urlActions = actions[url];
          let method: any;
          console.log('------------------');
          if (urlActions) {
            method = urlActions.find(
              (item: Actions) => item.method === methodName
            );
          } else {
            throw new Error(
              `Current path ${url} not found in flow. Please update your flow according to the latest discovered pages`
            );
          }


          let index = 1
          do {
          if (method) {
            let prefix = ''
            if (method.iterator && this.config.aliases.iterators) {
              const iteratorName = method.iterator.name;
              log(
                `Starting iterator for ${this.config.aliases.iterators.length} iterator definitions`
              );
              const iteratorConfig = this.config.aliases.iterators.find(
                (configIterator) => configIterator.name === iteratorName
              );
  
              if (iteratorConfig && iteratorConfig.elements) {
                for (const rootSelector of iteratorConfig.selectors) {
                  const rootElements = await page.$$(rootSelector);
                  const iteratorDef : IdentifiableIterator = method.iterator
  
                  if (rootElements && rootElements.length) {
                    for (const [index, rootElem] of rootElements.entries()) {
                      const iteratorIdentifierElem = iteratorDef.identifier
                        ? await rootElem.$(iteratorDef.identifier)
                        : rootElem;
  
                      const uid = iteratorDef ? iteratorDef.uid : 'root';
                      if (iteratorIdentifierElem) {
                        const text = (await iteratorIdentifierElem.evaluate(
                          (el) => el.textContent
                        )) as string;
                        console.log(
                          `[${index}] ${uid}: ${text} - ${parameters[uid]}`
                        );
                        if ((store && store[uid]) || text === parameters[uid]) {
                          prefix = `${rootSelector}:nth-of-type(${index + 1})`;
                          break;
                        }
                      }                
                    }
                  }
                  if (prefix) {
                    break;
                  }
                }
              } else {
                throw new Error(`Missing iterator config for ${iteratorName}`);
              }
  
              if (prefix === '') {
                throw new Error(
                  `No root element found for ${iteratorName} for parameters ${JSON.stringify(
                    parameters
                  )}`
                );
              }
            }
            for (const sequenceItem of method.sequence) {
              let { type, uid, locator } = sequenceItem;
              locator = `${prefix !== '' ? prefix : ''}${
                prefix !== '' && locator ? ' ' : ''
              }${locator || ''}`;
              if (type === 'fill' && uid && parameters[uid]) {
                log(`Filling ${locator} with ${parameters[uid]}`, 'yellow');
                // await element.type(parameters[locator]);
                // await page.$eval(locator, (e: any) => e.blur());
                await page.focus(locator);
                if (store && store[uid]) {
                  store[uid].includes("$") ? await page.keyboard.type(eval(store[uid])) : await page.keyboard.type(store[uid])
                } else {
                  parameters[uid].includes("$") ? await page.keyboard.type(eval(parameters[uid])) : await page.keyboard.type(parameters[uid])
                }
              } else {
                const element = await page.$(locator);
                if (element) {
                  var attributes = await page.evaluate(
                    (element) =>
                      Array.from(element.attributes, ({ name, value }) => [
                        name,
                        value,
                      ]),
                    element
                  );
                  const text = await element.evaluate((el) =>
                    el.textContent?.trim()
                  );
                  log(`Clicking on ${text}`, 'yellow');
                  await element.click();
                  log(`Clicked on ${text}`, 'yellow');
                }
              }
            }
            try {
              await page.waitForNetworkIdle({
                timeout: this.config.defaultTimeout,
              });
            } catch (e) {
              log('Network idle timeout. Runner will continue.', 'red');
              if (this.state) {
                this.state.reportOnPendingRequests();
              }
            }
            if (sequenceCallback) {
              sequenceCallback(action.id);
            }
            await this.flow.stateScreenshot(page, action.id);
          } else {
            throw new Error(`Method ${methodName} not found`);
          }
          index++
        } while (index <= action.loop)
      } else {
        throw new Error(`Action ${step} not found in flow`);
      }

      const exitUrl = await page.url();
      action.exitUrl = processUrl(exitUrl, this.config.aliases.urlReplacers);
      if (action.children) {
        currentStep = action.children;
      } else {
        currentStep = [];
      }
    }

    log(`Sequence ended on page: ${page.url()}`, 'green');
  }
}
