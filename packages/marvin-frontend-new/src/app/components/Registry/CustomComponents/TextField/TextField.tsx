import { FormGroup, InputGroup, NumericInput } from '@blueprintjs/core';

import { Property } from '../../../../types/Types';
import { getInputIcon } from '../../Wrapper/Wrapper';

interface Props {
  property: Property;
  value: number | string;
  onChange: (value: string | number) => void;
}

export default function CustomTextField(props: Props) {
  const { property, value, onChange } = props;
  const { type, title, error, isRequired } = property;

  const handleChange = (event: any) => {
    if (type === 'integer') {
      onChange(parseInt(event.target.value));
    } else {
      onChange(event.target.value);
    }
  };

  return (
    <FormGroup helperText={error} label={title} inline={false} labelInfo={isRequired && "(required)"}>
      {type === 'string' && (
        <InputGroup
          value={`${value}`}
          onChange={handleChange}
          leftElement={getInputIcon(title)}
        />
      )}
      {type === 'integer' && (
        <NumericInput
          value={value}
          onValueChange={onChange}
          leftElement={getInputIcon(title)}
        />
      )}
    </FormGroup>
  );
}
