import { useEffect, useState } from 'react';
import { Tag } from '@blueprintjs/core';
import { Models } from '@marvin/discovery';

export function Block(props: {
  loading: boolean;
  id: string;
  flow: Models.FlowModel;
}) {
  const [actionItem, setActionItem] = useState<Models.ActionItem>(null);
  useEffect(() => {
    function findActionItemById(
      id: string,
      parent: Models.ActionItem[]
    ): Models.ActionItem {
      for (let i = 0; i < parent.length; i++) {
        const item = parent[i];
        if (item.id === id) {
          return item;
        } else if (item.children) {
          const child = findActionItemById(id, item.children);
          if (child) {
            return child;
          }
        }
      }
    }

    setActionItem(findActionItemById(props.id, props.flow.graph));
  }, [props.id]);

  if (actionItem) {
    return (
      <Tag icon={props.loading ? "cog": "flow-linear"} className={props.loading ? 'loading' : ''} intent='primary'>
        {actionItem.sequenceStep}
      </Tag>
    );
  } else {
    return <Tag icon="error">{props.id} missing</Tag>;
  }
}
