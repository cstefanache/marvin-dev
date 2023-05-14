import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Models } from '@marvin/discovery';
import { DragLayout } from '../components/DragLayout/DragLayout';
import { Icon, InputGroup, Tabs, Tab, NonIdealState } from '@blueprintjs/core';
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
  const [subIds, setSubIds] = useState<any>([]);
  const [highlightedMethod, setHighlightedMethod] = useState<string | null>(
    null
  );
  const [mainLayoutHoriz, setMainLayoutHoriz] = useState<boolean>(false);

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
  }, [navigate]);

  function reloadWorkspace() {
    asyncLoadFn();
  }

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
        flow.graph[0],
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
            iconSize={100}
          />
        )}
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
        title={<Icon icon="box" size={24} title="Projects" />}
        panel={<Workspaces selectWorkspace={reloadWorkspace} />}
      />
      <Tab
        id="mainLayout"
        title={<Icon icon="panel-stats" size={24} title="Workspace" />}
        panel={mainLayout}
      />
      {workspace && (
        <Tab
          id="config"
          title={<Icon icon="cog" size={24} title="Config" />}
          panel={<Config />}
        />
      )}

      <Tab
        id="methods"
        title={<Icon icon="code" size={24} title="Show Methods" />}
        panel={
          <Methods
            setHighlightedMethod={(id) => {
              setHighlightedMethod(id);
              setTab('mainLayout');
            }}
          />
        }
      />

      <Tab
        id="sequences"
        title={<Icon icon="gantt-chart" size={24} title="Sequences" />}
        panel={<SequencesPanel flow={flow} runSequence={runSequence} />}
      />

      <Tab
        id="generator"
        title={<Icon icon="code-block" size={24} title="Generate Tests" />}
        panel={<Generate />}
      />
    </Tabs>
  );
}
