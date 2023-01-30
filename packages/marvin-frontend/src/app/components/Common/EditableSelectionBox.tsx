import React, { useEffect, useRef, useState } from 'react';
import { Button, MenuItem, Icon } from '@blueprintjs/core';
import { Select2 } from '@blueprintjs/select';
import './EditableSelectionBox.scss';

export function EditableSelectionBox<T>({
  value,
  onSelect,
  options,
  renderKey,
}: {
  value: any | undefined;
  onSelect: any;
  options: T[];
  renderKey?: string;
}) {
  const [editMode, setEditMode] = useState(!value);

  return (
    <span>
      {editMode && (
        <Select2
          items={options}
          itemRenderer={(item: any, { handleClick }) => (
            <MenuItem
              text={renderKey ? item[renderKey] : item}
              onClick={handleClick}
            />
          )}
          onItemSelect={(item: any) => {
            setEditMode(false);
            onSelect(item);
          }}
        >
          <Button
            text={renderKey ? value[renderKey] : value}
            rightIcon="double-caret-vertical"
          />
        </Select2>
      )}

      {!editMode && (
        <span
          className="editable-selection-box"
          onClick={() => setEditMode((edit: any) => !edit)}
        >
          {value} <Icon icon="edit" />
        </span>
      )}
    </span>
  );
}
