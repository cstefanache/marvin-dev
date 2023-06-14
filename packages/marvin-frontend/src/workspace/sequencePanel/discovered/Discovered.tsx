// const showDiscoveredElements =

import { Callout, Tag } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import { getIcon } from '../../../utils';
import { Collapse } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';

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
        ]
        // .filter(
        //   (value, index, self) =>
        //     index === self.findIndex((t) => t.locator === value.locator)
        // );
        setDiscoveredElements(items);
      }
    };
    getElements(exitUrl);
    console.log(discoveredElements)
  }, [exitUrl]);

  const [isOpenInfo, setIsOpenInfo] = useState(false);
  const [isOpenInput, setIsOpenInput] = useState(false);
  const [isOpenActions, setIsOpenActions] = useState(false);
  const [isOpenIterables, setIsOpenIterables] = useState(false);

  return (
    discoveredElements && (
      <span>
        <Button onClick={() => setIsOpenInfo(!isOpenInfo)}>Toggle Info</Button>
        <Collapse isOpen={isOpenInfo}>
        {discoveredElements
          .filter(
            (item) =>
              filter.trim().length === 0 ||
              (item.text || '').toLowerCase().includes(filter.toLowerCase()) ||
              (item.details || '').toLowerCase().includes(filter.toLowerCase())
          )
          .map((item: any) => (
            item.from==="info" && (
            <Callout key={item.locator} icon={getIcon(item)} className="mt-2">
              {item.text} | {item.details}
              <div>
                <Tag minimal={true}>{item.locator}</Tag>
              </div>
              {item.base64Image && (
                <img src={`data:image/png;base64,${item.base64Image}`} />
              )}
            </Callout>
            )
          ))}
        </Collapse>

        <Button onClick={() => setIsOpenInput(!isOpenInput)}>Toggle Input</Button>
        <Collapse isOpen={isOpenInput}>
        {discoveredElements
          .filter(
            (item) =>
              filter.trim().length === 0 ||
              (item.text || '').toLowerCase().includes(filter.toLowerCase()) ||
              (item.details || '').toLowerCase().includes(filter.toLowerCase())
          )
          .map((item: any) => (
            item.from==="input" && (
            <Callout key={item.locator} icon={getIcon(item)} className="mt-2">
              {item.text} | {item.details}
              <div>
                <Tag minimal={true}>{item.locator}</Tag>
              </div>
              {item.base64Image && (
                <img src={`data:image/png;base64,${item.base64Image}`} />
              )}
            </Callout>
            )
          ))}
        </Collapse>

        <Button onClick={() => setIsOpenActions(!isOpenActions)}>Toggle Actions</Button>
        <Collapse isOpen={isOpenActions}>
        {discoveredElements
          .filter(
            (item) =>
              filter.trim().length === 0 ||
              (item.text || '').toLowerCase().includes(filter.toLowerCase()) ||
              (item.details || '').toLowerCase().includes(filter.toLowerCase())
          )
          .map((item: any) => (
            item.from==="actions" && (
            <Callout key={item.locator} icon={getIcon(item)} className="mt-2">
              {item.text} | {item.details}
              <div>
                <Tag minimal={true}>{item.locator}</Tag>
              </div>
              {item.base64Image && (
                <img src={`data:image/png;base64,${item.base64Image}`} />
              )}
            </Callout>
            )
          ))}
        </Collapse>

        <Button onClick={() => setIsOpenIterables(!isOpenIterables)}>Toggle Iterables</Button>
        <Collapse isOpen={isOpenIterables}>
        {discoveredElements
          .filter(
            (item) =>
              filter.trim().length === 0 ||
              (item.text || '').toLowerCase().includes(filter.toLowerCase()) ||
              (item.details || '').toLowerCase().includes(filter.toLowerCase())
          )
          .map((item: any) => (
            item.from==="iterable" && (
            <Callout key={item.locator} icon={getIcon(item)} className="mt-2">
              {item.text} | {item.details}
              <div>
                <Tag minimal={true}>{item.locator}</Tag>
              </div>
              {item.base64Image && (
                <img src={`data:image/png;base64,${item.base64Image}`} />
              )}
            </Callout>
            )
          ))}
        </Collapse>

      </span>
    )
  );
}
