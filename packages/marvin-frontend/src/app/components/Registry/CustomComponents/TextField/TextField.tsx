import { FormGroup, InputGroup, NumericInput } from '@blueprintjs/core';

import { Property } from '../../../../types/Types';
import { getInputIcon } from '../../Wrapper/Wrapper';

import './TextFieldStyles.scss';

interface Props {
  property: Property;
  value: number | string;
  onChange: (value: string | number) => void;
}

export default function CustomTextField(props: Props) {
  const { property, value, onChange } = props;
  const { type, title, error, isRequired, readOnly, inputType } = property;

  const handleChange = (event: any) => {
    if (type === 'integer') {
      onChange(parseInt(event.target.value));
    } else {
      onChange(event.target.value);
    }
  };

  return readOnly ? 
      (<p className="disabled-text"><strong>{title}:</strong> {value}</p>) : 
      (<FormGroup helperText={error} label={title} inline={false} labelInfo={isRequired && "(required)"}>
        {type === 'string' && (
          <InputGroup
            value={value ? `${value}` : undefined}
            onChange={handleChange}
            leftElement={getInputIcon(title, inputType)}
          />
        )}
        {type === 'integer' && (
          <NumericInput
            value={value}
            onValueChange={onChange}
            leftElement={getInputIcon(title, inputType)}
          />
        )}
      </FormGroup>);
};

interface CustomWrapperProps {
  property: Property;
  children: JSX.Element | JSX.Element[];
}


export const CustomTextFieldWrapper = ({ property, children }: CustomWrapperProps) => {
  if (property.readOnly) {
    return <div className="disabled-text-container">{children}</div>
  } else {
    return <>{children}</>;
  }
};
