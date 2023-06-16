import { Callout, Tag } from '@blueprintjs/core';
import { getIcon } from '../../../utils';
import { Collapse, Icon } from '@blueprintjs/core';
import React, { useState } from 'react';

export default function DiscoveredGroup({
  discoveredElements,
  filter,
  category,
  label
}: {
  discoveredElements: any;
  filter: any;
  category: string;
  label: string;
}) {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="collapsible-header"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {label}
        <Icon
          className={`chevron ${isOpen ? 'down' : 'up'}`}
          icon="chevron-left"
        />
      </div>
      <Collapse isOpen={isOpen}>
        {discoveredElements
          .filter(
            (item: any) =>
              filter.trim().length === 0 ||
              (item.text || '').toLowerCase().includes(filter.toLowerCase()) ||
              (item.details || '').toLowerCase().includes(filter.toLowerCase())
          )
          .map(
            (item: any) =>
              item.from === category && (
                <Callout
                  key={item.locator}
                  icon={getIcon(item)}
                  className="mt-2"
                >
                  {item.text} | {item.details}
                  <div>
                    <Tag minimal={true}>{item.locator}</Tag>
                  </div>
                  {item.base64Image && (
                    <img
                      src={`data:image/png;base64,${item.base64Image}`}
                      alt="icon"
                    />
                  )}
                </Callout>
              )
          )}
      </Collapse>
    </>
  );
}
