import { Icon } from '@blueprintjs/core';
import { ReactElement, useEffect, useState } from 'react';
import TreeView from 'react-accessible-treeview';
import { localFlattenTree } from '../../app/utils';
import './FlowNavigator.scss';
interface FlowNavigatorProps {
  highlightedMethod?: string;
  graph: any;
  focusId?: string;
  onSelect?: Function;
  autoExpand?: boolean;
  actions?: Function;
  sequenceFilter?: string;
}

export function FlowNavigator(props: FlowNavigatorProps) {
  const {
    onSelect,
    graph,
    actions,
    highlightedMethod,
    autoExpand,
    sequenceFilter,
  } = props;
  const [flow, setFlow] = useState<any>(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedId, setSelectedId] = useState<null | number>(null);
  const [loadingIds, setLoadingIds] = useState<any>([]);
  const [subIds, setSubIds] = useState<any>([]);
  const [selectedNode, setSelectedNode] = useState<null | any>(null);

  useEffect(() => {
    const localFlat = localFlattenTree({
      sequenceStep: '[root] ',
      skip: true,
      children: graph,
    });
    setExpandedIds([]);
    setFlow(localFlat);
    if (autoExpand) {
      console.log('Executed')
    }
  }, [graph[0].id]);

  useEffect(() => {
    if (flow && autoExpand) {
      const expandedIds = flow.reduce((memo: any, i: any) => {
        if (i.children) {
          memo.push(i.id);
        }
        return memo;
      }, []);
      setExpandedIds(expandedIds);
    }
  }, [flow]);

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

  const selectElement = async (element: any) => {};

  const runDiscovery = async (element: any) => {};
  return !flow ? (
    <div>No graph loaded</div>
  ) : (
    <TreeView
      data={flow}
      className="flow-tree-view"
      expandedIds={expandedIds}
      onExpand={(prop) => {
        const { element, treeState } = prop;
        if (element) {
          const { children } = element;
          const expandedIdsList = Array.from(prop.treeState.expandedIds).filter(
            (item) => !children.includes(item)
          );
          setExpandedIds(expandedIdsList);
        }
      }}
      nodeRenderer={({
        element,
        getNodeProps,
        isBranch,
        isExpanded,
        level,
        handleSelect,
      }) =>
        (!sequenceFilter ||
          sequenceFilter.length === 0 ||
          element.name.includes(sequenceFilter)) && (
          <div
            key={element.id}
            onClick={() => onSelect && onSelect(element)}
            className={
              (highlightedMethod &&
              highlightedMethod === (element as any).currentNode.methodUid
                ? 'highlight'
                : '') +
              ' ' +
              (selectedId && selectedId === element.id ? 'selected' : '') +
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
              {element.children?.length > 0 && isBranch && !isExpanded && (
                <Icon size={14} icon="chevron-right" />
              )}
              {element.children?.length > 0 && isBranch && isExpanded && (
                <Icon size={14} icon="chevron-down" />
              )}
              {(!isBranch || element.children?.length === 0) && (
                <Icon size={12} icon="dot" />
              )}
            </span>
            <span className="sequence" onClick={() => selectElement(element)}>
              {getIconFor((element as any).currentNode, isExpanded)}
              {getActionFor((element as any).currentNode, isExpanded)}
              {element.name}
            </span>
            <span className="actions">
              {actions && actions(element)}
              <Icon
                size={12}
                icon="play"
                onClick={() => runDiscovery(element)}
              />
            </span>
          </div>
        )
      }
    />
  );
}
