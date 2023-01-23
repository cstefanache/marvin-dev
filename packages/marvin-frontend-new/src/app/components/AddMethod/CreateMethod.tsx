import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import { Button, Divider, MenuItem, PanelStack2 } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import * as uuid from 'uuid';

import { SchemaForm } from '@ascentcore/react-schema-form';
import { CustomRegistry, CustomWrapper } from '../Registry/Wrapper/Wrapper';

export interface Discovered {
  text: string;
  locator: string;
  details?: string;
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
    (item.text || '').toLowerCase() + ' ' + (item.details || '').toLowerCase();
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
      label={item.text.toString()}
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
  const { exitUrl, sequenceStep } = props;

  const [schema, setSchema] = React.useState<any>();
  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<any>(null);
  const [sequence, setSequence] = useState<any>([]);

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
          ...iterable.map((item: any) => ({ ...item, from: 'iterable' })),
        ].filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.locator === value.locator)
        );

        setItems(items);
      }
    };
    asyncFn();
  }, []);

  const selectItem = (item: any) => {
    setSequence([
      ...sequence,
      {
        uid: uuid.v4(),
        locator: item.locator,
        type: 'click', //TODO refactor
      },
    ]);
  };

  return (
    <div>
      {sequence.map((step: any, index: number) => {
        return (
          <div className="sequence-item">
            <span className="number">{index+1}</span>
            <p className="locator">{step.locator}</p>
          </div>
        );
      })}
      {items && <DiscoveredSelect items={items} onSelect={selectItem} />}
    </div>
  );
};

export default CreateMethod;
