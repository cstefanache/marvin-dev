import { ReactNode, useEffect, useState, useMemo } from 'react';

import { SchemaForm } from '@ascentcore/react-schema-form';
import ConfigSchema from '../../schemas/config.schema.json';
import { CustomRegistry, CustomWrapper } from '../../components/Registry/Wrapper/Wrapper';
import { JSONObject } from '../../types/Types';
import { TabContext } from '../../contexts/TabContext';

import './ConfigStyles.scss';

export default function Config() {
  const [config, setConfig] = useState<JSONObject | undefined>();
  const [tab, setTab] = useState(0);
  console.log('de cate ori intru aici');
  const contextValue = useMemo(
    () => ({ tab, setTab }),
    [tab]
  );

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
    <TabContext.Provider value={contextValue}>
      <SchemaForm
        className="config-container"
        schema={ConfigSchema}
        wrapper={CustomWrapper as unknown as ReactNode}
        config={{ registry: CustomRegistry }}
        data={config}
        onSubmit={saveConfig}
      />
    </TabContext.Provider>
  ) : (
    <div className="config-container">
      <p>Loading...</p>
    </div>
  );
}
