import React, { useContext, useState } from 'react';
import { Divider, Icon, Tabs, Tab, TabId } from '@blueprintjs/core';

import { Property } from '../../../types/Types';
import TabPanel from '../../TabPanel';
import CustomTextField from '../CustomComponents/TextField/TextField';
import CustomSelect from '../CustomComponents/Selectors/Select';
import Selectors from '../CustomComponents/Selectors/Selectors';
import './WrapperStyles.scss';

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



export interface CustomProps {
  property: any;
  value: any;
  enum: any[];
  onChange: Function;
}


const getAdornment = (title?: string) => {
  if (title) {
    const lowerName = title?.toLowerCase();

    if (lowerName === 'name') {
      return <Icon icon="person" />;
    } else if (lowerName === 'selector' || lowerName === 'locator') {
      return <Icon icon="code" />;
    } else if (lowerName === 'root url') {
      return <Icon icon="open-application" />;
    } else if (lowerName === 'default timeout') {
      return <Icon icon="time" />;
    } else if (lowerName === 'identifiers') {
      return <Icon icon="array" />;
    } else if (lowerName === 'identifier') {
      return <Icon icon="tag" />;
    } else if (lowerName === 'type') {
      return <Icon icon="list" />;
    } else if (lowerName === 'regex') {
      return <Icon icon="book" />;
    }
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


type ConfigContextType = {
  configTab: number
};

export const ConfigContext = React.createContext<ConfigContextType>({configTab: 0});
// const ConfigContextProvider: React.FC<React.ReactNode> = ({
//   children,
// }: any) => {
//   const [configTab, setConfigTab] = useState<string|number>(0);
//   return (
//     <ConfigContext.Provider value={{ configTab, setConfigTab }}>
//       {children}
//     </ConfigContext.Provider>
//   );
// };



interface CustomWrapperProps {
  property: Property;
  children: JSX.Element | JSX.Element[];
}

function Wrapper({ property, children }: CustomWrapperProps) {
  const { type, title, description, properties, size, uiType, uiIndex } = property;

  
  const renderWrapperElements = () => {
    switch (uiType) {
      case 'divider': 
        return <Divider className="divider" />
      case 'container':
        return (
          <div className="wrapper-container">
            {description && type !== 'object' && (
              <div className="wrapper-description">
                <p>{getAdornment(title)} {description}</p>
              </div>
            )}
            {type === 'object' && (
              <div className="wrapper-container">
                <div className="wrapper-title">
                  <p>{getAdornment(title)} {title}</p>
                </div>
              </div>
            )}
            <div className="wrapper-container">
              {children}
            </div>
        </div>
        );
      case 'tabs':
        const [configTab, setConfigTab] = useState<number>(0);

        const handleTabChange = (newTabId: number) => {
          setConfigTab(newTabId);
        };

        return (
          <div className="wrapper-container">
              {/* <Tabs
                value={configTab}
                onChange={(evt: any, newValue: number) => {
                  setConfigTab(newValue);
                }}
              >
                {Object.keys(properties).map((key) => (
                  <Tab key={key} label={properties[key].title} />
                ))}
              </Tabs> */}
              <ConfigContext.Provider value={{configTab}}>
                <Tabs id="configTabs" onChange={(tabId: number) => handleTabChange(tabId)} selectedTabId={configTab}>
                  {Object.keys(properties).map((key, idx) => (
                    <Tab key={key} id={idx} title={properties[key].title} panel={<TabPanel value={configTab as number} index={idx} children={children}/>} />
                  ))}
                </Tabs>
              </ConfigContext.Provider>
            {/* TODO: These children shouldn`t be inside a tab panel? */}
            {/* {children} */}
          </div>
        );
      case 'tab':

        const {configTab: tab} = useContext(ConfigContext);
        return (
          <TabPanel value={tab} index={uiIndex || 0}>
            {children}
          </TabPanel>
        );
      default:
        // TODO: check how to use the size property with Blueprint
        // return (<Grid item {...(size || { xs: 12 })} sx={{ pl: 1, mt: 1 }}>{children}</Grid>);    
        return (<div className="wrapper-container">{children}</div>);      
    }
  }

  return (<>{renderWrapperElements()}</>);
}

export function CustomWrapper({ property, children }: CustomWrapperProps) {
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