import './DragLayout.scss';
import React, { ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';

export type LayoutOrientation =
  | 'horizontal'
  | 'vertical'
  | 'horizontal-reversed'
  | 'vertical-reversed';
interface DragLayoutProps {
  left: ReactElement;
  children: ReactElement;
  fixedSize?: number;
  minSize?: number;
  orientation: LayoutOrientation;
  defaultSize?: number;
  contextKey?: string;
}

export function DragLayout(props: DragLayoutProps) {
  const workspaceContext = useContext(WorkspaceContext)
  const [size, setSize] = useState<number>(
    workspaceContext[props.contextKey] || props.fixedSize || props.defaultSize || 200
  );
  const [prevSize, setPrevSize] = useState<number>(
    workspaceContext[props.contextKey] || props.fixedSize || props.defaultSize || 200
  );
  const [dragging, setDragging] = useState<boolean>(false);
  const parentReference = useRef(null);
  const isHorizontalLayout = props.orientation.indexOf('horizontal') !== -1;
  const isReversed = props.orientation.indexOf('reverse') !== -1;

  const getStyle = (on: 'left' | 'main') => {
    return on === 'left'
      ? isHorizontalLayout
        ? { width: size, minWidth: size }
        : { height: size, minHeight: size }
      : { flexGrow: 1 };
  };

  const startDragging = () => {
    setDragging(true);
    setPrevSize(size);
  };

  const endDragging = () => {
    setDragging(false);
    workspaceContext[props.contextKey] = size;
  };

  const mouseMove = (evt: any) => {
    if (dragging) {
      const { current } = parentReference;
      const boundingRect = current.getBoundingClientRect();
      const { x, y, width, height } = boundingRect;
      const newSize = isHorizontalLayout
        ? isReversed
          ? width - evt.clientX + x
          : evt.clientX - x
        : !isReversed
        ? height - evt.clientY + y
        : evt.clientY - y;

      setSize(props.minSize ? Math.max(props.minSize, newSize) : newSize);
    }
  };

  const main = (
    <div className="main" style={getStyle('main')}>
      {props.children}
    </div>
  );
  const nav = (
    <div className="left" style={getStyle('left')}>
      {props.left}
    </div>
  );

  return (
    <div
      ref={parentReference}
      className={`drag-layout drag-layout-${props.orientation} ${
        dragging && 'dragging'
      }`}
      onMouseUp={endDragging}
      onMouseLeave={endDragging}
      onMouseMove={mouseMove}
    >
      {isHorizontalLayout ? nav : main}
      <div
        className={`separator separator-${props.orientation}`}
        onMouseDown={startDragging}
      ></div>
      {isHorizontalLayout ? main : nav}
    </div>
  );
}
