import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Models } from '@marvin/discovery';
import { DragLayout } from '../components/DragLayout/DragLayout';
import { IconToolbarLayout } from '../components/IconToolbarLayout/IconToolbarLayout';
import { Icon, InputGroup } from '@blueprintjs/core';
import { Log } from '../app/components/Log';
import { LeftNav } from './LeftNav';
import { TitlePanel } from '../components/TitlePanel/TitlePanel';

export function WorkspaceRoot() {
  const [workspace, setWorkspace] = useState<{ name: string; path: string }>();
  const [flow, setFlow] = useState<Models.FlowModel>();
 
  const navigate = useNavigate();
  const [mainLayoutHoriz, setMainLayoutHoriz] = useState<boolean>(false);

  useEffect(() => {
    const asyncFn = async () => {
      const workspace = await window.electron.getWorkspace();
      const flow = await window.electron.getFlow();
      setFlow(flow);
    };
    asyncFn();
  }, [navigate]);

  const console = (
    <TitlePanel
      title="Console"
      collapsible={
        <InputGroup
          leftIcon="filter"
          placeholder="Filter"
         
        />
      }
      suffix={
        mainLayoutHoriz
          ? [
              <Icon
                icon="horizontal-distribution"
                size={12}
                onClick={() => setMainLayoutHoriz(false)}
              />,
            ]
          : [
              <Icon
                icon="vertical-distribution"
                size={12}
                onClick={() => setMainLayoutHoriz(true)}
              />,
            ]
      }
    >
      <Log log="marvin:discovery" />
    </TitlePanel>
  );

  return (
    <DragLayout
      orientation="horizontal"
      defaultSize={300}
      left={<LeftNav flow={flow} />}
    >
      <DragLayout
        orientation={mainLayoutHoriz ? 'horizontal-reversed' : 'vertical'}
        defaultSize={200}
        minSize={20}
        left={console}
      >
        <div>The actual main content</div>
      </DragLayout>
    </DragLayout>
  );
}

export default WorkspaceRoot;
