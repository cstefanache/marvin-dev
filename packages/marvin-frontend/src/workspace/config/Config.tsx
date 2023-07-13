import { ReactNode, useEffect, useState, useMemo, useRef } from 'react';

import { SchemaForm } from '@ascentcore/react-schema-form';
import ConfigSchema from '../../schemas/config.schema.json';
import {
  CustomRegistry,
  CustomWrapper,
} from '../../components/registry/Wrapper/Wrapper';
import { JSONObject } from '../../types/Types';
import { TabContext } from '../../contexts/TabContext';
import { Position, Toaster } from '@blueprintjs/core';

import './ConfigStyles.scss';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';

export default function Config() {
  const [config, setConfig] = useState<JSONObject | undefined>();
  const [tab, setTab] = useState(0);
  const contextValue = useMemo(() => ({ tab, setTab }), [tab]);
  const toastRef = useRef(null);
  useEffect(() => {
    const asyncFn = async () => {
      const config = await window.electron.getConfig();
      setConfig(config);
    };
    asyncFn();
  }, []);

  const saveConfig = (data: JSONObject, err: any) => {
    if (err.length === 0) {
      try {
        window.electron.setConfig(data);
        setConfig(data);
        if (toastRef.current) {
          (toastRef.current as Toaster).show({
            intent: 'primary',
            message: 'Config saved',
            timeout: 3000,
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  return config ? (
    <div className="container">
      <TitlePanel title={<div className="input">Config</div>}>
        <TabContext.Provider value={contextValue}>
          <Toaster position={Position.TOP} ref={toastRef} />
          <SchemaForm
            className="config-container"
            schema={ConfigSchema}
            wrapper={CustomWrapper as unknown as ReactNode}
            config={{ registry: CustomRegistry }}
            data={config}
            onSubmit={saveConfig}
          />
        </TabContext.Provider>
      </TitlePanel>
    </div>
  ) : (
    <div className="config-container">
      <p>Loading...</p>
    </div>
  );
}
