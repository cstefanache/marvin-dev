import { useState } from 'react';

import { FormGroup, InputGroup, Icon, Button, Tag } from '@blueprintjs/core';

import './SelectorsStyles.scss';

interface Props {
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
}

export default function Selectors({ value, onChange }: Props) {
  const [addValue, setAddValue] = useState('');

  const handleDelete = (index: number) => {
    const newValue = [...(value || [])];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const add = () => {
    if (addValue && addValue.trim().length > 0) {
      const newValue = [...(value || [])];
      newValue.push(addValue);
      setAddValue('');
      onChange(newValue);
    }
  };

  const addButton = <Button icon="add" minimal onClick={add} />;

  const clearButton = (idx: number) => (
    <Button icon="cross" minimal onClick={() => handleDelete(idx)} />
  );

  return (
    <>
      <FormGroup
        helperText="Press Enter to add"
        label="Add Selector"
        inline={false}
        className="form-group"
      >
        <InputGroup
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              add();
            }
          }}
          leftElement={<Icon icon="code" />}
          rightElement={addButton}
        />
      </FormGroup>
      <div className="chips-container">
        {value &&
          value.length > 0 &&
          value.map((locator, idx) => (
            <Tag key={idx} onRemove={() => handleDelete(idx)} intent="primary">
              {locator}
            </Tag>
            // <span data-tag-index="1" className="bp4-tag">
            //   <span className="bp4-fill bp4-text-overflow-ellipsis">{locator}</span>
            //   {clearButton(idx)}
            // </span>
          ))}
      </div>
    </>
  );
}
