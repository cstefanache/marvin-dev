// const showDiscoveredElements =

import { Callout, Tag } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import { getIcon } from '../../utils';

export default function DiscoveredElements(props: any) {
  const { exitUrl } = props;
  const [discoveredElements, setDiscoveredElements] = useState<any[]>([]);

  useEffect(() => {
    const getElements = async (exitUrl: string) => {
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
        ].filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.locator === value.locator)
        );

        setDiscoveredElements(items);
      }
    };
    console.log('>>>', exitUrl)
    getElements(exitUrl);
  }, [exitUrl]);

  return (
    discoveredElements && (
      <div style={{ overflow: 'auto' }}>
        {discoveredElements.map((item: any) => (
          <Callout key={item.locator} icon={getIcon(item)} className="mt-2">
            {item.text} | {item.details}
            <div>
              <Tag minimal={true}>{item.locator}</Tag>
            </div>
          </Callout>
        ))}
      </div>
    )
  );
}
