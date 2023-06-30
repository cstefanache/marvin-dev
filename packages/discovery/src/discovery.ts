import { ElementHandle, Page } from 'puppeteer';
import { Alias, Aliases, Config, Exclude } from './models/config';
import {
  DiscoveryResult,
  IdentifiableElement,
  PageDiscoveryResult,
} from './models/models';
import { log } from './utils/logger';
export default class Discovery {
  private aliases: Aliases;

  constructor(private readonly config: Config) {
    this.aliases = {
      urlReplacers: config?.aliases?.urlReplacers || [],
      optimizer: config?.aliases?.optimizer,
      info: [...(config?.aliases?.info || [])],
      action: [...(config?.aliases?.action || [])],
      input: [...(config?.aliases?.input || [])],
      iterators: [...(config?.aliases?.iterators || [])],
      store: [],
      hack: {
        pre: '',
      },
    };
  }

  matches(val: string, rule: Exclude) {
    const { regex, value } = rule;

    if (!value && !regex) {
      return true;
    }

    if (
      (regex && regex.find((reg) => new RegExp(reg).test(val))) ||
      (value && value.find((item) => item === val)) ||
      (value &&
        value.find((item) => item === val) &&
        regex &&
        regex.find((reg) => new RegExp(reg).test(val)))
    ) {
      return true;
    }

    return false;
  }

  matchesAnyRule(name: string, val: string, type: string, rules: Exclude[]) {
    const filter = rules.filter(
      (rule) => rule.type === type && (!rule.name || rule.name === name)
    );
    return filter.find((rule) => this.matches(val, rule)) !== undefined;
  }

  sortAttrByPriority(dataArray: string[][], priorityRules: string[]) {
    dataArray.sort((a: string[], b: string[]) => {
      const firstIndex = priorityRules.indexOf(a[0]);
      const secondIndex = priorityRules.indexOf(b[0]);
      return firstIndex !== -1 && secondIndex !== -1
        ? firstIndex - secondIndex
        : secondIndex - firstIndex;
    });
  }

  mergeAndFilter(source: Alias[], custom: Alias[]) {
    return source.reduce((memo: Alias[], item: Alias) => {
      memo.push({
        ...item,
        selectors: item.selectors.filter((selector) => {
          let filterOut = true;
          custom.forEach((customItem) => {
            if (customItem.selectors.indexOf(selector) !== -1) {
              filterOut = false;
            }
          });
          return filterOut;
        }),
      });
      return memo;
    }, []);
  }

  getNthOfTypeLocator(locator: string, index: Number) {
    return `${locator}:nth-of-type(${index})`;
  }

  async isLocatorUnique(
    locator: string,
    parent: Page | ElementHandle,
    shouldBe = false
  ): Promise<boolean> {
    if (!locator || locator.trim() === '') {
      return false;
    }
    let elements;
    try {
      elements = await parent.$$(locator);
    } catch (err) {
      log(`Locator ${locator} is not valid.`, 'red');
      return false;
    }

    // if (elements.length > 1 && shouldBe === true) {
    //   log(`Locator ${locator} is not unique.`);
    // }

    if (elements && elements.length === 0) {
      log(`Locator ${locator} is not valid.`, 'red');
      // throw new Error(`Locator ${locator} is not valid.`);
    }

    return elements.length === 1;
  }

