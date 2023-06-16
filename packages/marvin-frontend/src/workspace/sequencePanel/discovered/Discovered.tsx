import React, { useEffect, useState } from 'react';
import './Discovered.scss';
import DiscoveredGroup from './DiscoveredGroup';

export default function DiscoveredElements(props: any) {
  const { exitUrl, filter } = props;
  const [discoveredElements, setDiscoveredElements] = useState<any[]>([]);

  useEffect(() => {
    const getElements = async (exitUrl: string) => {
      const discovered = await window.electron.getDiscoveredForPath(exitUrl);
      if (discovered && discovered.items) {
        const {
          items: { info, input, actions, iterable },
        } = discovered;
        const items = [
          ...info.map((item: any) => ({ ...item, from: 'info' })),
          ...input.map((item: any) => ({ ...item, from: 'input' })),
          ...actions.map((item: any) => ({ ...item, from: 'actions' })),
          // ...iterable.map((item: any) => ({ ...item, from: 'iterable' })),
          ...iterable.reduce((memo: any[], item: any) => {
            const { identifier, iteratorName, elements } = item;
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
            }
            return memo;
          }, []),
        ];
        // .filter(
        //   (value, index, self) =>
        //     index === self.findIndex((t) => t.locator === value.locator)
        // );
        setDiscoveredElements(items);
      }
    };
    getElements(exitUrl);
    console.log(discoveredElements);
  }, [exitUrl]);

  return (
    discoveredElements && (
      <span className="collapsible-span">
        <DiscoveredGroup
          discoveredElements={discoveredElements}
          filter={filter}
          category="info"
          label="Info"
        />
        <DiscoveredGroup
          discoveredElements={discoveredElements}
          filter={filter}
          category="input"
          label="Input"
        />
        <DiscoveredGroup
          discoveredElements={discoveredElements}
          filter={filter}
          category="actions"
          label="Actions"
        />
        <DiscoveredGroup
          discoveredElements={discoveredElements}
          filter={filter}
          category="iterable"
          label="Iterables"
        />
      </span>
    )
  );
}
