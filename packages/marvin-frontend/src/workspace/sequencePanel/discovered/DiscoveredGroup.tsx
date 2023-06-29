import { Callout, Tag } from '@blueprintjs/core';
import { getIcon } from '../../../utils';
import { Collapse, Icon } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';

export default function DiscoveredGroup({
  discoveredElements,
  filter,
  category,
  label,
}: {
  discoveredElements: any;
  filter: any;
  category: string;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(
      discoveredElements.filter(
        (item: any) =>
          item.from === category &&
          (filter.trim().length === 0 ||
            (item.text || '').toLowerCase().includes(filter.toLowerCase()) ||
            (item.details || '').toLowerCase().includes(filter.toLowerCase()))
      )
    );
  }, [discoveredElements, filter]);

  return (
    <>
      <div
        className="collapsible-header"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <Icon icon={isOpen ? 'chevron-down' : 'chevron-right'} />
        {label} ({list.length})
      </div>
      <Collapse isOpen={isOpen}>
        {list.map(
          (item: any) =>
            item.from === category && (
              <Callout key={item.locator} icon={getIcon(item)} className="mt-2">
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
