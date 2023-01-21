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

  const loadFlow = async () => {
    const flow = await window.electron.getFlow();
    setFlow(flow);
  };

  useEffect(() => {
    const asyncFn = async () => {
      await loadFlow();
    };
    asyncFn();
  }, []);

  return (
    <>
      {!flow ? (
        <h3>Loading</h3>
      ) : (
        <>
          <Graph flow={flow} />
          <Console />
          {/* <Drawer isOpen={true} title="Add Method">
            <AddMethod />
          </Drawer> */}
        </>
      )}
    </>
  );
}
