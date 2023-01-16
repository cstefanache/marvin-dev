import { Box, Tabs, Tab, Button, Stack, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import Side from '../components/Side';
import Config from './Config';
import TabPanel from '../components/TabPanel';
import Operations from './Operations';
import FlowComponent from '../components/FlowGraph';
import Workspaces from './Workspaces/Workspaces';

interface Props {
  workspace: {
    name: string;
    path: string;
  }
}

export default function Workspace({ workspace }: Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const selectWorkspace = (workspace: any) => {
    console.log(workspace);
  };

  return (
    <div>Workspace</div>
  );
    // <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
    //   <Tabs
    //     value={value}
    //     onChange={handleChange}
    //     aria-label="basic tabs example"
    //   >
    //     <Tab label="Workspace" />
    //     <Tab label="Config" />
    //     <Tab label="Operations" />
    //     <Tab label="Flow" />
    //   </Tabs>
    //   <TabPanel value={value} index={0}>
    //     <Workspaces selectWorkspace={selectWorkspace} />
    //   </TabPanel>
    //   <TabPanel value={value} index={1}>
    //     <Config />
    //   </TabPanel>
    //   <TabPanel value={value} index={2}>
    //     <Operations />
    //   </TabPanel>
    //   <TabPanel value={value} index={3}>
    //     <FlowComponent />
    //   </TabPanel>
    // </Box>
}
