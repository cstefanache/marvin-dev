import { DialogBody, Dialog, Toaster } from '@blueprintjs/core';
import './DialogComponent.scss';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { ReactNode, useRef } from 'react';
import { CustomRegistry, CustomWrapper } from '../registry/Wrapper/Wrapper';
import { JSONObject } from '../../types/Types';

export interface DialogProps {
  onClose: () => void;
  open: boolean;
  config: object;
  setConfig: (boolean) => void;
}
const variableSchema = {
  type: 'object',
  properties: {
    rootUrl: {
      type: 'string',
      title: 'URL',
    },
  },
  required: ['rootUrl'],
};
export function DialogComponent(props: DialogProps) {
  const { onClose, open, config, setConfig } = props;
  const toastRef = useRef(null);

  const saveConfig = (data: JSONObject) => {
    try {
      window.electron.setConfig(data);
      console.log(data);
      setConfig(data);
      if (toastRef.current) {
        (toastRef.current as Toaster).show({
          intent: 'primary',
          message: 'Config saved',
          timeout: 3000,
        });
      }
      onClose();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Dialog
      title="Insert URL"
      isOpen={open}
      onClose={() => onClose()}
      className="modal"
    >
      <DialogBody className="modal-content">
        <SchemaForm
          className="input-content"
          wrapper={CustomWrapper as unknown as ReactNode}
          config={{ registry: CustomRegistry }}
          schema={variableSchema}
          data={config}
          onSubmit={saveConfig}
        />
      </DialogBody>
    </Dialog>
  );
}
