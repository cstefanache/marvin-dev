import {
  Grid,
  TextField,
  Typography,
  Chip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
export interface CustomProps {
  property: any;
  value: any;
  onChange: Function;
}

function Selectors(props: CustomProps) {
  const { property, value, onChange } = props;

  const [addValue, setAddValue] = useState('');

  const handleDelete = (index: number) => () => {
    const newValue = [...(value || [])];
    newValue.splice(index, 1);
    console.log(newValue);
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

  return (
    <Paper sx={{ p: 1 }}>
      <TextField
        fullWidth={true}
        value={addValue}
        variant="standard"
        onChange={(e) => setAddValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            add();
          }
        }}
        InputProps={{
          endAdornment: (
            <IconButton onClick={add}>
              <AddIcon />
            </IconButton>
          ),
        }}
        sx={{
          mb: 1,
          '& .Mui-focused .MuiIconButton-root': { color: 'primary.main' },
        }}
      />
      {value &&
        value.map((locator: string, index: number) => (
          <Chip
            size="small"
            sx={{ mr: 1 }}
            label={locator}
            variant="outlined"
            onDelete={handleDelete(index)}
          />
        ))}
    </Paper>
  );
}

function CustomTextField(props: CustomProps) {
  const { property, value, onChange } = props;
  const { type } = property;
  const handleChange = (event: any) => {
    if (type === 'integer') {
      onChange(parseInt(event.target.value));
    } else {
      onChange(event.target.value);
    }
  };
  return (
    <TextField
      fullWidth={true}
      margin="none"
      value={value || ''}
      onChange={handleChange}
      error={!!property.error}
      variant="standard"
      type={type === 'integer' ? 'number' : 'text'}
      label={property.title}
      helperText={property.error ? property.error[0].keyword : ' '}
      required={property.isRequired}
    />
  );
}

const types: any = {
  'Root Url': { type: 'item', sx: 6 },
  'Default Timeout': { type: 'item', sx: 6 },
  'URL Replacers': { type: 'container' },
  'URL Replacer': { type: 'container' },
  Alias: { type: 'item', sx: 4 },
  Regex: { type: 'item', sx: 4 },
  'Exact Match': { type: 'item', sx: 4 },
};

function Wrapper({ property, children }: { property: any; children: any }) {
  const { type, title, description, registryKey, $ref } = property;

  const [wrapperType] = useState(types[title] || { type: 'item', sx: 12 });

  console.log(property);

  if (wrapperType.type === 'container') {
    return (
      <Grid
        item
        xs={12}
        style={{ display: 'flex', flexWrap: 'wrap' }}
        sx={{ p: 1 }}
      >
        {description && type !== 'object' && (
          <Grid item xs={12}>
            <Typography variant="body2">{description}</Typography>
          </Grid>
        )}
        {type === 'object' && (
          <Grid item xs={12}>
            <Typography variant="body2">{title}</Typography>
          </Grid>
        )}
        {/* <Grid container spacing={2}>{children}</Grid> */}
        {children}
      </Grid>
    );
  } else {
    return (
      <Grid item xs={wrapperType.sx} sx={{ p: 1 }}>
        {description && (
          <Grid item xs={12}>
            <Typography variant="body2">{description}</Typography>
          </Grid>
        )}
        {children}
      </Grid>
    );
  }
}

/**
  {type === 'object' && (
        <>
          <Divider />
        </>
      )}
      {description && <Typography variant="body2">{description}</Typography>}
 */

export function CustomWrapper(props: any) {
  const { property, children } = props;

  return <Wrapper property={property}>{children}</Wrapper>;
}

export const CustomRegistry = {
  string: { component: CustomTextField },
  integer: { component: CustomTextField },
  selectors: { component: Selectors },
} as any;
