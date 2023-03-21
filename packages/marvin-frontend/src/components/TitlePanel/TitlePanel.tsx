import './TitlePanel.scss';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Icon } from '@blueprintjs/core';

interface TitlePanelProps {
  children: ReactElement;
  collapsible?: ReactElement;
  title: ReactElement | string;
  prefix?: ReactElement[];
  suffix?: ReactElement[];
}

export function TitlePanel(props: TitlePanelProps) {
  const { title, children, prefix, suffix, collapsible } = props;

  const [isCollapsed, setCollapsed] = useState<boolean>(true);

  return (
    <div className="title-panel">
      <div className="title-panel-header">
        {collapsible && (
          <Icon
            size={12}
            icon={isCollapsed ? 'chevron-right' : 'chevron-down'}
            onClick={() => setCollapsed(!isCollapsed)}
          />
        )}
        {prefix}
        <div className="title-panel-title">{title}</div>
        {suffix}
      </div>
      {!isCollapsed && (
        <div className="title-panel-collapsible">{collapsible}</div>
      )}
      <div className="title-panel-body">{children}</div>
    </div>
  );
}
