import { DragLayout } from '../../components/DragLayout/DragLayout';
import { Button, Icon, InputGroup } from '@blueprintjs/core';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import { FlowNavigator } from '../../components/FlowNavigator/FlowNavigator';
import { useContext, useState } from 'react';
import { Models } from '@marvin/discovery';
import { TreeItem } from '../sequencePanel/SequenceItemPanel';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { localFlattenTree } from '../../utils';

export function LeftNav(props: {
  flow: any;
  selectSequenceItem: Function;
  selectedSequenceItem?: TreeItem;
  loadingIds: string[];
  subIds: string[];
  runDiscovery: Function;
  highlightedMethod?: string;
}) {
  const {
    selectedSequenceItem,
    loadingIds,
    runDiscovery,
    subIds,
    highlightedMethod,
  } = props;
  const workspaceContext = useContext(WorkspaceContext);
  const [focus, setFocus] = useState<any>(workspaceContext.focus);
  const [sequenceFilter, setSequenceFilter] = useState<string | undefined>(
    undefined
  );
  const focusPanel = (
    <TitlePanel
      title="Focus"
      suffix={[
        <Icon icon="expand-all" size={12} />,
        <Icon icon="collapse-all" size={12} />,
      ]}
    >
      {props.flow ? (
        <FlowNavigator
          runDiscovery={(elem) => {
            // console.log(elem);
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
        collapsible={
          <InputGroup
            leftIcon="filter"
            rightElement={
              <Button
                icon="delete"
                minimal={true}
                onClick={() => {
                  setSequenceFilter(undefined);
                }}
              />
            }
            placeholder="Filter"
            value={sequenceFilter}
            onChange={(evt) => {
              setSequenceFilter(evt.target.value);
            }}
          />
        }
        suffix={[
          <Icon icon="expand-all" size={12} title="Expand All" />,
          <Icon icon="collapse-all" size={12} title="Collapse All" />,
        ]}
      >
        {props.flow ? (
          <FlowNavigator
            runDiscovery={runDiscovery}
            graph={props.flow.graph}
            sequenceFilter={sequenceFilter}
            subIds={subIds}
            highlightedMethod={highlightedMethod}
            autoExpand={true}
            loadingIds={loadingIds}
            selectedId={selectedSequenceItem?.currentNode.id}
            onSelect={props.selectSequenceItem}
            actions={(elem: any) => (
              <Icon
                icon="locate"
                size={12}
                title="Show in focus window"
                onClick={() => {
                  console.log(elem);
                  workspaceContext.focus = elem;
                  setFocus(elem);
                }}
              />
            )}
          />
        ) : (
          <div>Loading</div>
        )}
      </TitlePanel>
    </DragLayout>
  );
}
