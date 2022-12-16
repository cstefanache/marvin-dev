import { red } from 'colors';
import { ElementHandle, Page } from 'puppeteer';
import { Alias, Aliases, Config, Exclude } from './models/config';
import {
  DiscoveryResult,
  IdentifiableElement,
  PageDiscoveryResult,
} from './models/models';
import { log } from './utils/logger';

const defaultAliases = {
  info: [
    {
      name: 'headers',
      selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  ],
  action: [
    {
      selectors: ['button', 'a'],
    },
  ],
  input: [
    {
      selectors: ['input'],
    },
  ],
  iterators: [
    {
      name: 'List Iterator',
      selectors: ['ul', 'ol'],
      identifiers: [
        {
          name: 'List Item',
          selector: 'li',
        },
      ],
    },
  ],
};

export default class Discovery {
  private aliases: Aliases;
  private keepParent: any

  constructor(private readonly config: Config) {
    this.aliases = {
      info: [...defaultAliases.info, ...(config.aliases?.info || [])],
      action: [...defaultAliases.action, ...(config.aliases?.action || [])],
      input: [...defaultAliases.input, ...(config.aliases?.input || [])],
      iterators: [
        ...defaultAliases.iterators,
        ...(config.aliases?.iterators || []),
      ],
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
    const typeFilter = rules.filter((rule) => rule.type === type);
    const filter = rules.filter(
      (rule) => rule.type === type && (!rule.name || rule.name === name)
    );
    return filter.find((rule) => this.matches(val, rule)) !== undefined;
  }

  async isLocatorUnique(
    locator: string,
    parent: Page | ElementHandle,
    shouldBe = false
  ): Promise<boolean> {
    if (!locator || locator.trim() === '') {
      return false;
    }
    const elements = await parent.$$(locator);

    if (elements.length > 1 && shouldBe === true) {
      log(`Locator ${locator} is not unique.`);
    }

    if (elements.length === 0) {
      throw new Error(`Locator ${locator} is not valid.`);
    }

    return elements.length === 1;
  }

  async getElementsForLocator(
    locator: string,
    page: Page
  ): Promise<ElementHandle[]> {
    return await page.$$(locator);
  }

  async getLocator(
    element: ElementHandle<Element>,
    page: Page,
    parent?: ElementHandle<Element>
  ): Promise<string> {
    const tag = await element.evaluate((el) => el.tagName);
    let locator: any = '';
    let rootEl = parent || page;

    let excludeRules = this.config.optimizer?.exclude || [];

    if (!this.matchesAnyRule('', tag.toLowerCase(), 'tag', excludeRules)) {
      locator += tag.toLowerCase();
    }

    if (await this.isLocatorUnique(locator, rootEl, true)) {
      return locator;
    }

    

    const id = await element.evaluate((el) => el.id);
    if (id && !this.matchesAnyRule('id', id, 'attribute', excludeRules)) {
      locator += `#${id}`;
      if (await this.isLocatorUnique(locator, rootEl, true)) {
        return locator;
      }
    }

    // const text = await element.evaluate((el) => el.textContent);

    var attributes = await page.evaluate(
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
    let validDataAttr = false;
    if (dataAttr.length) {
      for (const attribute of dataAttr) {
        const value = attribute[1].trim();
        
        if (value) {
          validDataAttr = true;
          const isUnique = await this.isLocatorUnique(
            locator + `[${[attribute[0]]}="${value}"]`,
            rootEl,
            false
          );
          
          if (isUnique) {
            return locator + `[${[attribute[0]]}="${value}"]`;
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
        cls => !this.matchesAnyRule('class', cls, 'attribute', excludeRules)
      );

      for (let currentClass of filterClasses) {
        const isUnique = await this.isLocatorUnique(
          locator + `.${currentClass}`,
          rootEl,
          false
        );
        if (isUnique) {
          return locator + `.${currentClass}`;
        }
      }

      const parent = await element.$x('..');
      const parentElement = parent[0].asElement() as ElementHandle<Element>;
      if (parentElement) {
        let parentLocator: any
        if (await this.getLocator(parentElement, page) !== '') {
           parentLocator = await this.getLocator(parentElement, page);
        }
        if (locator !== '') {
            if (parentLocator) {
              locator = parentLocator + ' > ' + locator;
            } else {
              if (this.keepParent) {
                locator = this.keepParent + ' ' + locator
              }
            }
        } else {
          if (parentLocator) {
            this.keepParent = parentLocator
          } else {
              log('The locator is empty and its parent is excluded. Please review your excluder otions', 'red')
          }
        }
      }
    }

    return locator;
  }

  async discoverGroup(
    element: ElementHandle<Element> | null,
    page: Page
  ): Promise<DiscoveryResult> {
    log('Capturing inputs ...');
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
        : await this.getLocator(element, page, parent);

    for (const infoSelector of this.aliases.info) {
      const elements = await rootElement.$$(infoSelector.selectors.join(', '));

      for (const [index, element] of elements.entries()) {
        const text = (await element.evaluate((el) => el.textContent)) as string;
        info.push({
          text,
          details: await element.evaluate((el) => el.textContent?.trim()),
          type: await element.evaluate((el) => el.getAttribute('type')),
          locator: await getLocatorForElement(infoSelector, index, element),
        });
      }
    }

    for (const inputSelector of this.aliases.input) {
      const elements = await rootElement.$$(inputSelector.selectors.join(', '));
      for (const [index, element] of elements.entries()) {
        const text = (await element.evaluate((el) => el.textContent)) as string;
        input.push({
          text,
          details: await element.evaluate((el) =>
            el.getAttribute('placeholder')
          ),
          type: await element.evaluate((el) => el.getAttribute('type')),
          locator: await getLocatorForElement(inputSelector, index, element),
        });
      }
    }

    for (const actionSelector of this.aliases.action) {
      const elements = await rootElement.$$(
        actionSelector.selectors.join(', ')
      );

      for (const [index, element] of elements.entries()) {
        const text = (await element.evaluate((el) => el.textContent)) as string;
        actions.push({
          text,
          locator: await getLocatorForElement(actionSelector, index, element),
        });
      }
    }

    if (this.aliases.iterators && this.aliases.iterators.length) {
      log('Capturing iterators ...');
      for (const iteratorSelector of this.aliases.iterators) {
        const elements = await rootElement.$$(
          iteratorSelector.selectors.join(', ')
        );

        if (elements.length) {
          element = elements[0];
          const identifiers: IdentifiableElement[] = [];
          if (iteratorSelector.identifiers) {
            for (const identifierSelector of iteratorSelector.identifiers) {
              const elements = await element.$$(identifierSelector.selector);
              for (const [index, childElement] of elements.entries()) {
                const text = (await childElement.evaluate(
                  (el) => el.textContent
                )) as string;
                identifiers.push({
                  text,
                  locator: await getLocatorForElement(
                    {
                      name: identifierSelector.name,
                      skipOptimizer: identifierSelector.skipOptimizer || false,
                      selectors: [identifierSelector.selector],
                    },
                    index,
                    childElement,
                    element
                  ),
                });
              }
            }

            iterable.push({
              text: iteratorSelector.name,
              locator: iteratorSelector.selectors.join(', '),
              identifiers,
            });
          }
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
