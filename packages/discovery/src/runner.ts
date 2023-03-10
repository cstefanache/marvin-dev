import { Page } from 'puppeteer';
import Flow from './flow';
import { Config, KeyValuePair, Sequence, Alias } from './models/config';
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
  lastActionId: string | undefined;
  constructor(
    private readonly config: Config,
    private readonly flow: Flow,
    private readonly state: State | undefined
  ) {
    this.store = { library };
    global.store = this.store;
  }

  private assert(
    actual: any,
    expected: any,
    op: string,
    isNumber: boolean
  ): boolean {
    try {
      if (isNumber && !isNaN(actual) && !isNaN(expected)) {
        actual = parseFloat(actual);
        expected = parseFloat(expected);
      }
    } catch (e) {
      log('Error at converting the string to a number');
    }

    switch (op) {
      case 'eq':
        return actual === expected;
      case 'neq':
        return actual !== expected;
      case 'gt':
        return actual > expected;
      case 'gte':
        return actual >= expected;
      case 'lt':
        return actual < expected;
      case 'lte':
        return actual <= expected;
      case 'contains':
        return actual.includes(expected);
      case 'ncontains':
        return !actual.includes(expected);
      default:
        return false;
    }
  }

  private evaluateExpression(exp: string) {
    return eval('`' + exp + '`');
  }

  private getFlowIterators(method: Actions): IdentifiableIterator[] {
    const iterators: IdentifiableIterator[] = [];
    for (const seq of method.sequence) {
      if (seq.iterator) {
        iterators.push(seq.iterator);
      }
    }
    return iterators;
  }

  private async findIteratorDefinition(
    iterators: IdentifiableIterator[],
    name: string
  ): Promise<IdentifiableIterator> {
    return iterators.find((it) => it.name === name);
  }

  private async executeMethod(
    method: Actions,
    page: Page,
    parameters: any
  ): Promise<void> {
    let prefix = '';
    const methodIterators = this.getFlowIterators(method);
    if (methodIterators.length > 0 && this.config.aliases.iterators) {
      log(
        `Starting iterator for ${this.config.aliases.iterators.length} iterator definitions`
      );
      let iteratorConfig: Alias | undefined;
      for (const iterator of methodIterators) {
        iteratorConfig = this.config.aliases.iterators.find(
          (it) => it.name === iterator.name
        );
      }
      if (iteratorConfig) {
        for (const rootSelector of iteratorConfig.selectors) {
          const rootElements = await page.$$(rootSelector);
          const iteratorDef: IdentifiableIterator =
            await this.findIteratorDefinition(
              methodIterators,
              iteratorConfig.name
            );

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
                log(
                  `${index
                    .toString()
                    .padStart(3)}: |${resultEvaluation}|${text}|`,
                  'yellow'
                );
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
        throw new Error(`Missing iterator config for ${iteratorConfig.name}`);
      }

      if (prefix === '') {
        log(
          `No root element found for ${
            iteratorConfig.name
          } for parameters ${JSON.stringify(parameters)}`
        );
        return;
      }
    }

    for (const sequenceItem of method.sequence) {
      let { type, uid, op, isNumber, locator, iterator } = sequenceItem;
      locator = iterator
        ? `${prefix !== '' ? prefix : ''}${
            prefix !== '' && locator ? ' ' : ''
          }${locator || ''}`
        : locator;
      log(`Executing sequence: [${type}]: ${locator}`);
      const element = await page.$(locator);
      if (!element) {
        log(`Element ${locator} not found`, 'red');
        continue;
      }
      if (type === 'check') {
        try {
          const text = await element.evaluate((el) => el.textContent?.trim());
          const value = await page.evaluate(
            (locator) => (document.querySelector(locator) as any).value,
            locator
          );
          const valueToValidate = this.evaluateExpression(parameters[uid]);

          log(
            `Checking ${text} | ${value} against ${valueToValidate} for (${locator})`,
            'yellow'
          );
          if (op) {
            if (value) {
              if (!this.assert(value, valueToValidate, op, isNumber)) {
                log(
                  `Failed to assert ${value} ${op} ${valueToValidate}`,
                  'red'
                );
              } else {
                log(
                  `Assertion passed for ${value} ${op} ${valueToValidate}`,
                  'green'
                );
              }
            } else {
              if (!this.assert(text, valueToValidate, op, isNumber)) {
                log(`Failed to assert ${text} ${op} ${valueToValidate}`, 'red');
              } else {
                log(
                  `Assertion passed for ${value} ${op} ${valueToValidate}`,
                  'green'
                );
              }
            }
          }
        } catch (err) {
          log(`Error on checking`, 'red');
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
          await element.hover();
          await element.focus();
          const text = await element.evaluate((el) => el.textContent?.trim());
          log(`Clicking on ${text} (${locator})`, 'yellow');
          // await element.screenshot({ path: 'example.png' });
          await element.evaluate((el: any) => el.click());
          log(`Clicked on ${text}`, 'yellow');
        } else {
          log(`Element ${locator} not found`, 'red');
        }
      }

      if (sequenceItem.store) {
        await page.evaluate((element: any) => element.blur(), element);
        log(`Locator: ${locator}`, 'red');
        const value = await page.evaluate(
          (element: any) => element.value,
          element
        );
        const text = await element.evaluate(
          (el: any) => el.textContent?.trim(),
          element
        );

        await element.screenshot({ path: 'example.png' });
        // const key = parameters[uid];
        const key = sequenceItem.storeName;
        this.store[key] = value || text;
        log(
          `Stored ${key} as ${this.store[key]} from ${value} ${text}`,
          'yellow'
        );
      }
    }
  }

  public async performScreenshotForLastAction(page: Page): Promise<void> {
    await this.flow.stateScreenshot(page, this.lastActionId);
  }

  private async executeStep(
    page: Page,
    executionSteps: ActionItem[],
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
    if (executionSteps.length === 0) {
      return;
    }
    let action = executionSteps.find(
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
      this.lastActionId = action.id;
      if (action.children && action.children.length && steps.length > 1) {
        await this.executeStep(
          page,
          action.children,
          [...steps].slice(1),
          sequenceCallback
        );
      }
    };

    if (action) {
      log(`Executing sequence: ${currentStepToExecute}`);
      action.url = url;
      const { method: methodName, loop, methodLoop, parameters } = action;
      const urlActions = actions.filter(
        (item: Actions) =>
          (!item.isGlobal && item.path === url) || item.isGlobal
      );
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
