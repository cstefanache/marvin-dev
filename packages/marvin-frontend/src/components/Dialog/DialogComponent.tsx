import { DialogBody, Dialog, Toaster, Position } from '@blueprintjs/core';
import './DialogComponent.scss';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { ReactNode, useRef } from 'react';
import { CustomRegistry, CustomWrapper } from '../registry/Wrapper/Wrapper';
import { JSONObject } from '../../types/Types';

export interface DialogProps {
  onClose: () => void;
  open: boolean;
  config: object;
  setConfig: (val?: object) => void;
  title: string;
}
const variableSchema = {
  type: 'object',
  properties: {
    rootUrl: {
      type: 'string',
      title: 'URL',
      format: 'uri',
      pattern: '^https?://',
    },
  },
  required: ['rootUrl'],
};
export function DialogComponent(props: DialogProps) {
  const { onClose, open, config, setConfig, title } = props;
  const toastRef = useRef(null);

  const saveConfig = (data: JSONObject, errors: any[]) => {
    if (!errors || errors.length === 0) {
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
        onClose();
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <>
      <Toaster position={Position.TOP} ref={toastRef} />
      <Dialog
        title={title}
        isOpen={open}
        canOutsideClickClose={false}
        canEscapeKeyClose={false}
        isCloseButtonShown={false}
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
    </>
  );
}
