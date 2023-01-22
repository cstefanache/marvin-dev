import React, { useEffect, useState } from 'react';
import { Console } from '../components/Console/Console';
import { Graph } from '../components/Graph/Graph';
import { Drawer, PanelStack2 } from '@blueprintjs/core';
import { AddMethod } from '../components/AddMethod/AddMethod';

interface Props {
  workspace: {
    name: string;
    path: string;
  };
}

export default function Workspace({ workspace }: Props) {
  const [flow, setFlow] = React.useState(null);
  const [drawerElement, setDrawerElement] = React.useState<null | JSX.Element>(
    null
  );
  const [drawerTitle, setDrawerTitle] = React.useState<null | string>(null);

  const loadFlow = async () => {
    const flow = await window.electron.getFlow();
    setFlow(flow);
  };

  useEffect(() => {
    const asyncFn = async () => {
      await loadFlow();
      // openDrawer('addMethod', 'Add Method', {
      //   id: '1-3',
      //   method: 'Select a ranking category',
      //   sequenceStep: 'Select Top Leadership Schools category',
      //   url: '',
      //   exitUrl: '',
      //   parameters: {
      //     'ranking-card-identifier-uid': 'Top Leadership Schools',
      //   },
      // });
    };
    asyncFn();
  }, []);

  const openDrawer = (type: string, title: string, props: any) => {
    setDrawerTitle(title);
    switch (type) {
      case 'addMethod':
        setDrawerElement(<AddMethod {...props} />);
        break;
    }
  };

  return (
    <>
      {!flow ? (
        <h3>Loading</h3>
      ) : (
        <>
          <Graph flow={flow} openDrawer={openDrawer} />
          <Console />
          <Drawer isOpen={drawerElement !== null} title="Add Method">
            {drawerElement}
          </Drawer>
        </>
      )}
    </>
  );
}
