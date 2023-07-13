/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
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
  ) {}

  private assert(
    actual: any,
    expected: any,
    op: string,
    isNumber: boolean | undefined
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
    parameters: any,
    forEachItem?: string
  ): Promise<void> {
    // const methodIterators = this.getFlowIterators(method);
    for (const sequenceItem of method.sequence) {
      let prefix = forEachItem;
      if (!prefix || prefix.trim().length === 0) {
        const { iterator } = sequenceItem;
        if (iterator) {
          log(
            `   Starting iterator for ${this.config.aliases.iterators.length} iterator definitions`
          );
          let iteratorConfig: Alias | undefined;
          iteratorConfig = this.config.aliases.iterators.find(
            (it) => it.name === iterator.name
          );
          if (iteratorConfig) {
            for (const rootSelector of iteratorConfig.selectors) {
              const rootElements = await page.$$(rootSelector);

              // const iteratorDef: IdentifiableIterator =
              //   await this.findIteratorDefinition(
              //     methodIterators,
              //     iteratorConfig.name
              //   );

              if (iterator.identifier) {
                log(
                  `   Trying to read identifier from ${rootSelector} ${iterator.identifier} for each found root element`
                );
              }

              if (rootElements && rootElements.length) {
                for (const [index, rootElem] of rootElements.entries()) {
                  const iteratorIdentifierElem = iterator.identifier
                    ? await rootElem.$(iterator.identifier)
                    : rootElem;

                  const uid = iterator ? iterator.uid : 'root';
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
                        .padStart(4)}: |${resultEvaluation}|${text}|`,
                      'yellow'
                    );
                    // if (text === resultEvaluation) {
                    if (new RegExp(resultEvaluation).test(text)) {
                      prefix = `${rootSelector}:nth-of-type(${index + 1})`;
                      break;
                    }
                  }
                  // else {
                  //   log(`Missing iterator identifier element for ${iteratorDef.identifier ? iteratorDef.identifier : rootSelector}`)
                  // }
                }
              }
              if (prefix) {
                break;
              }
            }
          } else {
            throw new Error(
              `Missing iterator config for ${iterator.name}`
            );
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
      }

      let { type, uid, op, isNumber, locator, iterator, press, process } =
        sequenceItem;
      locator = iterator
        ? `${prefix !== '' ? prefix : ''}${
            prefix !== '' && locator ? ' ' : ''
          }${locator || ''}`
        : locator;
      locator = this.evaluateExpression(locator);
      log(`   [${type}]: ${locator}`);

      const element = await page.$(locator);
      if (!element) {
        log(`       Element ${locator} not found`, 'red');
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

          let toCheck = ((value ? value : text) || '').replace(/\n/g, ' ');
          if (process) {
            const expression = this.evaluateExpression(
              `"${toCheck}"${process}`
            );
            log(
              `evaluating expression ${expression}, based on ${toCheck} and ${process}`
            );
            toCheck = eval(expression);
          }

          log(
            ` [ ] Checking ${toCheck} | ${op} | ${valueToValidate} for (${locator})`,
            'yellow',
            true
          );

          if (op) {
            if (!this.assert(toCheck, valueToValidate, op, isNumber)) {
              log(
                `   [x] ${toCheck} ${op} ${valueToValidate}`,
                'red',
                true,
                true
              );

              log(
                `   [x] ${toCheck} ${op} ${valueToValidate}`,
                'red',
                false,
                false,
                'Tests'
              );
            } else {
              log(
                `   [✓] ${toCheck} ${op} ${valueToValidate}`,
                'green',
                true,
                true
              );

              log(
                `   [✓] ${toCheck} ${op} ${valueToValidate}`,
                'green',
                false,
                false,
                'Tests'
              );
            }
          }
        } catch (err) {
          console.log(err);
          log(`Error on checking`, 'red');
        }
      } else if (
        (type === 'fill' || type === 'clearAndFill') &&
        uid &&
        parameters[uid]
      ) {
        log(
          `   [ ] Filling ${locator} with ${this.evaluateExpression(
            parameters[uid]
          )}`,
          'yellow',
          true
        );
        await page.focus(locator);
        if (type === 'clearAndFill') {
          await page.evaluate(
            (locator) => ((document.querySelector(locator) as any).value = ''),
            locator
          );
        }
        await page.keyboard.type(this.evaluateExpression(parameters[uid]));
        log(
          `   [#] Filling ${locator} with ${this.evaluateExpression(
            parameters[uid]
          )}`,
          'yellow',
          true
        );
        if (press) {
          await page.keyboard.press(press);
        }
      } else if (type === 'keyEvent') {
        log(`  [ ] Triggering key press ${press}`);
        await page.keyboard.press(press);
        log(`  [x] Triggered key press ${press}`);
      } else if (type === 'click') {
        const element = await page.$(locator);

        if (element) {
          await element.hover();
          try {
            await element.focus();
          } catch (err) {
            //silent fail
          }
          const text = await element.evaluate((el) => el.textContent?.trim());
          log(`   [ ] Clicking on ${text} (${locator})`, 'yellow', true);
          // await element.screenshot({ path: 'example.png' });
          try {
            await element.evaluate((el: any) => el.click());
          } catch (err) {
            await element.click();
          }
          log(`   [*] Clicked on ${text}`, 'yellow', true);
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

        if (sequenceItem.storeAttribute) {
          const attributes = await page.evaluate(
            (element) =>
              Array.from(element.attributes, ({ name, value }) => [
                name,
                value,
              ]),
            element
          );
          const attribute = attributes.find(
            (item: any) => item[0] === sequenceItem.storeAttribute
          );
          if (attribute) {
            this.store[attribute[0]] = attribute[1];
            console.log(
              `Stored ${sequenceItem.storeAttribute} as ${attribute[1]} from ${attribute[0]}`,
              'yellow'
            );
          }
        }

        await element.screenshot({ path: 'example.png' });
        // const key = parameters[uid];
        const key: string = sequenceItem.storeName;
        if (key) {
          this.store[key] = value || text;
          log(
            `Stored ${key} as ${this.store[key]} from ${value} || ${text}`,
            'yellow'
          );
        }
      }
    }
  }

  public async performScreenshotForLastAction(page: Page): Promise<void> {
    await this.flow.stateScreenshot(page, this.lastActionId);
  }

  private getActionItemFromGraph(id: string, root?: ActionItem[]): ActionItem {
    const graph = root || this.flow.flow.graph;

    const actionItem = graph.find((item) => item.id === id);

    if (!actionItem) {
      for (const item of graph) {
        if (item.children) {
          const child = this.getActionItemFromGraph(id, item.children);
          if (child) {
            return child;
          }
        }
      }
    }

    return actionItem;
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
    log(
      '+----------------' + '-'.repeat(currentStepToExecute.length) + '--+',
      'cyan'
    );
    log(`| Executing Step: ${currentStepToExecute} |`, 'cyan');
    log(
      '+----------------' + '-'.repeat(currentStepToExecute.length) + '--+',
      'cyan'
    );
    log(`Current path: ${url.substring(0, 40)}`, 'yellow');
    if (executionSteps.length === 0) {
      return;
    }
    // let action = executionSteps.find(
    //   (item: ActionItem) => item.id === currentStepToExecute
    // );

    let action = this.getActionItemFromGraph(currentStepToExecute);

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
      if (action.postDelay) {
        log(`Waiting for ${action.postDelay}`);
        await new Promise(function (resolve) {
          setTimeout(resolve, action.postDelay);
        });
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
      }
    };

    if (action) {
      log(`Executing sequence: ${currentStepToExecute}`);
      if (action.condition) {
        console.log(
          this.evaluateExpression(action.condition),
          eval(this.evaluateExpression(action.condition))
        );
      }
      if (
        action.condition &&
        !eval(this.evaluateExpression(action.condition))
      ) {
        log(`Condition not met. Skipping step: ${currentStepToExecute}`);
      } else {
        action.url = url;
        const { methodUid, loop, methodLoop, parameters, forEach } = action;

        const method = actions.find((item: Actions) => item.uid === methodUid);
        if (method) {
          const hasCheck = method.sequence.find((seq) => seq.type === 'check');

          if (hasCheck) {
            log(
              `Executing ${currentStepToExecute}::${method.method}`,
              'yellow',
              false,
              false,
              'Tests'
            );
          }

          const loopTimes = loop || 1;
          log(` > Executing method ${method.method}; ${loopTimes} time(s)`);
          let forEachElements = [];
          if (forEach) {
            forEachElements = await page.$$(forEach);
          }
          for (let index = 0; index < (forEachElements.length || 1); index++) {
            if (action.forEach) {
              this.store.index = index + 1;
              this.store.isFirst = index === 0;
              this.store.isLast = index === (forEachElements.length || 1) - 1;
              this.store.each = `${forEach}:nth-of-type(${index}) `;
            }

            for (let i = 0; i < loopTimes; i++) {
              for (let j = 0; j < (methodLoop || 1); j++) {
                log(
                  `  >  Executing method ${method.method}, iteration: ${i}, ${j}`
                );
                await this.executeMethod(
                  method,
                  page,
                  parameters,
                  this.store.each
                );
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
          }

          this.store.index = undefined;
          this.store.isFirst = undefined;
          this.store.isLast = undefined;
          this.store.each = undefined;
        } else if (!method) {
          log(`Method ${methodUid} not found. Continuing...`);
          await continueExecution(action);
        }
      }
    } else {
      throw new Error(`Action ${currentStepToExecute} not found in flow`);
    }
  }

  private findRootActionItem(from: ActionItem[], rootId: string): ActionItem {
    let rootActionItem = from.find((item) => item.id === rootId);
    if (!rootActionItem) {
      from.forEach((item) => {
        return this.findRootActionItem(item.children, rootId);
      });
    }
    return rootActionItem;
  }

  public async run(
    page: Page,
    sequence: string[],
    sequenceCallback?: Function,
    sequenceStore: KeyValuePair[] = []
  ) {
    const { graph } = this.flow.flow;

    if (sequenceStore && sequenceStore.length) {
      sequenceStore.forEach((item) => {
        log(`Setting store ${item.key} to ${item.value}`);
      });
    }

    if (!this.store) {
      this.store = {
        library,
        ...this.config.aliases.store.reduce((memo: any, item: KeyValuePair) => {
          console.log(item);
          memo[item.key] = item.value;
          return memo;
        }, {}),
      };
      global.store = this.store;
    }

    for (const seqStore of sequenceStore) {
      this.store[seqStore.key] = seqStore.value;
    }

    // if (this.config.aliases.store) {
    // this.store = {
    //   ...[...this.config.aliases.store, ...sequenceStore].reduce(
    //     (memo: any, item: KeyValuePair) => {
    //       memo[item.key] = item.value;
    //       return memo;
    //     },
    //     {}
    //   ),
    //   library,
    // };
    // global.store = this.store;
    // }
    console.log('%%%%%%%%%');
    console.log(this.store);

    const root = this.findRootActionItem(graph, sequence[0]);
    await this.executeStep(
      page,
      [root],
      sequence,
      sequence.length > 1 ? sequenceCallback : undefined
    );
    log('Finished sequence execution', 'blue');

    log('Store', 'white');
    log(JSON.stringify(this.store, null, 2), 'white');
  }
}
