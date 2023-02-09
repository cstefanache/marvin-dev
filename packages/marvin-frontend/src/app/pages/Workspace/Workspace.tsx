import React, { useEffect, useState } from 'react';
import { Icon } from '@blueprintjs/core';
import TreeView from 'react-accessible-treeview';
import { AddMethod } from '../../components/AddMethod/AddMethod';
import { localFlattenTree } from '../../utils';
import './workspace.scss';
import MainPanel from './MainPanel';

interface Props {
  workspace: {
    name: string;
    path: string;
  };
}

export default function Workspace({ workspace }: Props) {
  const [path, setPath] = useState(null);
  const [flow, setFlow] = React.useState<any>(null);
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [actions, setActions] = React.useState<any>(null);
  const [expandedIds, setExpandedIds] = React.useState<any>([]);
  const [selectedId, setSelectedId] = React.useState<null | number>(null);
  const [selectedNode, setSelectedNode] = React.useState<null | any>(null);
  const [loadingIds, setLoadingIds] = React.useState<any>([]);

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

  const loadFlow = async () => {
    const flow = await window.electron.getFlow();
    const config = await window.electron.getConfig();
    const path = await window.electron.getWorkspacePath();

    const { graph, actions } = flow;

    const localFlat = localFlattenTree({
      sequenceStep: config.name,
      skip: true,
      children: graph,
    });

    setExpandedIds(localFlat.map((i: any) => i.id));
    setPath(path);
    setFlow(localFlat);
    setConfig(config);
    setActions(actions);
    setLoading(false);
  };

  useEffect(() => {
    const asyncFn = async () => {
      await loadFlow();
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
      const expandedIds = localFlat.reduce((memo: any[], i: any) => {
        if (i.children && i.children.length) {
          memo.push(i.id);
        }
        return memo;
      }, []);
      setExpandedIds(expandedIds);
      setFlow(localFlat);
    });

    window.ipcRender.receive('flow-updated', async (flow: any) => {
      const config = await window.electron.getConfig();
      const { graph, actions } = flow;

      const localFlat = localFlattenTree({
        sequenceStep: config.name,
        skip: true,
        children: graph,
      });
      const expandedIds = localFlat.reduce((memo: any[], i: any) => {
        if (i.children && i.children.length) {
          memo.push(i.id);
        }
        return memo;
      }, []);
      setExpandedIds(expandedIds);
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

  // const openDrawer = (type: string, title: string, props: any, data?: any) => {
  //   setDrawerTitle(title);
  //   switch (type) {
  //     case 'addMethod':
  //       const properties = { ...{ parent: props, title }, save };
  //       setDrawerElement(<AddMethod {...properties} data={data} />);
  //       break;
  //   }
  // };

  // const getIconFor = (className: string, handleSelect: any) => {
  //   if (className.indexOf('tree-node__branch') !== -1) {
  //     if (className.indexOf('--expanded') !== -1) {
  //       return <Icon icon="cube" onClick={handleSelect} />;
  //     } else {
  //       return (
  //         <Icon
  //           icon="cube-add"
  //           onClick={(e: any) => {
  //             handleSelect(e);
  //           }}
  //         />
  //       );
  //     }
  //   } else {
  //     return <Icon icon="code" />;
  //   }
  // };

  const selectElement = (element: any) => {
    setSelectedNode(element);
    setSelectedId(element.id);
  };

  const getIconFor = (currentNode: any, isExpanded: boolean) => {
    if (loadingIds.includes(currentNode.id)) {
      return <Icon icon="cog" />;
    } else if (loadingIds.includes(currentNode.id + '-discovery')) {
      return <Icon icon="search-template" />;
    } else if (currentNode.method) {
      return <Icon icon="code-block" />;
    } else if (!currentNode.method && isExpanded) {
      return <Icon icon="folder-open" />;
    } else if (!currentNode.method && !isExpanded) {
      return <Icon icon="folder-close" />;
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
                loadingIds.length > 0 ? 'running' : ''
              }`}
              style={{ width: navWidth, minWidth: navWidth }}
            >
              <TreeView
                data={flow}
                key={expandedIds.join(',')}
                expandedIds={expandedIds}
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
                    style={{ paddingLeft: 10 * (level - 1) }}
                  >
                    <span {...getNodeProps()}>
                      {element.children?.length > 0 &&
                        isBranch &&
                        !isExpanded && <Icon icon="chevron-right" />}
                      {element.children?.length > 0 &&
                        isBranch &&
                        isExpanded && <Icon icon="chevron-down" />}
                      {(!isBranch || element.children?.length === 0) && (
                        <Icon icon="dot" />
                      )}
                    </span>
                    <span
                      className="sequence"
                      onClick={() => selectElement(element)}
                    >
                      {getIconFor((element as any).currentNode, isExpanded)}

                      {element.name}
                    </span>
                    <Icon icon="play" onClick={() => runDiscovery(element)} />
                  </div>
                )}
              />
            </div>
            <MainPanel
              selectedElement={selectedNode}
              runDiscovery={runDiscovery}
              key={selectedNode?.currentNode?.id}
              save={save}
              deleteNode={deleteNode}
              path={path}
            />
          </div>
        </>
      )}
    </div>
  );
}
