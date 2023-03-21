import { DragLayout } from '../../components/DragLayout/DragLayout';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import { useContext, useEffect, useState } from 'react';
import { Models } from '@marvin/discovery';
import Summary from './summary/Summary';
import { AddMethod } from './addMethod/AddMethod';
import { Button, Icon, NonIdealState, Tab, Tabs } from '@blueprintjs/core';
import DiscoveredElements from './discovered/Discovered';
import './SequenceItemPanel.scss';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';

export interface TreeItem {
  id: number;
  name: string;
  currentNode: Models.ActionItem;
  parentNode: TreeItem | undefined;
}

export interface SequenceItemPanelProps {
  selectedSequenceItem: TreeItem;
  changeParent: Function;
  runDiscovery: Function;
  save: Function;
  deleteNode: Function;
  path: string;
}

export function SequenceItemPanel(props: SequenceItemPanelProps) {
  const {
    selectedSequenceItem,
    changeParent,
    runDiscovery,
    save,
    deleteNode,
    path,
  } = props;
  const { currentNode, parentNode } = selectedSequenceItem;
  const workspaceContext = useContext(WorkspaceContext);
  const [data, setData] = useState<any | null>(null);
  const [tab, setTab] = useState<string>(
    workspaceContext.selectedPanel || 'discovered'
  );

  useEffect(() => {
    setData(selectedSequenceItem.currentNode);
  }, [selectedSequenceItem]);

  return (
    <DragLayout
      orientation="horizontal"
      contextKey="methodPanelWidth"
      left={
        <TitlePanel
          title="Method"
          suffix={[
            <Summary
              changeParent={changeParent}
              selectedElement={selectedSequenceItem}
              run={() => runDiscovery(selectedSequenceItem)}
              addBranch={() => setData(null)}
              newFolder={(name: string) => {
                // console.log('new folder');
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
            />,
          ]}
        >
          <AddMethod
            exitUrl={data ? currentNode.url : currentNode.exitUrl}
            title={data?.method ? 'Edit Method Execution' : 'Add Method'}
            parent={data ? parentNode?.currentNode : currentNode}
            data={data}
            save={save}
          />
        </TitlePanel>
      }
      defaultSize={350}
      minSize={350}
    >
      <TitlePanel title="Execution Output">
        {selectedSequenceItem.currentNode.exitUrl === undefined ? (
          <NonIdealState
            title="Current node was not discovered yet."
            description="Please run discover to perform discovery"
            action={
              <Button
                title="Discover"
                onClick={() => runDiscovery(selectedSequenceItem)}
              >
                Discover
              </Button>
            }
          />
        ) : (
          <Tabs
            id="seq-tabs"
            vertical={true}
            className="sequence-tabs"
            renderActiveTabPanelOnly={true}
            onChange={(id: string) => {
              workspaceContext.selectedPanel = id;
              setTab(id);
            }}
            selectedTabId={tab}
          >
            <Tab
              id="discovered"
              title={
                <Icon title="Discovered" icon="search-template" size={24} />
              }
              panel={
                <DiscoveredElements
                  exitUrl={selectedSequenceItem.currentNode.exitUrl}
                />
              }
            />
            <Tab
              id="screenshot"
              title={<Icon title="Discovered" icon="camera" size={24} />}
              panel={
                <div
                  className="image"
                  style={{
                    backgroundImage: `url(file://${path}/screenshots/${
                      currentNode.id
                    }.png?cache=${Date.now()})`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              }
            />
          </Tabs>
        )}
      </TitlePanel>
    </DragLayout>
  );
}
