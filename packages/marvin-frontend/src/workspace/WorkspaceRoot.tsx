import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Models } from '@marvin/discovery';
import { DragLayout } from '../components/DragLayout/DragLayout';
import { Icon, Tabs, Tab, NonIdealState } from '@blueprintjs/core';
import { LeftNav } from './navigation/LeftNav';
import './WorkspaceRoot.scss';
import Config from './config/Config';
import { SequenceItemPanel, TreeItem } from './sequencePanel/SequenceItemPanel';
import Methods from './methods/Methods';
import Workspaces from '../workspaces/Workspaces';
import { getNodesForFilter } from '../utils';
import Console from './console/Console';
import Generate from './generator/Generate';
import { SequencesPanel } from './sequences/SequencesPanel';
import { DialogComponent } from '../components/Dialog/DialogComponent';
import { JSONObject } from '../types/Types';

export function WorkspaceRoot() {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<{ name: string; path: string }>();
  const [selectedSequenceItem, setSelectedSequenceItem] = useState<
    TreeItem | undefined
  >(undefined);
  const [flow, setFlow] = useState<Models.FlowModel>();
  const [tab, setTab] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [flowState, setFlowState] = useState<number>(Math.random());
  const [path, setPath] = useState<string | undefined>(null);
  const [subIds, setSubIds] = useState<string[]>([]);
  const [highlightedMethod, setHighlightedMethod] = useState<string | null>(
    null
  );
  const [mainLayoutHoriz, setMainLayoutHoriz] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [config, setConfig] = useState<JSONObject | undefined>();

  const asyncLoadFn = async () => {
    const workspace = await window.electron.getWorkspace();
    setWorkspace(workspace);

    if (workspace) {
      const path = await window.electron.getWorkspacePath();
      setPath(path);
      setTab((tab) => {
        return tab === null ? 'mainLayout' : tab;
      });
      const flow = await window.electron.getFlow();
      setFlow(flow);
      setFlowState(Math.random());
    }
  };
  useEffect(() => {
    asyncLoadFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const reloadWorkspace = () => {
    asyncLoadFn();
    setTab(null);
  };

  const selectSequenceItem = async (item: TreeItem) => {
    if (subIds.includes(item.currentNode.id)) {
      const newParent = item.currentNode;
      const { currentNode, parentNode } = selectedSequenceItem;
      const parentBranch = parentNode.currentNode;

      parentBranch.children = parentBranch.children.filter(
        (child: any) => child.id !== currentNode.id
      );
      await window.electron.updateBranch(parentBranch);
      newParent.children.push(currentNode);
      await window.electron.updateBranch(newParent);
      asyncLoadFn();
    } else {
      setSelectedSequenceItem(item);
    }
    setSubIds([]);
  };

  const deleteNode = async (deleteId: any) => {
    setSelectedSequenceItem(selectedSequenceItem.parentNode);
    // setSelectedId(selectedSequenceItem.parentNode.id);
    window.electron.cutBranch(deleteId);
    asyncLoadFn();
  };

  const save = async (data: any, parentObject: any) => {
    if (data.id) {
      await window.electron.updateBranch(data);
    } else {
      const { id } = parentObject;
      await window.electron.addBranch(id, data);
    }
    asyncLoadFn();
  };

  const getMethodForUID = (uid: string) => {
    const { actions } = flow;
    if (actions) {
      return actions.find((a: any) => a.uid === uid);
    }
  };

  const changeParent = () => {
    if (subIds.length === 0) {
      const { currentNode } = selectedSequenceItem;
      const { url } = currentNode;

      window.console.log('Changing parent', url);
      const isGlobal = (
        getMethodForUID(selectedSequenceItem.currentNode.methodUid) || {}
      ).isGlobal;
      const ids = getNodesForFilter(
        flow?.graph?.[0],
        (node: any) => isGlobal || node.exitUrl === url
      ).map((elem: any) => elem.id);
      setSubIds(ids);
    } else {
      setSubIds([]);
    }
  };

  window.ipcRender.receive('action-finished', (id: string) => {
    // console.log('action-finished', id);
    setLoadingIds((ids: any) => ids.filter((i: any) => i !== id));
  });

  window.ipcRender.receive('run-completed', async (id: string) => {
    setLoadingIds([]);
    reloadWorkspace();
  });

  const runDiscovery = async (element: any, skipDiscovery = false) => {
    setRunning(true);
    const localLoadingIds: any[] = [];
    function addToSeq(element: any, sequence: string[]) {
      const { currentNode, parentNode, skip } = element;

      if (parentNode && parentNode.id > 0) {
        addToSeq(parentNode, sequence);
      }

      sequence.push(currentNode.id);
      localLoadingIds.push(currentNode.id);
      return sequence;
    }
    window.electron.runDiscovery(
      [{ sequences: addToSeq(element, []) }],
      skipDiscovery === true
    );
    setLoadingIds([
      ...localLoadingIds,
      localLoadingIds[localLoadingIds.length - 1] + '-discovery',
    ]);
  };

  const runSequence = async (sequence: string[][], skipDiscovery = false) => {
    window.electron.runDiscovery(sequence, skipDiscovery);
  };

  useEffect(() => {
    const asyncFn = async () => {
      const config = await window.electron.getConfig();
      setConfig(config);
    };
    asyncFn();
  }, []);

  useEffect(() => {
    if (!config?.rootUrl) {
      setOpenDialog(true);
    } else {
      setOpenDialog(false);
    }
  }, [config]);

  const mainLayout = (
    <DragLayout
      orientation="horizontal"
      defaultSize={300}
      contextKey="navigationPanelHeight"
      left={
        <LeftNav
          flow={flow}
          subIds={subIds}
          runDiscovery={runDiscovery}
          key={flowState}
          highlightedMethod={highlightedMethod}
          loadingIds={loadingIds}
          selectSequenceItem={selectSequenceItem}
          selectedSequenceItem={selectedSequenceItem}
        />
      }
    >
      <DragLayout
        orientation={mainLayoutHoriz ? 'horizontal-reversed' : 'vertical'}
        contextKey={
          mainLayoutHoriz ? 'consolePanelHeight' : 'consolePanelWidth'
        }
        defaultSize={200}
        minSize={20}
        left={
          <Console
            mainLayoutHoriz={mainLayoutHoriz}
            setMainLayoutHoriz={setMainLayoutHoriz}
          />
        }
      >
        <>
          {selectedSequenceItem ? (
            <SequenceItemPanel
              key={selectedSequenceItem.id}
              deleteNode={deleteNode}
              selectedSequenceItem={selectedSequenceItem}
              changeParent={changeParent}
              runDiscovery={runDiscovery}
              save={save}
              path={path}
            />
          ) : (
            <NonIdealState
              title="No node selected"
              description="Select a node from the left navigation panel"
              icon="info-sign"
              iconSize={48}
            />
          )}
          <DialogComponent
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            config={config}
            setConfig={setConfig}
            title="Configure setup project base URL"
          />
        </>
      </DragLayout>
    </DragLayout>
  );

  return (
    <Tabs
      id="workspace-tabs"
      vertical={true}
      onChange={(id: string) => setTab(id)}
      renderActiveTabPanelOnly={true}
      selectedTabId={tab}
    >
      <Tab
        id="workspaces"
        title={<Icon icon="box" size={24} title="Workspaces" />}
        panel={<Workspaces selectWorkspace={reloadWorkspace} />}
      />

      {workspace && (
        <Tab
          id="config"
          title={<Icon icon="cog" size={24} title="Config" />}
          panel={<Config />}
        />
      )}
      <Tab
        id="mainLayout"
        title={
          <Icon
            icon="panel-stats"
            size={24}
            title={workspace?.name && workspace?.name}
          />
        }
        panel={mainLayout}
      />
      <Tab
        id="methods"
        title={<Icon icon="code" size={24} title="Methods" />}
        panel={
          <Methods
            setHighlightedMethod={(id) => {
              setHighlightedMethod(id);
              setTab('mainLayout');
            }}
          />
        }
        disabled={!flow?.graph}
      />

      <Tab
        id="sequences"
        title={<Icon icon="gantt-chart" size={24} title="Sequences" />}
        panel={<SequencesPanel flow={flow} runSequence={runSequence} />}
        disabled={!flow?.graph}
      />

      <Tab
        id="generator"
        title={<Icon icon="code-block" size={24} title="Cypress Tests" />}
        panel={<Generate />}
      />
    </Tabs>
  );
}
