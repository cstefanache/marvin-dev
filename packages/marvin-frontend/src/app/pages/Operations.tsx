import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
} from '@mui/material';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { CustomWrapper, CustomRegistry } from '../components/CustomRegistry';
import { ReactNode, useEffect, useState } from 'react';
import HttpIcon from '@mui/icons-material/Http';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import ListIcon from '@mui/icons-material/List';
import { Stack } from '@mui/system';

export default function Operations() {
  const [output, setOutput] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [urls, setUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>();

  const [accordionStates, setAccordionStates] = useState<any>({
    info: true,
    input: true,
    actions: true,
    iterable: true,
  });

  useEffect(() => {
    const asyncFn = async () => {
      const output = await window.electron.getDiscovered();

      if (output) {
        const { discovered } = output;
        const keys = Object.keys(discovered);

        setUrls(keys);
        setSelectedUrl(keys[0]);
        setOutput(output);
      }
      setLoading(false);
    };
    asyncFn();
  }, []);

  const handleChange = (event: any) => {
    setSelectedUrl(event.target.value);
  };

  const toggleAccordionState = (section: string) => {
    setAccordionStates({
      ...accordionStates,
      [section]: !accordionStates[section],
    });
  };

  const renderSection = (
    section: string,
    title: string,
    icon: any,
    isIterable = false
  ) => {
    if (!output || !selectedUrl) return null;
    const list = output.discovered[selectedUrl]['items'][section];
    return (
      <Accordion
        expanded={accordionStates[section]}
        onClick={() => {
          setAccordionStates({
            ...accordionStates,
            [section]: !accordionStates[section],
          });
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {icon && icon}
          <Typography sx={{ ml: 1 }}>
            {title} ({list.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {list.map((item: any) => (
              <>
                <ListItem>
                  <ListItemText
                    primary={
                      item.text +
                      (item.details && item.text ? ' / ' : '') +
                      (item.details || '')
                    }
                    secondary={
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {item.locator}
                      </Typography>
                    }
                  />
                </ListItem>
                {isIterable && (
                  <List sx={{ pl: 4 }}>
                    {item.identifiers.map((subItem: any) => (
                      <ListItem>
                        <ListItemText
                          primary={
                            subItem.text +
                            (subItem.details && subItem.text ? ' / ' : '') +
                            (subItem.details || '')
                          }
                          secondary={
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {subItem.locator}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };

  return !loading ? (
    output ? (
      <Grid container sx={{}}>
        <Grid item xs={4} sx={{ p: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 68px)',
            }}
          >
            <Typography variant="body1">
              Discovered
              <InfoIcon
                sx={{
                  opacity: accordionStates['info'] ? 1 : 0.2,
                  ml: 1,
                  verticalAlign: 'middle',
                }}
                onClick={() => toggleAccordionState('info')}
              />
              <KeyboardIcon
                sx={{
                  opacity: accordionStates['input'] ? 1 : 0.2,
                  ml: 1,
                  verticalAlign: 'middle',
                }}
                onClick={() => toggleAccordionState('input')}
              />
              <TouchAppIcon
                sx={{
                  opacity: accordionStates['actions'] ? 1 : 0.2,
                  ml: 1,
                  verticalAlign: 'middle',
                }}
                onClick={() => toggleAccordionState('actions')}
              />
              <ListIcon
                sx={{
                  opacity: accordionStates['iterable'] ? 1 : 0.2,
                  ml: 1,
                  verticalAlign: 'middle',
                }}
                onClick={() => toggleAccordionState('iterable')}
              />
            </Typography>
            <Divider sx={{ mt: 1, mb: 1 }} />
            <TextField
              fullWidth={true}
              margin="none"
              value={selectedUrl}
              title={selectedUrl}
              onChange={handleChange}
              variant="filled"
              size="small"
              label="Url"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HttpIcon />
                  </InputAdornment>
                ),
              }}
              select
            >
              {urls.map((item: any) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ mt: 2, flexGrow: 1, overflow: 'auto' }}>
              {renderSection('info', 'Info Selectors', <InfoIcon />)}
              {renderSection('input', 'Input Selectors', <KeyboardIcon />)}
              {renderSection('actions', 'Action Selectors', <TouchAppIcon />)}
              {renderSection('iterable', 'Iterables', <ListIcon />, true)}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={8} sx={{ p: 1, height: '100%', overflowY: 'auto' }}>
          <Typography variant="body1">Actions</Typography>
          <Divider sx={{ mt: 1, mb: 1 }} />
        </Grid>
      </Grid>
    ) : (
      <Typography>No discovery ran</Typography>
    )
  ) : (
    <Typography>Loading...</Typography>
  );
}
