import React, { useEffect, useState } from 'react';
import { Console } from '../components/Console/Console';
import { Graph } from '../components/Graph/Graph';
import { Callout, Drawer, Icon, PanelStack2, Tag } from '@blueprintjs/core';
import { AddMethod } from '../components/AddMethod/AddMethod';
import { getIcon } from '../utils';
import './workspace.scss';
interface Props {
  workspace: {
    name: string;
    path: string;
  };
}

export default function Workspace({ workspace }: Props) {
  const [flow, setFlow] = React.useState(null);
  const [config, setConfig] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [discoveredElements, setDiscoveredElements] = React.useState<
    any | null
  >(null);
  const [exitUrl, setExitUrl] = React.useState<string | null>(null);
  const [flowKey, setFlowKey] = React.useState(Math.random());
  const [drawerElement, setDrawerElement] = React.useState<null | JSX.Element>(
    null
  );
  const [drawerTitle, setDrawerTitle] = React.useState<null | string>(null);

  const loadFlow = async () => {
    const flow = await window.electron.getFlow();
    const config = await window.electron.getConfig();
    setFlow(flow);
    setConfig(config);
    setLoading(false);
  };

  useEffect(() => {
    const asyncFn = async () => {
      await loadFlow();
    };
    asyncFn();

    window.ipcRender.receive('config-updated', (config: any) => {
      console.log('new config', config);
      setConfig(config);
      setFlowKey(Math.random());
    });

    window.ipcRender.receive('flow-updated', (flow: any) => {
      setFlow({ ...flow });
      setFlowKey(Math.random());
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
    setDrawerElement(null);
    loadFlow();
  };

  const runDiscovery = async (sequence: any[]) => {
    window.electron.runDiscovery(sequence);
  };

  const showDiscoveredElements = async (exitUrl: string) => {
    setExitUrl(exitUrl);
    const discovered = await window.electron.getDiscoveredForPath(exitUrl);
    if (discovered && discovered.items) {
      const {
        items: { info, input, actions, iterable },
      } = discovered;
      let items = [
        ...info.map((item: any) => ({ ...item, from: 'info' })),
        ...input.map((item: any) => ({ ...item, from: 'input' })),
        ...actions.map((item: any) => ({ ...item, from: 'actions' })),
        // ...iterable.map((item: any) => ({ ...item, from: 'iterable' })),
        ...iterable.reduce((memo: any[], item: any) => {
          const { identifier, iteratorName, elements } = item;
          console.log(item);
          elements.forEach((element: any) => {
            memo.push({
              from: 'iterable',
              text: element.text,
              locator: element.locator,
              details: iteratorName,
              iterator: {
                name: iteratorName,
                identifier,
              },
            });
          });

          if (!elements.length) {
            memo.push({
              from: 'iterable',
              locator: item.locator,
              details: iteratorName,
              iterator: {
                name: iteratorName,
              },
            });

            console.log(memo);
          }
          return memo;
        }, []),
      ].filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.locator === value.locator)
      );

      setDiscoveredElements(items);
    }
  };

  const openDrawer = (type: string, title: string, props: any, data?: any) => {
    setDrawerTitle(title);
    switch (type) {
      case 'addMethod':
        const properties = { ...{ parent: props, title }, save };
        setDrawerElement(<AddMethod {...properties} data={data} />);
        break;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {!flow || !config || loading ? (
        <h3>Loading</h3>
      ) : (
        <>
          <Graph
            flow={flow}
            config={config}
            openDrawer={openDrawer}
            runDiscovery={runDiscovery}
            showDiscoveredElements={showDiscoveredElements}
          />
          <Console />
          <Drawer
            isOpen={drawerElement !== null}
            title="Add Method"
            onClose={() => setDrawerElement(null)}
          >
            {drawerElement}
          </Drawer>
          <Drawer
            isOpen={discoveredElements !== null}
            title={`Discovered Elements for path ${exitUrl}`}
            onClose={() => setDiscoveredElements(null)}
          >
            {discoveredElements && (
              <div style={{ overflow: 'auto' }}>
                {discoveredElements.map((item: any) => (
                  <Callout
                    key={item.locator}
                    icon={getIcon(item)}
                    className="mt-2"
                  >
                    {item.text} | {item.details}
                    <div>
                      <Tag minimal={true}>{item.locator}</Tag>
                    </div>
                  </Callout>
                ))}
              </div>
            )}
          </Drawer>
        </>
      )}
    </div>
  );
}
