import * as constants from './constants';

export function sanitizeKey(key: string): string {
  let finalKey = key.replace(/\./g, '').replace(/[> #\/\[\]=":\-\(\)]/g, '');

  if (/^\d/.test(finalKey)) {
    finalKey = `_${finalKey}`;
  }

  if (['delete', 'new'].find((k) => k === finalKey)) {
    finalKey = `_${finalKey}`;
  }
  return finalKey;
}

export function getCheckTextCommand(
  key: string,
  op: string,
  isNumber: boolean
) {
  switch (op) {
    case 'eq':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
        if (val.trim() === '') {
          cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
            key
          )}`}).invoke('text').then((text) => {
              expect(text.trim()).to.eq(${sanitizeKey(key)});
            });
        } else {
          cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
            key
          )}`}).invoke('val').then((val) => {
              expect(val.trim()).to.eq(${sanitizeKey(key)});
            });
          }
      });`;
    case 'neq':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
    if (val.trim() === '') {
      cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
          expect(text.trim()).not.to.eq(${sanitizeKey(key)});
        });
    } else {
      cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
          expect(val.trim()).not.to.eq(${sanitizeKey(key)});
        });
      }
  });`;
    case 'gt':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
if (val.trim() === '') {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
    expect(text.trim()).to.be.greaterThan(${sanitizeKey(key)});
  });
} else {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
    expect(val.trim()).to.be.greaterThan(${sanitizeKey(key)});
  });
}
});`;
    case 'gte':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
if (val.trim() === '') {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
expect(text.trim()).to.be.at.least(${sanitizeKey(key)});
});
} else {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
expect(val.trim()).to.be.at.least(${sanitizeKey(key)});
});
}
});`;
    case 'lt':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
if (val.trim() === '') {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
expect(text.trim()).to.be.lessThan(${sanitizeKey(key)});
});
} else {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
expect(val.trim()).to.be.lessThan(${sanitizeKey(key)});
});
}
});`;
    case 'lte':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
if (val.trim() === '') {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
expect(text.trim()).to.be.at.most(${sanitizeKey(key)});
});
} else {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
expect(val.trim()).to.be.at.most(${sanitizeKey(key)});
});
}
});`;
    case 'contains':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
if (val.trim() === '') {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
expect(text.trim()).to.contain(${sanitizeKey(key)});
});
} else {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
expect(val.trim()).to.contain(${sanitizeKey(key)});
});
}
});`;
    case 'ncontains':
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
if (val.trim() === '') {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
expect(text.trim()).not.to.contain(${sanitizeKey(key)});
});
} else {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
expect(val.trim()).not.to.contain(${sanitizeKey(key)});
});
}
});`;
    default:
      return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
if (val.trim() === '') {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('text').then((text) => {
    expect(text.trim()).to.eq(${sanitizeKey(key)});
  });
} else {
cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
        key
      )}`}).invoke('val').then((val) => {
    expect(val.trim()).to.eq(${sanitizeKey(key)});
  });
}
});`;
  }
}
