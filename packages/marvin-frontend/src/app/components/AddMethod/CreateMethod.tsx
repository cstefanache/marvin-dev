import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import {
  Button,
  Divider,
  Icon,
  InputGroup,
  MenuItem,
  PanelStack2,
} from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import * as uuid from 'uuid';

import { SchemaForm } from '@ascentcore/react-schema-form';
import { CustomRegistry, CustomWrapper } from '../Registry/Wrapper/Wrapper';
import { EditableSelectionBox } from '../Common/EditableSelectionBox';

import { getIcon } from '../../utils';

export interface Discovered {
  text: string;
  locator: string;
  details?: string;
  from: string;
  iteratorName?: string;
}

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
  console.log(props)
  const { exitUrl, saveMethod } = props;
  const [items, setItems] = useState<any>(null);
  const [iterator, setIterator] = useState<any>(null);
  const [sequence, setSequence] = useState<any>([]);
  const [methodName, setMethodName] = useState<string>('');

  useEffect(() => {
    const asyncFn = async () => {
      const discovered = await window.electron.getDiscoveredForPath(exitUrl);
      if (discovered && discovered.items) {
        const {
          items: { info, input, actions, iterable },
        } = discovered;
        let items = [
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

            if (!elements.length) {
              memo.push({
                from: 'iterable',
                locator: item.locator,
                details: iteratorName,
                iterator: {
                  name: iteratorName,
                },
              });
            }
            return memo;
          }, []),
        ].filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.locator === value.locator)
        );

        setItems(items);
      }
    };
    asyncFn();
  }, []);

  async function doSave() {
    const saveObject: any = {
      method: methodName,
      sequence,
    };
    if (iterator) {
      saveObject['iterator'] = iterator;
    }
    await window.electron.saveMethodForUrl(exitUrl, saveObject);
    props.closePanel();
  }

  const selectItem = (item: any) => {
    let type = 'click';

    const { iterator } = item;

    if (item.iterator) {
      setIterator({ ...iterator, uid: uuid.v4() });
    }

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

    setSequence([
      ...sequence,
      {
        uid: uuid.v4(),
        locator: item.locator,
        details: `${item.text || ''} ${item.details || ''}`,
        type,
      },
    ]);
  };

  return (
    <div className="create-container">
      <InputGroup
        value={methodName}
        placeholder="Method name"
        onChange={(event: any) => setMethodName(event.target.value)}
      />
      {iterator && (
        <div>
          <p>Iterator: {iterator.name}</p>
          <p>Identifier: {iterator.identifier}</p>
        </div>
      )}
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
                options={['check', 'click', 'clearAndFill', 'fill', 'store']}
              />
              <p className="locator">{step.locator}</p>
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
