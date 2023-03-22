import {
  FormGroup,
  Button,
  InputGroup,
  NumericInput,
  Menu,
  MenuItem,
} from '@blueprintjs/core';
import { Select2 } from '@blueprintjs/select';
import { Property } from '../../../../types/Types';

interface Props {
  property: Property;
  value: number | string;
  onChange: (value: string | number) => void;
}

export default function CustomSelect(props: Props) {
  const { property, value, onChange } = props;
  const { type, enum: list, error, title, isRequired } = property;

  const handleChange = (value: any) => {
    onChange(value);
    // if (type === 'integer') {
    //   onChange(parseInt(event.target.value));
    // } else {
    //   onChange(event.target.value);
    // }
  };

  const itemRenderer = (item: string, { handleClick, modifiers }: any) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={item}
        onClick={handleClick}
        text={item}
      />
    );
  };

  return (
    <FormGroup
      helperText={error}
      label={
        <div>
          {title}{' '}
          <Button
            icon="trash"
            onClick={() => {
              handleChange(undefined);
            }}
          ></Button>
        </div>
      }
      inline={false}
      labelInfo={isRequired && '(required)'}
      className="form-group"
    >
      <Select2
        items={list}
        fill={true}
        createNewItemFromQuery={(query) => query}
        createNewItemPosition="first"
        createNewItemRenderer={(query, active, handleClick) => (
          <MenuItem
            icon="add"
            text={`Create "${query}"`}
            onClick={handleClick}
            active={active}
          />
        )}
        itemRenderer={itemRenderer}
        onItemSelect={handleChange}
        noResults={
          <MenuItem
            disabled={true}
            text="No results."
            roleStructure="listoption"
          />
        }
        popoverProps={{ minimal: true }}
      >
        <Button
          fill={true}
          text={value || 'Select Value'}
          rightIcon="double-caret-vertical"
        />
      </Select2>
    </FormGroup>
  );
}
