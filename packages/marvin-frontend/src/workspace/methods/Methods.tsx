import { Alert, Icon, InputGroup, Intent } from '@blueprintjs/core';
import { ReactNode, useEffect, useState, useMemo, useRef } from 'react';
import TreeView from 'react-accessible-treeview';
import { localFlattenTree } from '../../utils';
import './MethodsStyles.scss';
import CreateMethod from '../sequencePanel/addMethod/CreateMethod';

export default function Methods(props: any) {
  const { setHighlightedMethod } = props;
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [actions, setActions] = useState<any>(null);
  const [expandedIds, setExpandedIds] = useState<any>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [exitUrl, setExitUrl] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<any>(null);

  const init = async () => {
    const flow = await window.electron.getFlow();
    const config = await window.electron.getConfig();
    const { graph, actions } = flow;

    const getCountForMethod = (uid: string) => {
      let count = 0;
      const goInto = (children: any[]) => {
        children.forEach((item) => {
          if (item.methodUid === uid) {
            count += 1;
          }
          goInto(item.children || []);
        });
      };

      goInto(graph);

      return count;
    };

    const paths = actions.reduce(
      (memo: any, item) => {
        let { path } = item;

        const groupPath = item.isGlobal ? 'Global' : path;

        if (!memo[groupPath]) {
          memo[path] = {
            name: groupPath,
            children: [],
          };
        }

        memo[groupPath].children.push({
          ...item,
          name: item.method,
          useCount: getCountForMethod(item.uid),
        });

        return memo;
      },
      {
        Global: {
          name: 'Global',
          children: [],
        },
      }
    );

    const localMethodsGraph = {
      name: 'root',
      children: Object.keys(paths).map((key) => ({
        name: key,
        children: paths[key].children,
      })),
    };
    const flatten = localFlattenTree(localMethodsGraph);
    setExpandedIds(flatten.map((i: any) => i.id));
    setActions(flatten);
  };

  useEffect(() => {
    init();
  }, []);

  const handleDelete = (node: any) => (evt: any) => {
    setDeleteId(node.uid);
  };

  const handleHighlight = (node: any) => (evt: any) => {
    setHighlightedMethod(node.uid);
  };

  const handleDeleteConfirm = async () => {
    await window.electron.deleteMethod(deleteId);
    setDeleteId(null);
    init();
  };

  return (
    <div className="methods">
      <div className="methods__navigation">
        <InputGroup
          value={filter}
          leftIcon="filter"
          onChange={(e) => {
            setFilter(e.target.value);
          }}
        />
        {actions && (
          <TreeView
            data={actions}
            key={expandedIds.join(',')}
            expandedIds={expandedIds}
            nodeRenderer={({
              element,
              getNodeProps,
              isBranch,
              isExpanded,
              level,
              handleSelect,
            }) => {
              const { currentNode, parentNode } = element as any;
              return !filter ||
                filter.length === 0 ||
                currentNode.name
                  .toLowerCase()
                  .includes(filter.toLowerCase()) ? (
                <div
                  {...getNodeProps()}
                  onClick={() => {
                    if (currentNode.path !== undefined) {
                      setExitUrl(currentNode.path)
                      setSelectedMethod(element);
                    }
                  }}
                  style={{ paddingLeft: 20 * (level - 1) }}
                >
                  {element.children?.length > 0 && isBranch && !isExpanded && (
                    <Icon icon="chevron-right" />
                  )}
                  {element.children?.length > 0 && isBranch && isExpanded && (
                    <Icon icon="chevron-down" />
                  )}
                  {(!isBranch || element.children?.length === 0) && (
                    <Icon icon="code-block" />
                  )}
                  <span className="navigation-item">
                    <span className="filler">
                      {currentNode.name.trim().length === 0
                        ? '[root]'
                        : currentNode.name}
                      {parentNode && currentNode.useCount
                        ? ` (${currentNode.useCount})`
                        : ''}
                    </span>
                    {currentNode.useCount === 0 && currentNode.uid && (
                      <Icon icon="trash" onClick={handleDelete(currentNode)} />
                    )}

                    {currentNode.useCount > 0 && (
                      <Icon
                        icon="highlight"
                        onClick={handleHighlight(currentNode)}
                      />
                    )}
                  </span>
                </div>
              ) : null;
            }}
          />
        )}
      </div>
      <div className="methods__content">
        {exitUrl !== null && (
          <CreateMethod
            key={`${selectedMethod?.currentNode?.name} ${exitUrl}`}
            selectedMethod={selectedMethod?.currentNode}
            exitUrl={exitUrl}
            closePanel={init}
          />
        )}
      </div>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        icon="trash"
        intent={Intent.DANGER}
        isOpen={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      >
        <p>Are you sure you want to delete this method?</p>
      </Alert>
    </div>
  );
}
