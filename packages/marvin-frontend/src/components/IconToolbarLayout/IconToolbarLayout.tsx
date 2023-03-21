import './IconToolbarLayout.scss';
import React, { ReactElement, useEffect, useRef, useState } from 'react';

interface IconToolbarLayoutProps {
  children: ReactElement
  title?: ReactElement | string
  icons?: ReactElement[]
}

export function IconToolbarLayout(props: IconToolbarLayoutProps) {
  return <div className="icon-toolbar">
    <div className="icon-toolbar-header">
      <div className="icon-toolbar-header-icons">{props.icons}</div>
      <div className="icon-toolbar-header-main">{props.title}</div>
    </div>
    <div className="icon-toolbar-content">
      {props.children}
    </div>
  </div>;
}
