import './TextFieldStyles.scss';

import {
  FormGroup,
  InputGroup,
  NumericInput,
  TextArea,
} from '@blueprintjs/core';

import { Property } from '../../../../types/Types';
import { getInputIcon } from '../../Wrapper/Wrapper';

interface Props {
  property: Property;
  value: number | string;
  onChange: (value: string | number) => void;
}

export default function CustomTextField(props: Props) {
  const { property, value, onChange } = props;
  const {
    type,
    title,
    description,
    error,
    isRequired,
    readOnly,
    inputType,
    iteratorRoot,
    placeholder,
  } = property;

  const handleChange = (event: any) => {
    if (type === 'integer') {
      onChange(parseInt(event.target.value));
    } else {
      onChange(event.target.value);
    }
  };

  const getInput = () => {
    if (type === 'integer') {
      return (
        <NumericInput
          value={value}
          onValueChange={onChange}
          leftElement={getInputIcon(title, inputType)}
        />
      );
    } else if (type === 'string') {
      if (inputType === 'textarea') {
        return <TextArea value={value} onChange={handleChange} fill={true} />;
      } else {
        return (
          <InputGroup
          placeholder={placeholder}
            value={value ? `${value}` : undefined}
            onChange={handleChange}
            leftElement={getInputIcon(title, inputType, iteratorRoot)}
          />
        );
      }
    }
  };

  return readOnly ? (
    <p className="disabled-text">
      <strong>{title}:</strong> {value}
    </p>
  ) : (
    <FormGroup
      helperText={error ? error[0].message : undefined}
      inline={false}
      labelInfo={isRequired && '(required)'}
      className="form-group"
    >
      {description && <p className="description">{description}</p>}
      {getInput()}
    </FormGroup>
  );
}

interface CustomWrapperProps {
  property: Property;
  children: JSX.Element | JSX.Element[];
}

export const CustomTextFieldWrapper = ({
  property,
  children,
}: CustomWrapperProps) => {
  if (property.readOnly) {
    return <div className="disabled-text-container">{children}</div>;
  } else {
    return <>{children}</>;
  }
};
