import React, { useEffect, useState } from 'react';
import { Icon } from '@blueprintjs/core';
import TreeView from 'react-accessible-treeview';
import { AddMethod } from '../../components/AddMethod/AddMethod';
import { localFlattenTree } from '../../utils';
import './workspace.scss';
import MainPanel from './MainPanel';
import RunningPanel from './Running';

interface Props {
  highlightedMethod: any;
  expandedIds?: any[];
  setExpandedIds: Function;
  workspace: {
    name: string;
    path: string;
  };
}

export default function Workspace({
  workspace,
  highlightedMethod,
  expandedIds,
  setExpandedIds,
}: Props) {
  const [path, setPath] = useState(null);
  const [flow, setFlow] = React.useState<any>(null);
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [actions, setActions] = React.useState<any>(null);

  const [selectedId, setSelectedId] = React.useState<null | number>(null);
  const [selectedNode, setSelectedNode] = React.useState<null | any>(null);
  const [loadingIds, setLoadingIds] = React.useState<any>([]);
  const [running, setRunning] = React.useState(false);
  const [subIds, setSubIds] = React.useState<any>([]);

  const [navWidth, setNavWidth] = React.useState<number>(300);

  const parseChildren = (children: any[], map: any = {}): void =>
    children.reduce((memo, item) => {
      map[item.id] = item;
      return memo.concat({
        name: item.sequenceStep,
        id: item.id,
        children: parseChildren(item.children, map),
      });
    }, []);

  const loadFlow = async (initial = false) => {
    console.log('load flow', initial);
    const flow = await window.electron.getFlow();
    const config = await window.electron.getConfig();
    const path = await window.electron.getWorkspacePath();

    const { graph, actions } = flow;

    const localFlat = localFlattenTree({
      sequenceStep: config.name,
      skip: true,
      children: graph,
    });

    console.log(expandedIds);
    // if (expandedIds === undefined) {
    //   console.log('expanding!!!!')
    //   setExpandedIds(localFlat.map((i: any) => i.id));
    // }
    setPath(path);
    setFlow(localFlat);
    setConfig(config);
    setActions(actions);
    setLoading(false);
  };

  useEffect(() => {
    const asyncFn = async () => {
      await loadFlow(true);
    };
    asyncFn();

    window.ipcRender.receive('config-updated', (config: any) => {
      setConfig(config);
    });

    window.ipcRender.receive('action-finished', (id: string) => {
      // console.log('action-finished', id);
      setLoadingIds((ids: any) => ids.filter((i: any) => i !== id));
    });

    window.ipcRender.receive('run-completed', async (id: string) => {
      const flow = await window.electron.getFlow();
      const config = await window.electron.getConfig();
      const { graph, actions } = flow;
      const localFlat = localFlattenTree({
        sequenceStep: config.name,
        skip: true,
        children: graph,
      });

      setFlow(localFlat);
      setRunning(false);
    });

    window.ipcRender.receive('flow-updated', async (flow: any) => {
      const config = await window.electron.getConfig();
      const { graph, actions } = flow;

      const localFlat = localFlattenTree({
        sequenceStep: config.name,
        skip: true,
        children: graph,
      });

      setFlow(localFlat);
      setLoadingIds([]);
    });
  }, []);

  const save = async (data: any, parentObject: any) => {
    setLoading(true);
    if (data.id) {
      await window.electron.updateBranch(data);
    } else {
      const { id } = parentObject;
      await window.electron.addBranch(id, data);
    }
    // setDrawerElement(null);
    loadFlow();
  };

  const deleteNode = async (deleteId: any) => {
    setSelectedNode(selectedNode.parentNode);
    setSelectedId(selectedNode.parentNode.id);
    window.electron.cutBranch(deleteId);
  };

  const runDiscovery = async (element: any) => {
    setRunning(true);
    const localLoadingIds: any[] = [];
    function addToSeq(element: any, sequence: string[]) {
      const { currentNode, parentNode, skip } = element;

      if (parentNode && parentNode.id > 0) {
        addToSeq(parentNode, sequence);
      }

      sequence.push(currentNode.sequenceStep);
      localLoadingIds.push(currentNode.id);
      return sequence;
    }

    window.electron.runDiscovery(addToSeq(element, []));
    setLoadingIds([
      ...localLoadingIds,
      localLoadingIds[localLoadingIds.length - 1] + '-discovery',
    ]);
  };

  const selectElement = async (element: any) => {
    if (subIds.includes(element.currentNode.id)) {
      const newParent = element.currentNode;
      const { currentNode, parentNode } = selectedNode;
      const parentBranch = parentNode.currentNode;

      parentBranch.children = parentBranch.children.filter(
        (child: any) => child.id !== currentNode.id
      );
      await window.electron.updateBranch(parentBranch);
      newParent.children.push(currentNode);
      await window.electron.updateBranch(newParent);
      loadFlow();
    } else {
      setSelectedNode(element);
      setSelectedId(element.id);
    }
    setSubIds([]);
  };

  const changeParent = () => {
    if (subIds.length === 0) {
      const { currentNode } = selectedNode;
      const { url } = currentNode;
      const menuItems = flow.filter(
        (item: any) => item.currentNode.exitUrl === url
      );

      setSubIds(menuItems.map((item: any) => item.currentNode.id));
    } else {
      setSubIds([]);
    }
  };

  const getIconFor = (currentNode: any, isExpanded: boolean) => {
    if (loadingIds.includes(currentNode.id)) {
      return <Icon size={12} icon="cog" />;
    } else if (loadingIds.includes(currentNode.id + '-discovery')) {
      return <Icon size={12} icon="search-template" />;
    } else if (currentNode.method) {
      return <Icon size={12} icon="code-block" style={{ color: '#00B7FF' }} />;
    } else if (!currentNode.method && isExpanded) {
      return <Icon size={12} icon="folder-open" style={{ color: '#FFC100' }} />;
    } else if (!currentNode.method && !isExpanded) {
      return (
        <Icon size={12} icon="folder-close" style={{ color: '#FFB900' }} />
      );
    }
  };

  const getActionFor = (listNode: any, isExpanded: boolean) => {
    if (
      subIds.includes(listNode.id) &&
      selectedNode.currentNode.id !== listNode.id
    ) {
      return <Icon size={12} icon="inheritance" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {!flow || !config || !path || loading ? (
        <h3>Loading</h3>
      ) : (
        <>
          <div className="workspace-layout">
            <div
              className={`workspace-layout__graph ${
                loadingIds.length > 0 ? 'processing' : ''
              }`}
              style={{
                width: navWidth,
                minWidth: navWidth,
                height: 'calc(100vh - 50px)',
              }}
            >
              <TreeView
                data={flow}
                expandedIds={expandedIds}
                onExpand={(prop) => {
                  const { element, treeState } = prop;
                  const { children } = element;
                  const expandedIdsList = Array.from(
                    prop.treeState.expandedIds
                  ).filter((item) => !children.includes(item));
                  setExpandedIds(expandedIdsList);
                }}
                nodeRenderer={({
                  element,
                  getNodeProps,
                  isBranch,
                  isExpanded,
                  level,
                  handleSelect,
                }) => (
                  <div
                    key={element.id}
                    className={
                      (highlightedMethod &&
                      highlightedMethod ===
                        (element as any).currentNode.methodUid
                        ? 'highlight'
                        : '') +
                      ' ' +
                      (selectedId && selectedId === element.id
                        ? 'selected'
                        : '') +
                      ' ' +
                      (loadingIds.includes((element as any).currentNode.id)
                        ? 'running'
                        : loadingIds.includes(
                            (element as any).currentNode.id + '-discovery'
                          )
                        ? 'discovery'
                        : '')
                    }
                    style={{ paddingLeft: 5 * (level - 1) }}
                  >
                    <span {...getNodeProps()}>
                      {element.children?.length > 0 &&
                        isBranch &&
                        !isExpanded && <Icon size={14} icon="chevron-right" />}
                      {element.children?.length > 0 &&
                        isBranch &&
                        isExpanded && <Icon size={14} icon="chevron-down" />}
                      {(!isBranch || element.children?.length === 0) && (
                        <Icon size={12} icon="dot" />
                      )}
                    </span>
                    <span
                      className="sequence"
                      onClick={() => selectElement(element)}
                    >
                      {getIconFor((element as any).currentNode, isExpanded)}
                      {getActionFor((element as any).currentNode, isExpanded)}
                      {element.name}
                    </span>
                    <Icon
                      size={12}
                      icon="play"
                      onClick={() => runDiscovery(element)}
                    />
                  </div>
                )}
              />
            </div>
            {!running && (
              <MainPanel
                changeParent={changeParent}
                selectedElement={selectedNode}
                runDiscovery={runDiscovery}
                save={save}
                deleteNode={deleteNode}
                path={path}
              />
            )}
            {running && <RunningPanel path={path} loadingIds={loadingIds} />}
          </div>
        </>
      )}
    </div>
  );
}
