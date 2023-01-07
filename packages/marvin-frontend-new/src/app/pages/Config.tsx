import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { SchemaForm } from '@ascentcore/react-schema-form';
import ConfigSchema from '../schemas/config.schema.json';
import { CustomWrapper, CustomRegistry } from '../components/CustomRegistry';
import { ReactNode, useEffect, useState } from 'react';

export interface ConfigProps {
  config: any;
  saveFile: Function;
}

export default function Config() {
  const [config, setConfig] = useState<any>(undefined);

  useEffect(() => {
    const asyncFn = async () => {
      const config = await window.electron.getConfig();
      setConfig(config);
    };
    asyncFn();
  }, []);

  const saveConfig = (data: any, a: any) => {
    try {
      window.electron.setConfig(data);
      setConfig(data);
    } catch (e) {
      console.log(e);
    }
  };

  return config ? (
    <>      
      <Grid container sx={{ pr: 1, mt: 4 }}>
        <SchemaForm
          schema={ConfigSchema}
          wrapper={CustomWrapper as any}
          config={{ registry: CustomRegistry }}
          data={config}
          onSubmit={saveConfig}
        />
      </Grid>
    </>
  ) : (
    <Typography>Loading...</Typography>
  );
}
