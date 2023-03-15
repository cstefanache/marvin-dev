import { DragLayout } from '../components/DragLayout/DragLayout';
import { Button, Icon, InputGroup } from '@blueprintjs/core';
import { TitlePanel } from '../components/TitlePanel/TitlePanel';
import { FlowNavigator } from '../components/FlowNavigator/FlowNavigator';
import { useState } from 'react';

export function LeftNav(props: { flow: any }) {
  const [focus, setFocus] = useState<any>(undefined);
  const [sequenceFilter, setSequenceFilter] = useState<string | undefined>(
    'Audience'
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
          key={focus ? focus.id : props.flow.graph.id}
          graph={focus ? [focus] : props.flow.graph}
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
      defaultSize={window.document.body.clientHeight / 2}
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
            graph={props.flow.graph}
            sequenceFilter={sequenceFilter}
            autoExpand={true}
            onSelect={(elem) => {}}
            actions={(elem: any) => (
              <Icon
                icon="locate"
                size={12}
                title="Show in focus window"
                onClick={() => {
                  setFocus(elem.currentNode);
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
