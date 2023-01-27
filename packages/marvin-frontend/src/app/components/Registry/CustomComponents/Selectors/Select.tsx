import { FormGroup, InputGroup, NumericInput, Menu, MenuItem } from '@blueprintjs/core';
import { Property } from '../../../../types/Types';

import './SelectStyles.scss';

interface Props {
  property: Property;
  value: number | string;
  onChange: (value: string | number) => void;
}

export default function CustomSelect(props: Props) {
  const { property, value, onChange } = props;
  const { type, enum: list, error, title, isRequired } = property;

  const handleChange = (event: any) => {
    if (type === 'integer') {
      onChange(parseInt(event.target.value));
    } else {
      onChange(event.target.value);
    }
  };

  return (
    <>
      <FormGroup helperText={error} label={title} inline={false} labelInfo={isRequired && "(required)"}>
        {type === 'string' && (
          <InputGroup 
            value={`${value}`} 
            onChange={handleChange} 
            leftIcon="filter"
          />
        )}
        {type === 'integer' && (
          <NumericInput
            value={value}
            onValueChange={onChange}
            leftIcon="filter"
          />
        )}
      </FormGroup>
      <Menu>
        {list.map((item: string) => (
          <MenuItem key={item} text={item} roleStructure="listoption">
            {item}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}