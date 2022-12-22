import {
  Grid,
  TextField,
  Typography,
  Chip,
  IconButton,
  Paper,
  Box,
  Button,
  Tab,
  Tabs,
  Divider,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DataArrayIcon from '@mui/icons-material/DataArray';
import CodeIcon from '@mui/icons-material/Code';
import HttpIcon from '@mui/icons-material/Http';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListAltIcon from '@mui/icons-material/ListAlt';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';

import React, { useEffect, useState } from 'react';
export interface CustomProps {
  property: any;
  value: any;
  enum: any[];
  onChange: Function;
}
import TabPanel from '../components/TabPanel';

const getAdornment = (property: any) => {
  const lowerName = property.title?.toLowerCase();
  if (lowerName === 'name') {
    return <AccountCircle />;
  } else if (lowerName === 'selector') {
    return <CodeIcon />;
  } else if (lowerName === 'root url') {
    return <HttpIcon />;
  } else if (lowerName === 'default timeout') {
    return <AccessTimeIcon />;
  } else if (lowerName === 'identifiers') {
    return <DataArrayIcon style={{ verticalAlign: 'middle' }} />;
  } else if (lowerName === 'identifier') {
    return <FingerprintIcon style={{ verticalAlign: 'middle' }} />;
  } else if (lowerName === 'type') {
    return <ListAltIcon style={{ verticalAlign: 'middle' }} />;
  } else if (lowerName === 'regex') {
    return <IntegrationInstructionsIcon style={{ verticalAlign: 'middle' }} />;
  }
};

function SubmitButton({ property, value, onChange, children }: any) {
  return (
    <Box sx={{ m: 2, textAlign: 'right' }}>
      <Button variant="contained" onClick={onChange}>
        {value ? value : children}
      </Button>
    </Box>
  );
}

function RemoveButton({ property, value, onChange, children }: any) {
  return (
    <Box sx={{ m: 2, textAlign: 'right' }}>
      <Button variant="contained" color="error" onClick={onChange}>
        {value ? value : children}
      </Button>
    </Box>
  );
}

function AddButton({ property, value, onChange, children }: any) {
  return (
    <Box sx={{ m: 2, textAlign: 'left' }}>
      <Button variant="contained" color="secondary" onClick={onChange}>
        {value ? value : children}
      </Button>
    </Box>
  );
}

function CustomSelect(props: CustomProps) {
  const { property, value, onChange } = props;
  const { type, enum: list } = property;
  const handleChange = (event: any) => {
    if (type === 'integer') {
      onChange(parseInt(event.target.value));
    } else {
      onChange(event.target.value);
    }
  };

  console.log(list);

  return (
    <TextField
      fullWidth={true}
      margin="none"
      value={value || ''}
      onChange={handleChange}
      error={!!property.error}
      variant="filled"
      size="small"
      type={type === 'integer' ? 'number' : 'text'}
      label={property.title}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {getAdornment(property)}
          </InputAdornment>
        ),
      }}
      helperText={
        property.error
          ? property.error[0].keyword
          : property.description
          ? property.description
          : ''
      }
      required={property.isRequired}
      select
    >
      {list.map((item: any) => (
        <MenuItem key={item} value={item}>
          {item}
        </MenuItem>
      ))}
    </TextField>
  );
}

function Selectors(props: CustomProps) {
  const { property, value, onChange } = props;

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
        label="Add Selector"
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
      variant="filled"
      size="small"
      type={type === 'integer' ? 'number' : 'text'}
      label={property.title}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {getAdornment(property)}
          </InputAdornment>
        ),
      }}
      helperText={
        property.error
          ? property.error[0].keyword
          : property.description
          ? property.description
          : ''
      }
      required={property.isRequired}
    />
  );
}

type ConfigContextType = {
  configTab: number;
  setConfigTab: Function;
};

export const ConfigContext = React.createContext<ConfigContextType | null>(
  null
);
const ConfigContextProvider: React.FC<React.ReactNode> = ({
  children,
}: any) => {
  const [configTab, setConfigTab] = useState(0);
  return (
    <ConfigContext.Provider value={{ configTab, setConfigTab }}>
      {children}
    </ConfigContext.Provider>
  );
};

function Wrapper({
  property,
  children,
  parentValue,
}: {
  property: any;
  children: any;
  parentValue?: any;
}) {
  const { type, title, description, properties, size, uiType, uiIndex, sx } =
    property;

  const [configTab, setConfigTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // setValue(newValue);
    // changeTab(newValue);
  };

  if (uiType === 'divider') {
    return (
      <Grid
        item
        xs={12}
        sx={{ mb: 1, pb: 1, borderBottom: '2px solid #808080' }}
      ></Grid>
    );
  } else if (uiType === 'container') {
    return (
      <Grid
        container
        sx={{
          ml: 2,
          pl: 2,
        }}
      >
        {description && type !== 'object' && (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ alignItems: 'flex-end' }}>
              {getAdornment(property)} {description}
            </Typography>
          </Grid>
        )}
        {type === 'object' && (
          <Grid item xs={12}>
            <Typography variant="body2">
              {getAdornment(property)} {title}
            </Typography>
          </Grid>
        )}
        {children}
      </Grid>
    );
  } else if (uiType === 'tabs') {
    return (
      <Grid item xs={12}>
        <ConfigContext.Provider
          value={{
            configTab,
            setConfigTab: (value: number) => setConfigTab(value),
          }}
        >
          <Tabs
            value={configTab}
            onChange={(evt: any, newValue: number) => {
              setConfigTab(newValue);
            }}
          >
            {Object.keys(properties).map((key) => (
              <Tab key={key} label={properties[key].title} />
            ))}
          </Tabs>

          {children}
        </ConfigContext.Provider>
      </Grid>
    );
  } else if (uiType === 'tab') {
    const configCtx = React.useContext(ConfigContext) as ConfigContextType;
    return (
      <TabPanel value={configCtx.configTab} index={uiIndex}>
        <Grid container sx={{ mr: 1, mt: 1, pl: 1 }}>
          {children}
        </Grid>
      </TabPanel>
    );
  } else {
    return (
      <Grid item {...(size || { xs: 12 })} sx={{ pl: 1, mt: 1 }}>
        {children}
      </Grid>
    );
  }
}

export function CustomWrapper(props: any) {
  const { property, children } = props;

  return <Wrapper property={property}>{children}</Wrapper>;
}

export const CustomRegistry = {
  string: { component: CustomTextField },
  integer: { component: CustomTextField },
  selectors: { component: Selectors },
  button: { component: SubmitButton },
  enum: { component: CustomSelect },
  removeButton: { component: RemoveButton },
  addButton: { component: AddButton },
} as any;