  async getLocator(
    element: ElementHandle<Element>,
    page: Page,
    parent?: ElementHandle<Element>,
    ascendentLocator?: string
  ): Promise<string> {
    const getDescententLocator = (locator: any) =>
      locator +
      (locator &&
      locator.trim() !== '' &&
      ascendentLocator &&
      ascendentLocator.trim() !== ''
        ? ' > '
        : ' ');

    const tag = await element.evaluate((el) => el.tagName);
    let locator: any = '';
    let rootEl = parent || page;
    let excludeRules = this.config.aliases.optimizer?.exclude || [];
    let priorityRules = this.config.aliases.optimizer?.priority || [];

    if (!this.matchesAnyRule('', tag.toLowerCase(), 'tag', excludeRules)) {
      locator += tag.toLowerCase();
    }

    if (await this.isLocatorUnique(locator, rootEl, true)) {
      return getDescententLocator(locator);
    }

    let id: any = await element.evaluate((el) => el.id);

    // if id is a number, it's not a valid id
    if (!Number.isNaN(parseInt(id)) || id.indexOf(':') !== -1) {
      id = undefined;
    }
    if (id && !this.matchesAnyRule('id', id, 'attribute', excludeRules)) {
      const prevLocator = locator;
      try {
        locator += `#${id}`;
        if (await this.isLocatorUnique(locator, rootEl, true)) {
          return getDescententLocator(locator);
        }
      } catch (error) {
        locator = prevLocator;
      }
    }

    // const text = await element.evaluate((el) => el.textContent);

    let attributes = await page.evaluate(
      (element) =>
        Array.from(element.attributes, ({ name, value }) => [name, value]),
      element
    );
    const dataAttr = attributes.filter(
      (attr) =>
        !this.matchesAnyRule(attr[0], attr[1], 'attribute', excludeRules) &&
        attr[0] !== 'id' &&
        attr[0] !== 'class' &&
        attr[0] !== 'style'
    );

    this.sortAttrByPriority(dataAttr, priorityRules);

    let validDataAttr = false;
    if (dataAttr.length) {
      for (const attribute of dataAttr) {
        const value = attribute[1].trim();
        if (value) {
          validDataAttr = true;
          const isUnique = await this.isLocatorUnique(
            locator + `[${[attribute[0]]}="${value.replace(/"/g, '\\"')}"]`,
            rootEl,
            false
          );
          if (isUnique) {
            return getDescententLocator(
              locator + `[${[attribute[0]]}="${value.replace(/"/g, '\\"')}"]`
            );
          }
        }
      }
    }

    let isUniqueSoFar = await this.isLocatorUnique(locator, rootEl);

    if (!isUniqueSoFar) {
      const classes = Object.values(
        await element.evaluate((el) => el.classList)
      );

      const filterClasses = classes.filter(
        (cls) => !this.matchesAnyRule('class', cls, 'attribute', excludeRules)
      );

      for (const currentClass of filterClasses) {
        const isUnique = await this.isLocatorUnique(
          locator + `.${currentClass}`,
          rootEl,
          false
        );
        if (isUnique) {
          return getDescententLocator(locator + `.${currentClass}`);
        }
      }
    }

    isUniqueSoFar = await this.isLocatorUnique(locator, rootEl);

    if (!isUniqueSoFar) {
      const parent = await element.$x('..');
      const parentElement =
        parent.length > 0
          ? (parent[0].asElement() as ElementHandle<Element>)
          : undefined;

      if (parentElement) {
        const parentLocator = await this.getLocator(
          parentElement,
          page,
          undefined,
          locator
        );
        if (parentLocator.trim() !== '') {
          const isUnique = await this.isLocatorUnique(
            `${parentLocator.trim()} ${locator}`,
            rootEl
          );
          if (!isUnique) {
            const newLocator = `${parentLocator.trim()} ${locator}`;
            const cleanLocator = newLocator.trim().endsWith('>')
              ? newLocator
                  .trim()
                  .substr(0, newLocator.trim().length - 1)
                  .trim()
              : newLocator.trim();
            const parents = await rootEl.$$(cleanLocator);
            let index = 1;
            for (const parent of parents) {
              const isParent = await page.evaluate(
                (e1, e2) => e1 === e2,
                parent,
                element
              );
              if (isParent) {
                locator = this.getNthOfTypeLocator(locator, index);
                break;
              }
              index++;
            }
          }
          return parentLocator.trim() + ' ' + getDescententLocator(locator);
        }
      }
    }
    return getDescententLocator(locator);
  }

