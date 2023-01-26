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
  const [loading, setLoading] = React.useState(true);
  const [drawerElement, setDrawerElement] = React.useState<null | JSX.Element>(
    null
  );
  const [drawerTitle, setDrawerTitle] = React.useState<null | string>(null);

  const loadFlow = async () => {
    const flow = await window.electron.getFlow();
    setFlow(flow);
    setLoading(false);
  };

  useEffect(() => {
    const asyncFn = async () => {
      await loadFlow();
    };
    asyncFn();
  }, []);

  const save = async (data: any, parentObject: any) => {
    console.log(data, parentObject);
    const { id } = parentObject;
    setLoading(true)
    await window.electron.addBranch(id, data)
    setDrawerElement(null);
    loadFlow();
  };

  const openDrawer = (type: string, title: string, props: any) => {
    setDrawerTitle(title);
    switch (type) {
      case 'addMethod':
        const properties = { ...{ parent: props }, save };
        setDrawerElement(<AddMethod {...properties} />);
        break;
    }
  };

  return (
    <>
      {!flow || loading ? (
        <h3>Loading</h3>
      ) : (
        <>
          <Graph flow={flow} openDrawer={openDrawer} />
          <Console />
          <Drawer
            isOpen={drawerElement !== null}
            title="Add Method"
            onClose={() => setDrawerElement(null)}
          >
            {drawerElement}
          </Drawer>
        </>
      )}
    </>
  );
}
