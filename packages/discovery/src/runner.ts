import { Page } from 'puppeteer';
import Flow from './flow';
import {
  Action,
  Aliases,
  Config,
  Sequence,
  KeyValuePair,
} from './models/config';
import { ActionItem, Actions, IdentifiableIterator } from './models/models';
import { State } from './state';
import { log } from './utils/logger';
import { processUrl } from './utils/processes';

const library = {
  func: {
    random: (decimals = 1000000) => Math.floor(Math.random() * decimals),
  },
};

export default class Runner {
  store: any;
  constructor(
    private readonly config: Config,
    private readonly flow: Flow,
    private readonly state: State | undefined
  ) {
    this.store = { library };
    global.store = this.store;
  }

  private evaluateExpression(exp: string) {
    return eval('`' + exp + '`');
  }

  private async executeMethod(
    method: Actions,
    page: Page,
    parameters: any
  ): Promise<void> {
    let prefix = '';
    if (method.iterator && this.config.aliases.iterators) {
      const iteratorName = method.iterator.name;
      log(
        `Starting iterator for ${this.config.aliases.iterators.length} iterator definitions`
      );
      const iteratorConfig = this.config.aliases.iterators.find(
        (configIterator) => configIterator.name === iteratorName
      );
      if (iteratorConfig) {
        for (const rootSelector of iteratorConfig.selectors) {
          const rootElements = await page.$$(rootSelector);
          const iteratorDef: IdentifiableIterator = method.iterator;

          if (rootElements && rootElements.length) {
            for (const [index, rootElem] of rootElements.entries()) {
              const iteratorIdentifierElem = iteratorDef.identifier
                ? await rootElem.$(iteratorDef.identifier)
                : rootElem;

              const uid = iteratorDef ? iteratorDef.uid : 'root';
              if (iteratorIdentifierElem) {
                const text = (
                  (await iteratorIdentifierElem.evaluate(
                    (el) => el.textContent
                  )) as string
                ).trim();
                const resultEvaluation = this.evaluateExpression(
                  parameters[uid]
                ).trim();

                console.log(`[${index}] ${uid}: |${text}|${resultEvaluation}|`);
                // if (text === resultEvaluation) {
                if (new RegExp(resultEvaluation).test(text)) {
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
        log(
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
      log(`Executing sequence: [${type}]: ${locator}`);
      if (type === 'store') {
        const element = await page.$(locator);
        if (element) {
          const value = await page.evaluate(
            (element: any) => element.getAttribute('value'),
            element
          );
          const text = await element.evaluate((el: any) =>
            el.textContent?.trim()
          );
          const key = parameters[uid];
          this.store[key] = value || text;
          log(`Stored ${key} as ${this.store[key]}`, 'yellow');
        }
      } else if (
        (type === 'fill' || type === 'clearAndFill') &&
        uid &&
        parameters[uid]
      ) {
        log(
          `Filling ${locator} with ${this.evaluateExpression(parameters[uid])}`,
          'yellow'
        );
        await page.focus(locator);
        if (type === 'clearAndFill') {
          await page.evaluate(
            (locator) => ((document.querySelector(locator) as any).value = ''),
            locator
          );
        }
        await page.keyboard.type(this.evaluateExpression(parameters[uid]));
      } else {
        const element = await page.$(locator);
        if (element) {
          const text = await element.evaluate((el) => el.textContent?.trim());
          log(`Clicking on ${text} (${locator})`, 'yellow');
          await element.screenshot({ path: 'example.png' });
          await element.click();
          log(`Clicked on ${text}`, 'yellow');
        }
      }
    }
  }

  private async executeStep(
    page: Page,
    currentStep: ActionItem[],
    steps: string[],
    sequenceCallback?: Function
  ) {
    if (steps.length === 0) {
      return;
    }
    const { actions } = this.flow.flow;
    const currentStepToExecute = steps[0];
    let url = processUrl(
      page.url(),
      this.config.aliases.urlReplacers,
      this.config.rootUrl
    );
    log(`Current path: ${url}`, 'yellow');
    if (currentStep.length === 0) {
      return;
    }
    let action = currentStep.find(
      (item: ActionItem) => item.sequenceStep === currentStepToExecute
    );

    const continueExecution = async (action) => {
      if (sequenceCallback) {
        await sequenceCallback(action.id);
      }
      let url = processUrl(
        page.url(),
        this.config.aliases.urlReplacers,
        this.config.rootUrl
      );
      action.exitUrl = url;
      await this.flow.stateScreenshot(page, action.id);
      if (action.children && action.children.length && steps.length > 1) {
        await this.executeStep(
          page,
          action.children,
          steps.filter((_, i) => i > 0),
          sequenceCallback
        );
      }
    };

    if (action) {
      log(`Executing sequence: ${currentStepToExecute}`);
      action.url = url;
      const { method: methodName, loop, methodLoop, parameters } = action;
      const urlActions = actions[url];
      if (urlActions) {
        const method = urlActions.find(
          (item: Actions) => item.method === methodName
        );
        if (method) {
          const loopTimes = loop || 1;
          log(`Executing method ${methodName}, ${loopTimes} time(s)`);
          for (let i = 0; i < loopTimes; i++) {
            for (let j = 0; j < (methodLoop || 1); j++) {
              log(`Executing method ${methodName}, iteration: ${i}, ${j}`);
              await this.executeMethod(method, page, parameters);
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

            await continueExecution(action);
          }
        } else if (method === undefined) {
          await continueExecution(action);
        } else {
          throw new Error(`Method ${methodName} not found`);
        }
      } else {
        log(
          `Current path ${url} not found in flow. Please update your flow according to the latest discovered pages`
        );
        await continueExecution(action);
      }
    } else {
      throw new Error(`Action ${currentStepToExecute} not found in flow`);
    }
  }

  public async run(
    page: Page,
    sequence: string[],
    sequenceCallback?: Function
  ) {
    const { graph } = this.flow.flow;
    if (this.config.aliases.store) {
      this.store = {
        ...this.config.aliases.store.reduce((memo: any, item: KeyValuePair) => {
          memo[item.key] = item.value;
          return memo;
        }, {}),
        library,
      };
      global.store = this.store;
    }
    await this.executeStep(
      page,
      graph,
      sequence,
      sequence.length > 1 ? sequenceCallback : undefined
    );
    log('Finished sequence execution', 'blue');
  }
}
