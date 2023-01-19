import React, { useEffect, useState } from 'react';
import { Graph } from '../components/Graph';

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

  return !flow ? <h3>Loading</h3> : <Graph flow={flow} />;
}
