import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  Grid,
  IconButton,
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
import AddIcon from '@mui/icons-material/Add';
import { Stack } from '@mui/system';
import * as uuid from 'uuid';
import MethodSchema from '../schemas/method.schema.json';

export default function Operations() {
  const [output, setOutput] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [urls, setUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>();
  const [actions, setActions] = useState<any[]>([]);
  const [flow, setFlow] = useState<any | undefined>(undefined);
  const [data, setData] = useState<any | undefined>({
    method: undefined,
    sequence: [],
  });

  const [dataKey, setDataKey] = useState(0);

  const [accordionStates, setAccordionStates] = useState<any>({
    info: true,
    input: true,
    actions: true,
    iterable: true,
  });

  const submitAction = (data: any, err: any) => {
    if (selectedUrl && err.length === 0) {
      const newFlow = {
        ...flow,
        actions: {
          ...flow.actions,
          [selectedUrl]: [
            ...(flow.actions[selectedUrl] || []),
            {
              ...data,
              sequence: [
                ...data.sequence.map((item: any) => ({
                  ...item,
                  uid: uuid.v4(),
                })),
              ],
            },
          ],
        },
      };
      setFlow(newFlow);
      window.electron.setFlow(newFlow);
    }
  };

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

  useEffect(() => {
    const asyncFn = async () => {
      const newFlow = await window.electron.getFlow();
      setFlow(newFlow);
      if (newFlow && newFlow.actions && selectedUrl) {
        setActions(newFlow.actions[selectedUrl]);
      } else {
        setActions([]);
      }
    };
    asyncFn();
  }, [selectedUrl]);

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

    const handleAdd = (item: any) => {
      const { sequence } = data;
      const newSequence = [
        ...sequence,
        {
          type:
            section === 'input'
              ? 'fill'
              : section === 'actions'
              ? 'click'
              : 'check',
          locator: item.locator,
        },
      ];

      setDataKey(Date.now());
      setData({
        ...data,
        sequence: newSequence,
      });
    };

    return (
      <Accordion expanded={accordionStates[section]}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          onClick={() => toggleAccordionState(section)}
        >
          {icon && icon}
          <Typography sx={{ ml: 1 }}>
            {title} ({list.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {list.map((item: any) => (
              <>
                <ListItemButton
                  onClick={() => handleAdd(item)}
                  sx={{
                    pl: 1,
                    pt: 0,
                    pb: 0,
                    borderBottom: '1px solid rgba(255,255,255,.4)',
                  }}
                >
                  <ListItemText
                    primary={
                      item.text +
                      (item.details && item.text ? ' / ' : '') +
                      (item.details || '')
                    }
                    secondary={
                      <Typography
                        sx={{
                          display: 'inline',
                          padding: '4px 10px',
                          borderRadius: 2,
                          fontSize: 12,
                          backgroundColor: 'rgba(255,255,255,.15)',
                        }}
                        component="span"
                        color="text.primary"
                      >
                        {item.locator}
                      </Typography>
                    }
                  />
                </ListItemButton>
                {isIterable && (
                  <List>
                    {item.identifiers.map((subItem: any) => (
                      <ListItemButton onClick={() => {
                        handleAdd(subItem)}
                      }>
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
                      </ListItemButton>
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
              height: 'calc(100vh - 86px)',
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

        <Grid item xs={8} sx={{ p: 1 }}>
          <Typography variant="body1">
            Available Path Actions ({selectedUrl})
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ float: 'right', mb: 1 }}
            >
              Add New
            </Button>
          </Typography>
          <Divider sx={{ mt: 1, mb: 1 }} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 126px)',
              overflow: 'auto',
            }}
          >
            {data && (
              <Paper sx={{ mb: 1, p: 1 }}>
                <SchemaForm
                  key={dataKey}
                  schema={MethodSchema}
                  wrapper={CustomWrapper as any}
                  config={{ registry: CustomRegistry }}
                  data={data}
                  onSubmit={submitAction}
                />
              </Paper>
            )}
            {actions &&
              actions.map((action: any) => (
                <Paper sx={{ mb: 1, p: 1 }} key={action.method}>
                  {action.method}
                  <Divider />
                  <List>
                    {action.sequence.map((item: any) => (
                      <ListItem key={item.locator}>
                        <ListItemText
                          primary={item.type}
                          secondary={
                            <Typography
                              sx={{
                                display: 'inline',
                                padding: '4px 10px',
                                borderRadius: 2,
                                fontSize: 12,
                                backgroundColor: 'rgba(255,255,255,.15)',
                              }}
                              component="span"
                              color="text.primary"
                            >
                              {item.locator}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
          </Box>
        </Grid>
      </Grid>
    ) : (
      <Typography>No discovery ran</Typography>
    )
  ) : (
    <Typography>Loading...</Typography>
  );
}
