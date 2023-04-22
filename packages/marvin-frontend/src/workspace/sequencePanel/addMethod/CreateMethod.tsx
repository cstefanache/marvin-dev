import './AddMethodStyles.scss';
import { useEffect, useState } from 'react';
import * as uuid from 'uuid';
import { KeyInput } from 'puppeteer';
import {
  Button,
  Checkbox,
  Icon,
  InputGroup,
  MenuItem,
  Tag,
} from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { getIcon } from '../../../utils';
import { EditableSelectionBox } from '../../../components/editableSelectionBox/EditableSelectionBox';

export interface Discovered {
  text: string;
  locator: string;
  details?: string;
  from: string;
  iteratorName?: string;
}

const keyInputType = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Power',
  'Eject',
  'Abort',
  'Help',
  'Backspace',
  'Tab',
  'Numpad5',
  'NumpadEnter',
  'Enter',
  '\r',
  '\n',
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'Pause',
  'CapsLock',
  'Escape',
  'Convert',
  'NonConvert',
  'Space',
  'Numpad9',
  'PageUp',
  'Numpad3',
  'PageDown',
  'End',
  'Numpad1',
  'Home',
  'Numpad7',
  'ArrowLeft',
  'Numpad4',
  'Numpad8',
  'ArrowUp',
  'ArrowRight',
  'Numpad6',
  'Numpad2',
  'ArrowDown',
  'Select',
  'Open',
  'PrintScreen',
  'Insert',
  'Numpad0',
  'Delete',
  'NumpadDecimal',
  'Digit0',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'KeyA',
  'KeyB',
  'KeyC',
  'KeyD',
  'KeyE',
  'KeyF',
  'KeyG',
  'KeyH',
  'KeyI',
  'KeyJ',
  'KeyK',
  'KeyL',
  'KeyM',
  'KeyN',
  'KeyO',
  'KeyP',
  'KeyQ',
  'KeyR',
  'KeyS',
  'KeyT',
  'KeyU',
  'KeyV',
  'KeyW',
  'KeyX',
  'KeyY',
  'KeyZ',
  'MetaLeft',
  'MetaRight',
  'ContextMenu',
  'NumpadMultiply',
  'NumpadAdd',
  'NumpadSubtract',
  'NumpadDivide',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'F13',
  'F14',
  'F15',
  'F16',
  'F17',
  'F18',
  'F19',
  'F20',
  'F21',
  'F22',
  'F23',
  'F24',
  'NumLock',
  'ScrollLock',
  'AudioVolumeMute',
  'AudioVolumeDown',
  'AudioVolumeUp',
  'MediaTrackNext',
  'MediaTrackPrevious',
  'MediaStop',
  'MediaPlayPause',
  'Semicolon',
  'Equal',
  'NumpadEqual',
  'Comma',
  'Minus',
  'Period',
  'Slash',
  'Backquote',
  'BracketLeft',
  'Backslash',
  'BracketRight',
  'Quote',
  'AltGraph',
  'Props',
  'Cancel',
  'Clear',
  'Shift',
  'Control',
  'Alt',
  'Accept',
  'ModeChange',
  ' ',
  'Print',
  'Execute',
  '\u0000',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'Meta',
  '*',
  '+',
  '-',
  '/',
  ';',
  '=',
  ',',
  '.',
  '`',
  '[',
  '\\',
  ']',
  "'",
  'Attn',
  'CrSel',
  'ExSel',
  'EraseEof',
  'Play',
  'ZoomOut',
  ')',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '(',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  ':',
  '<',
  '_',
  '>',
  '?',
  '~',
  '{',
  ',',
  '}',
  '"',
  'SoftLeft',
  'SoftRight',
  'Camera',
  'Call',
  'EndCall',
  'VolumeDown',
  'VolumeUp',
];
export interface DiscoveredItem extends Discovered {
  elements: Discovered[];
}

const filterItems: ItemPredicate<DiscoveredItem> = (
  query,
  item,
  _index,
  exactMatch
) => {
  const normalizedTitle =
    (item.text || '').toLowerCase() +
    ' ' +
    (item.details || '').toLowerCase() +
    ' ' +
    (item.locator || '').toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderItem: ItemRenderer<DiscoveredItem> = (
  item,
  { handleClick, handleFocus, modifiers, query }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={item.locator}
      label={(item.text || item.iteratorName || 'untitled').toString()}
      icon={getIcon(item)}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      children={<p>{item.locator}</p>}
      text={`${item.details ? item.details : ''}`}
    />
  );
};

