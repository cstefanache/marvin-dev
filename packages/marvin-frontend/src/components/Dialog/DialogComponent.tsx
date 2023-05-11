import { DialogBody, Dialog, Toaster } from '@blueprintjs/core';
import './DialogComponent.scss';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { ReactNode, useRef } from 'react';
import { CustomRegistry, CustomWrapper } from '../registry/Wrapper/Wrapper';
import { JSONObject } from '../../types/Types';

export interface DialogProps {
  onClose: () => void;
  open: boolean;
  config: any;
  setConfig: Function;
}
const variableSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      title: 'URL',
    },
  },
  required: ['url'],
};
export function DialogComponent(props: DialogProps) {
  const { onClose, open, config, setConfig } = props;
  const toastRef = useRef(null);

  const saveConfig = (data: JSONObject) => {
    try {
      window.electron.setConfig(data);
      // console.log(data);
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
  console.log(config);

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

// <div>
//   <div className="darkBG">
//     <div className="centered">
//       <div className="modal">
//         <div className="modal-header">
//           <h1 className="heading">Insert URL</h1>
//         </div>
//         <div className="modal-content">
//           <SchemaForm
//             className="input-content"
//             schema={{
//               type: 'object',
//               title: 'Insert URL',
//               required: ['rootUrl'],
//               properties: {
//                 rootUrl: {
//                   type: 'string',
//                 },
//               },
//             }}
//             // config={{ registry: CustomRegistry }}
//             // data={config}
//             // onSubmit={saveConfig}
//           />
//         </div>
//         <div className="modal-actions">
//           <div className="actions-container">
//             <Button className="cancel-button" onClick={() => onClose()}>
//               Cancel
//             </Button>
//             {/* {submit && (
//               <Button className="submit-button" onClick={() => onClose()}>
//                 Submit
//               </Button>
//             )} */}
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