  async discoverGroup(
    element: ElementHandle<Element> | null,
    page: Page
  ): Promise<DiscoveryResult> {
    const info: IdentifiableElement[] = [];
    const input: IdentifiableElement[] = [];
    const actions: IdentifiableElement[] = [];
    const iterable: IdentifiableElement[] = [];
    const rootElement = element || page;

    const getLocatorForElement = async (
      actionSelector: Alias,
      index: number,
      element: ElementHandle,
      parent?: ElementHandle
    ) =>
      actionSelector.skipOptimizer
        ? `${actionSelector.selectors.join(', ')}:nth-of-type(${index + 1})`
        : (await this.getLocator(element, page, parent)).trim();

    const infoPromises = [];
    log('Capturing info aliases ...', 'white');
    for (const infoSelector of this.aliases.info) {
      const elements = await rootElement.$$(infoSelector.selectors.join(', '));
      for (const [index, element] of elements.entries()) {
        const text = (await element.evaluate((el) => el.textContent)) as string;
        const item: any = {
          text,
          details: await element.evaluate((el) => el.textContent?.trim()),
          type: await element.evaluate((el) => el.getAttribute('type')),
        };

        const locatorPomise = getLocatorForElement(
          infoSelector,
          index,
          element
        );
        infoPromises.push(locatorPomise);
        locatorPomise.then((locator) => {
          item.locator = locator;
          info.push(item);
        });
        log(
          `Captured ${infoSelector.name} (${index + 1}/${elements.length}) `,
          'yellow',
          true
        );
      }
    }

    await Promise.all(infoPromises);

    const inputPromises = [];
    log('Capturing input aliases ...', 'white');
    for (const inputSelector of this.aliases.input) {
      const elements = await rootElement.$$(inputSelector.selectors.join(', '));
      for (const [index, element] of elements.entries()) {
        const text = (await element.evaluate((el) => el.textContent)) as string;
        const item: any = {
          text,
          details: await element.evaluate(
            (el) => `${(el as any).value}  ${el.getAttribute('placeholder')}`
          ),
          type: await element.evaluate((el) => el.getAttribute('type')),
        };

        const promise = getLocatorForElement(inputSelector, index, element);
        promise.then((locator) => {
          (item.locator = locator), input.push(item);
        });
        log(
          `Captured ${inputSelector.name} (${index + 1}/${elements.length}) `,
          'yellow',
          true
        );
        inputPromises.push(promise);
      }
    }

    await Promise.all(inputPromises);

    const promises = [];
    log('Capturing action aliases ...', 'white');
    for (const actionSelector of this.aliases.action) {
      const elements = await rootElement.$$(
        actionSelector.selectors.join(', ')
      );

      for (const [index, element] of elements.entries()) {
        const text = (await element.evaluate((el) => el.textContent)) as string;
        const item: any = {
          text,
        };

        const promise = getLocatorForElement(actionSelector, index, element);
        promise.then((locator) => {
          item.locator = locator;
          actions.push(item);
        });
        log(
          `Captured ${actionSelector.name} (${index + 1}/${elements.length}) `,
          'yellow',
          true
        );
        promises.push(promise);

        // try {
        //   item.base64Image = await (
        //     await element.screenshot({ type: 'png', encoding: 'base64' })
        //   ).toString();
        // } catch (err) {
        //   //silent
        // }
      }
    }

    await Promise.all(promises);

    if (this.aliases.iterators && this.aliases.iterators.length) {
      log('Capturing iterators ...');
      for (const iteratorItem of this.aliases.iterators) {
        const iteratorRootSelectors = await rootElement.$$(
          iteratorItem.selectors.join(', ')
        );
        log(
          `Elements found for ${iteratorItem.name}: ${
            iteratorRootSelectors.length
          } [${iteratorItem.selectors.join(', ')}]`
        );
        if (iteratorRootSelectors.length) {
          element = iteratorRootSelectors[0];
          const text = await element.evaluate((el) => el.textContent);
          console.log(text);
          const elements: IdentifiableElement[] = [];
          if (iteratorItem.elements) {
            for (const iteratorElement of iteratorItem.elements) {
              if (!iteratorElement.selector) {
                continue;
              }
              const iteratorElements = await element.$$(
                iteratorElement.selector
              );
              log(
                `Searching for ${iteratorElement.name} with selector ${iteratorElement.selector}. Found: ${iteratorElements.length}`
              );
              for (const [index, childElement] of iteratorElements.entries()) {
                const text = (await childElement.evaluate(
                  (el) => el.textContent
                )) as string;

                elements.push({
                  text,
                  locator:
                    iteratorElements.length > 1
                      ? await getLocatorForElement(
                          {
                            name: iteratorElement.name,
                            skipOptimizer:
                              iteratorElement.skipOptimizer || false,
                            selectors: [iteratorElement.selector],
                          },
                          index,
                          childElement,
                          element
                        )
                      : iteratorElement.selector,
                });
                log(
                  `Captured ${iteratorElement.name} (${index + 1}/${
                    elements.length
                  }) `,
                  'yellow',
                  true
                );
              }
            }
          }

          iterable.push({
            locator: iteratorItem.selectors.join(', '),
            identifier: iteratorItem.identifier,
            iteratorName: iteratorItem.name,
            elements,
          });
        }
      }
    }

    const result = {
      info,
      input,
      actions,
      iterable,
    };

    if (rootElement.constructor.name === 'ElementHandle') {
      return {
        ...result,
        locator: await this.getLocator(
          rootElement as ElementHandle<Element>,
          page
        ),
      };
    } else {
      return result;
    }
  }

  async discoverPage(page: Page | any): Promise<PageDiscoveryResult> {
    log('Starting page discovery ...');

    log('Capturing groups ...');

    const items = await this.discoverGroup(null, page);
    // const groups: DiscoveryResult[] = [];
    // const actions: DiscoveryResult[] = [];

    // for (const group of this.aliases.group) {
    //     const elements = await page.$$(group.selectors.join(', '));
    //     log(`Found ${elements.length} groups`);
    //     for (const element of elements) {
    //         const name = group.name || 'Unnamed Group';
    //         log(`Discovering group: ${name} ...`);
    //         const discoveredGroup = await this.discoverGroup(element);
    //         groups.push(discoveredGroup);
    //         await element.screenshot({
    //             path: `${this.config.path}/group-${name}.png`,
    //         });
    //     }
    // }

    // return {items, groups, actions};
    return { items };
  }
}
