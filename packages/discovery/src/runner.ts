import { Page } from 'puppeteer';
import Flow from './flow';
import { Action, Aliases, Config, Sequence } from './models/config';
import { ActionItem, Actions, IdentifiableIterator } from './models/models';
import { State } from './state';
import { log } from './utils/logger';
import { processUrl } from './utils/processes';

const library = {
  func: {
    random: () => Math.random(),
  },
};

export default class Runner {
  constructor(
    private readonly config: Config,
    private readonly flow: Flow,
    private readonly state: State | undefined
  ) {}

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

      if (iteratorConfig && iteratorConfig.elements) {
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
                const text = (await iteratorIdentifierElem.evaluate(
                  (el) => el.textContent
                )) as string;
                console.log(`[${index}] ${uid}: ${text} - ${parameters[uid]}`);
                if (text === parameters[uid]) {
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
        await page.focus(locator);
        await page.keyboard.type(parameters[uid]);
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
          const text = await element.evaluate((el) => el.textContent?.trim());
          log(`Clicking on ${text}`, 'yellow');
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
    const { actions } = this.flow.flow;
    const currentStepToExecute = steps[0];
    let url = processUrl(page.url(), this.config.aliases.urlReplacers);
    log(`Current path: ${url}`, 'yellow');
    let action = currentStep.find(
      (item: ActionItem) => item.sequenceStep === currentStepToExecute
    );

    if (action) {
      log(`Executing sequence: ${currentStepToExecute}`);
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
            if (action.children && action.children.length && steps.length > 1) {
              await this.executeStep(
                page,
                action.children,
                steps.filter((_, i) => i > 0),
                sequenceCallback
              );
            }
          }
          if (sequenceCallback) {
            sequenceCallback(action.id);
          }
          await this.flow.stateScreenshot(page, action.id);
        } else {
          throw new Error(`Method ${methodName} not found`);
        }
      } else {
        throw new Error(
          `Current path ${url} not found in flow. Please update your flow according to the latest discovered pages`
        );
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
    await this.executeStep(page, graph, sequence, sequenceCallback);
    log('Finished sequence execution', 'blue');
  }
}
