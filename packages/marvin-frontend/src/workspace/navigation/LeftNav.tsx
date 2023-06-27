import { DragLayout } from '../../components/DragLayout/DragLayout';
import { Button, Icon, InputGroup } from '@blueprintjs/core';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import { FlowNavigator } from '../../components/FlowNavigator/FlowNavigator';
import { useContext, useEffect, useState } from 'react';
import { TreeItem } from '../sequencePanel/SequenceItemPanel';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { localFlattenTree } from '../../utils';
import ActionsMenu from './ActionsMenu';

export interface SequenceItemPanelProps {
  selectedSequenceItem: TreeItem;
  changeParent: Function;
  // runDiscovery: Function;
  save: Function;
  deleteNode: Function;
  path: string;
}

export function LeftNav(props: any, itemPanel: SequenceItemPanelProps) {
  const {
    loadingIds,
    subIds,
    highlightedMethod,
    runDiscovery,
    selectedSequenceItem,
  } = props;
  const { deleteNode, changeParent, save } = itemPanel;

  const workspaceContext = useContext(WorkspaceContext);
  const [focus, setFocus] = useState<any>(workspaceContext.focus);
  const [sequenceFilter, setSequenceFilter] = useState<string | undefined>(
    undefined
  );

  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setData(selectedSequenceItem?.currentNode);
  }, [selectedSequenceItem]);

  const focusPanel = (
    <TitlePanel
      title="Focus"
      suffix={[
        focus ? (
          <Icon
            icon="filter-remove"
            size={12}
            title="Clear Filter"
            onClick={() => {
              setFocus(undefined);
              workspaceContext.focus = undefined;
            }}
          />
        ) : undefined,
        <Icon icon="expand-all" size={12} />,
        <Icon icon="collapse-all" size={12} />,
      ]}
    >
      {props.flow ? (
        <FlowNavigator
          runDiscovery={(elem) => {
            const { currentNode } = elem;
            const { id } = currentNode;

            const localFlat = localFlattenTree({
              sequenceStep: '[root] ',
              skip: true,
              children: props.flow.graph,
            });

            const executeOn = localFlat.find(
              (item: any) => item.currentNode.id === id
            );
            if (executeOn) {
              runDiscovery(executeOn);
            }
          }}
          subIds={subIds}
          highlightedMethod={highlightedMethod}
          key={focus ? focus.currentNode.id : props.flow.graph.id}
          graph={focus ? [focus.currentNode] : props.flow.graph}
          selectedId={selectedSequenceItem?.currentNode.id}
          onSelect={props.selectSequenceItem}
          loadingIds={loadingIds}
          autoExpand={true}
        />
      ) : (
        <div>Loading</div>
      )}
    </TitlePanel>
  );

  return (
    <DragLayout
      orientation="vertical"
      left={focusPanel}
      contextKey="navigationPanelHeight"
    >
      <TitlePanel
        title={
          sequenceFilter && sequenceFilter.length ? (
            <span>
              Navigation <Icon icon="filter" size={10} />
            </span>
          ) : (
            'Navigation'
          )
        }
        suffix={[
          <Icon icon="expand-all" size={12} title="Expand All" />,
          <Icon icon="collapse-all" size={12} title="Collapse All" />,
        ]}
      >
        <>
          <div>
            <InputGroup
              leftIcon="filter"
              rightElement={
                <Button
                  icon="delete"
                  minimal={true}
                  onClick={() => {
                    setSequenceFilter('');
                  }}
                />
              }
              placeholder="Filter by name"
              value={sequenceFilter}
              onChange={(evt) => {
                setSequenceFilter(evt.target.value);
              }}
            />
          </div>
          {props.flow ? (
            <FlowNavigator
              graph={props.flow.graph}
              sequenceFilter={sequenceFilter}
              subIds={subIds}
              highlightedMethod={highlightedMethod}
              autoExpand={true}
              loadingIds={loadingIds}
              selectedId={selectedSequenceItem?.currentNode.id}
              onSelect={props.selectSequenceItem}
              menu={(element) => (
                <ActionsMenu
                  element={element}
                  selectSequenceItem={props.selectSequenceItem}
                  changeParent={changeParent}
                  selectedElement={selectedSequenceItem}
                  run={(skipDiscovery = false) =>
                    runDiscovery(element, skipDiscovery)
                  }
                  addBranch={() => setData(null)}
                  newFolder={(name: string) => {
                    save(
                      {
                        sequenceStep: name,
                        children: [],
                        url: selectedSequenceItem.currentNode.exitUrl,
                      },
                      selectedSequenceItem.currentNode
                    );
                  }}
                  deleteNode={deleteNode}
                />
              )}
            />
          ) : (
            <div>Loading</div>
          )}
        </>
      </TitlePanel>
    </DragLayout>
  );
}
