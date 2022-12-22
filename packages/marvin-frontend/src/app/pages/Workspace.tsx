import { Box, Tabs, Tab, Button, Stack, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import Side from '../components/Side';
import Config from './Config';
import TabPanel from '../components/TabPanel';
import Operations from './Operations';

export default function Workspace({ workspace }: { workspace?: string }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <Tab label="Config" />
        <Tab label="Operations" />
        <Tab label="Flow" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Config />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Operations />
      </TabPanel>
    </Box>
  );
}
