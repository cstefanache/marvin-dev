import { FormGroup, InputGroup } from '@blueprintjs/core';

import { Property } from '../../../../types/Types';

interface Props {
  property: Property;
  value: number | string;
  onChange: (value: string | number) => void;
}

export default function CustomTextField(props: Props) {
  const { property, value, onChange } = props;
  const { type, title, error } = property;

  const handleChange = (event: any) => {
    if (type === 'integer') {
      onChange(parseInt(event.target.value));
    } else {
      onChange(event.target.value);
    }
  };

  return (
    <FormGroup helperText={error} label={title} inline={false}>
      {typeof value === 'string' && <InputGroup value={value} onChange={handleChange} leftIcon="filter" />}
    </FormGroup>

    // <TextField
    //   fullWidth={true}
    //   margin="none"
    //   value={value || ''}
    //   onChange={handleChange}
    //   error={!!property.error}
    //   variant="filled"
    //   size="small"
    //   type={type === 'integer' ? 'number' : 'text'}
    //   label={property.title}
      // InputProps={{
      //   startAdornment: (
      //     <InputAdornment position="start">
      //       {getAdornment(title)}
      //     </InputAdornment>
      //   ),
      // }}
      // helperText={
      //   property.error
      //     ? property.error[0].keyword
      //     : property.description
      //     ? property.description
      //     : ''
      // }
    //   required={property.isRequired}
    // />
  );
}