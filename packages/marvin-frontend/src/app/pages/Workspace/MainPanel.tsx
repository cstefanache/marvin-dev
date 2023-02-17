import React, { useEffect, useState } from 'react';
import { Button, NonIdealState, Tab, Tabs } from '@blueprintjs/core';
import Summary from './Summary';
import { AddMethod } from '../../components/AddMethod/AddMethod';
import DiscoveredElements from './Discovered';

export default function MainPanel(props: any) {
  const { selectedElement, path, runDiscovery, save, deleteNode } = props;
  const { currentNode } = selectedElement || {};
  const [tab, setTab] = useState<string>('screenshot');
  const [panelWidth, setPanelWidth] = useState<number>(450);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setData(selectedElement?.currentNode);
  }, [selectedElement]);

  const handleSave = (name: string) => {
    save(
      {
        sequenceStep: name,
        children: [],
        url: selectedElement.currentNode.exitUrl,
      },
      selectedElement.currentNode
    );
  };

  return (
    (selectedElement && currentNode && (
      <>
        <div className="main-panel">
          <Summary
            selectedElement={selectedElement}
            addBranch={() => setData(null)}
            newFolder={handleSave}
            deleteNode={deleteNode}
          />
          {currentNode.exitUrl !== undefined && (
            <div className="working-panel">
              {<AddMethod
                exitUrl={data ? currentNode.url : currentNode.exitUrl}
                style={{ width: panelWidth, minWidth: panelWidth }}
                title={data?.method ? 'Edit Method Execution' : 'Add Method'}
                parent={
                  data
                    ? selectedElement.parentNode?.currentNode
                    : selectedElement.currentNode
                }
                data={data}
                save={save}
              />}
              <div className="right">
                {currentNode.exitUrl !== undefined && (
                  <Tabs
                    onChange={(id: string) => setTab(id)}
                    selectedTabId={tab}
                  >
                    <Tab
                      id="screenshot"
                      title="Screenshot"
                      panel={
                        <div
                          className="image"
                          style={{
                            backgroundImage: `url(file://${path}/screenshots/${currentNode.id}.png)`,
                            backgroundSize: 'cover',
                          }}
                        ></div>
                      }
                    />
                    <Tab
                      id="discovered"
                      title="Discovered"
                      panel={
                        <DiscoveredElements exitUrl={currentNode.exitUrl} />
                      }
                    />
                  </Tabs>
                )}
              </div>
            </div>
          )}
        </div>
        {currentNode.exitUrl === undefined && (
          <NonIdealState
            title="Current node was not discovered yet."
            description="Please run discover to perform discovery"
            action={
              <Button
                title="Discover"
                onClick={() => runDiscovery(selectedElement)}
              >
                Discover
              </Button>
            }
          />
        )}
      </>
    )) || (
      <NonIdealState
        title="No node selected"
        description="Select a node from the left navigation panel"
        icon="info-sign"
        iconSize={100}
      />
    )
  );
}
