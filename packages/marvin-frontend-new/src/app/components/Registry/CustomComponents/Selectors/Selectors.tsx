import { useState } from 'react';

import {
  TextField,
  Typography,
  Chip,
  IconButton,
  Paper,
  Box,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import CodeIcon from '@mui/icons-material/Code';

interface Props {
  value: number | string;
  onChange: (value: string | number) => void;
}

export default function Selectors(props: Props) {
  const { value, onChange } = props;

  const [addValue, setAddValue] = useState('');

  const handleDelete = (index: number) => () => {
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

  return (
    <Paper sx={{ p: 1 }}>
      <TextField
        fullWidth={true}
        value={addValue}
        size="small"
        variant="standard"
        label="Add Selecto"
        helperText="Press enter to add"
        onChange={(e) => setAddValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            add();
          }
        }}
        InputProps={{
          startAdornment: (
            <IconButton>
              <CodeIcon />
            </IconButton>
          ),
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
      <Typography variant="body2" component="span">
        Selectors:{' '}
      </Typography>
      {value &&
        value.map((locator: string, index: number) => (
          <Chip
            size="small"
            key={locator}
            color="primary"
            sx={{ mr: 1 }}
            label={locator}
            variant="filled"
            onDelete={handleDelete(index)}
          />
        ))}
    </Paper>
  );
}