const DiscoveredSelect = (props: any) => {
  const { items, onSelect } = props;
  return (
    <Select2<DiscoveredItem>
      items={items}
      itemPredicate={filterItems}
      itemRenderer={renderItem}
      noResults={
        <MenuItem
          disabled={true}
          text="No results."
          roleStructure="listoption"
        />
      }
      fill={true}
      onItemSelect={onSelect}
      popoverProps={{ matchTargetWidth: true, minimal: true }}
    >
      <Button
        fill={true}
        text={'Select a locator...'}
        rightIcon="double-caret-vertical"
      />
    </Select2>
  );
};

const CreateMethod = (props: any) => {
  const { exitUrl, saveMethod } = props;

  const [items, setItems] = useState<any>(null);
  // const [iterator, setIterator] = useState<any>(null);
  const [sequence, setSequence] = useState<any>([]);
  const [methodName, setMethodName] = useState<string>('');
  const [isGlobal, setIsGlobal] = useState<boolean>(false);
  const [uid, setUid] = useState<string>(uuid.v4());
  const [keyEvent, setKeyEvent] = useState<KeyInput>();
  const [keyEventError, setKeyEventError] = useState(false);

  useEffect(() => {
    const asyncFn = async () => {
      const discovered = await window.electron.getDiscoveredForPath(exitUrl);
      if (discovered && discovered.items) {
        const {
          items: { info, input, actions, iterable },
        } = discovered;
        const items = [
          ...info.map((item: any) => ({ ...item, from: 'info' })),
          ...input.map((item: any) => ({ ...item, from: 'input' })),
          ...actions.map((item: any) => ({ ...item, from: 'actions' })),
          // ...iterable.map((item: any) => ({ ...item, from: 'iterable' })),
          ...iterable.reduce((memo: any[], item: any) => {
            const { identifier, iteratorName, elements } = item;
            elements.forEach((element: any) => {
              memo.push({
                from: 'iterable',
                text: element.text,
                locator: element.locator,
                details: iteratorName,
                iterator: {
                  name: iteratorName,
                  identifier,
                },
              });
            });

            // if (!elements.length) {
            //   memo.push({
            //     from: 'iterable',
            //     locator: item.locator,
            //     details: iteratorName,
            //     iterator: {
            //       name: iteratorName,
            //     },
            //   });
            // }
            return memo;
          }, []),
        ];
        // .filter(
        //   (value, index, self) =>
        //     index === self.findIndex((t) => t.locator === value.locator)
        // );

        setItems(items);
      }
    };
    asyncFn();

    const { selectedMethod } = props;
    if (selectedMethod && selectedMethod.sequence) {
      const { name, uid, sequence, isGlobal } = selectedMethod;
      setUid(uid);
      setSequence(sequence);
      setMethodName(name);
      setIsGlobal(isGlobal);
    }
  }, []);

  useEffect(() => {
    if (keyEvent && !keyInputType.includes(keyEvent)) {
      setKeyEventError(true);
    } else if (keyInputType.includes(keyEvent)) {
      setKeyEventError(false);
    }
  }, [keyEvent]);

  async function doSave() {
    const saveObject: any = {
      uid,
      method: methodName,
      path: exitUrl,
      isGlobal,
      sequence,
    };
    // if (iterator) {
    //   saveObject['iterator'] = iterator;
    // }
    await window.electron.saveMethodForUrl(saveObject);
    if (!keyEventError) {
      props.closePanel();
    }
  }

  const selectItem = (item: any) => {
    let type = 'click';

    const { iterator } = item;

    // if (item.iterator) {
    //   setIterator({ ...iterator, uid: uuid.v4() });
    // }

    switch (item.from) {
      case 'info':
        type = 'check';
        break;
      case 'actions':
        type = 'click';
        break;
      case 'input':
        type = 'clearAndFill';
        break;
      default:
        type = 'unkown';
    }

    const newSequence = {
      uid: uuid.v4(),
      locator: item.locator,
      details: `${item.text || ''} ${item.details || ''}`,
      type,
      keyEvent: item.keyEvent as KeyInput,
    };

    if (iterator) {
      newSequence['iterator'] = { ...iterator, uid: uuid.v4() };
    }

    setSequence([...sequence, newSequence]);
  };

  const operatorItemRenderer: ItemRenderer<any> = (
    item,
    { handleClick, handleFocus, modifiers, query }
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={item.value}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={item.value}
      />
    );
  };

  return (
    <div className="create-container">
      <div>
        <Tag>Url</Tag>: {exitUrl}
      </div>
      <InputGroup
        value={methodName}
        placeholder="Method name"
        onChange={(event: any) => setMethodName(event.target.value)}
      />
      {/* {iterator && (
        <div>
          <p>Iterator: {iterator.name}</p>
          <p>Identifier: {iterator.identifier}</p>
        </div>
      )} */}
      <div>
        <Checkbox
          checked={isGlobal}
          label="Global Method"
          onChange={() => setIsGlobal(!isGlobal)}
        />
      </div>
      <h4>Sequence:</h4>
      <div className="sequence-container">
        {sequence.map((step: any, index: number) => {
          return (
            <div className="sequence-item">
              <span className="number">
                {index !== 0 && (
                  <Icon
                    icon="chevron-up"
                    onClick={() => {
                      const newSequence = [...sequence];
                      const temp = newSequence[index];
                      newSequence[index] = newSequence[index - 1];
                      newSequence[index - 1] = temp;
                      setSequence(newSequence);
                    }}
                  />
                )}
                <Icon
                  icon="trash"
                  onClick={() => {
                    const newSequence = sequence.filter(
                      (item: any) => item.uid !== step.uid
                    );
                    setSequence(newSequence);
                  }}
                />
                {index !== sequence.length - 1 && (
                  <Icon
                    icon="chevron-down"
                    onClick={() => {
                      const newSequence = [...sequence];
                      const temp = newSequence[index];
                      newSequence[index] = newSequence[index + 1];
                      newSequence[index + 1] = temp;
                      setSequence(newSequence);
                    }}
                  />
                )}
              </span>
              <EditableSelectionBox
                value={step.type}
                onSelect={(value: any) => {
                  step.type = value;

                  setSequence([...sequence]);
                }}
                options={['check', 'click', 'clearAndFill', 'fill', 'noAction']}
              />
              {/* <p className="locator">{step.locator}</p> */}
              {(step.type === 'clearAndFill' || step.type === 'fill') && (
                <>
                  <InputGroup
                    placeholder="Key event"
                    value={step.keyEvent}
                    onChange={(e) => {
                      step.keyEvent = e.target.value;
                      setKeyEvent(step.keyEvent);
                      setSequence([...sequence]);
                    }}
                  />
                  {keyEventError && (
                    <div className="error">
                      Please enter a valid key event type
                    </div>
                  )}
                </>
              )}
              <InputGroup
                value={step.locator}
                onChange={(e) => {
                  step.locator = e.target.value;
                  setSequence([...sequence]);
                }}
              />
              <div>
                <Checkbox
                  checked={step.store}
                  label="Store content or attribute value"
                  onChange={(e: any) => {
                    step.store = e.target.checked;
                    if (!step.store) {
                      delete step.storeName;
                    }
                    setSequence([...sequence]);
                  }}
                />
              </div>
              {step.type === 'check' && (
                <div>
                  <Select2
                    fill={true}
                    items={[
                      { text: '=', value: 'eq' },
                      { text: '!=', value: 'neq' },
                      { text: '>', value: 'gt' },
                      { text: '<', value: 'lt' },
                      { text: '>=', value: 'gte' },
                      { text: '<=', value: 'lte' },
                      { text: 'contains', value: 'contains' },
                      { text: 'does not contain', value: 'doesNotContain' },
                    ]}
                    onItemSelect={(item) => {
                      step.op = item.value;
                      setSequence([...sequence]);
                    }}
                    itemRenderer={operatorItemRenderer}
                  >
                    <Button
                      key={step.op}
                      fill={true}
                      text={`Operator: ${step.op}` || 'Select operator'}
                      alignText="left"
                      rightIcon="double-caret-vertical"
                    />
                  </Select2>
                  <div>
                    <Checkbox
                      checked={step.isNumber}
                      label="Is Number"
                      onChange={() => {
                        step.isNumber = !step.isNumber;
                        setSequence([...sequence]);
                      }}
                    />
                  </div>
                  <InputGroup
                    value={step.process}
                    placeholder="Post process value"
                    title="Post process value"
                    onChange={(e) => {
                      step.process = e.target.value;
                      setSequence([...sequence]);
                    }}
                  />
                </div>
              )}

              {step.store && (
                <>
                  <InputGroup
                    value={step.storeName}
                    placeholder="Variable name"
                    leftIcon="tag"
                    onChange={(e) => {
                      step.storeName = e.target.value;
                      setSequence([...sequence]);
                    }}
                  />
                  <InputGroup
                    value={step.storeAttribute}
                    placeholder="Store value from attribute"
                    leftIcon="array-string"
                    onChange={(e) => {
                      step.storeAttribute = e.target.value;
                      setSequence([...sequence]);
                    }}
                  />
                </>
              )}
              <p className="discovered-text">
                Content at discovery time: <i>{step.details}</i>
              </p>
            </div>
          );
        })}
        {items && <DiscoveredSelect items={items} onSelect={selectItem} />}
      </div>
      <Button icon="floppy-disk" intent="success" onClick={doSave}>
        Save
      </Button>
    </div>
  );
};

export default CreateMethod;
