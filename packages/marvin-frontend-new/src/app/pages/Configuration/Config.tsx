import { ReactNode, useEffect, useState } from 'react';

import { SchemaForm } from '@ascentcore/react-schema-form';
import ConfigSchema from '../../schemas/config.schema.json';
import { CustomRegistry } from '../../components/Registry/Wrapper/Wrapper';
import { JSONObject } from '../../types/Types';
import { CustomWrapper } from '../../components/Registry/Wrapper/Wrapper';

import './ConfigStyles.scss';

export default function Config() {
  const [config, setConfig] = useState<JSONObject | undefined>();

  useEffect(() => {
    const asyncFn = async () => {
      const config = await window.electron.getConfig();
      console.log(config)
      setConfig(config);
    };
    asyncFn();
  }, []);

  const saveConfig = (data: JSONObject) => {
    try {
      window.electron.setConfig(data);
      setConfig(data);
    } catch (e) {
      console.log(e);
    }
  };

  return config ? (
    <div className="bp4-dark">
      <SchemaForm
        className="config-container"
        schema={ConfigSchema}
        wrapper={CustomWrapper as unknown as ReactNode}
        config={{ registry: CustomRegistry }}
        data={config}
        onSubmit={saveConfig}
        />
    </div>
  ) : (
    <p>Loading...</p>
  );
}
