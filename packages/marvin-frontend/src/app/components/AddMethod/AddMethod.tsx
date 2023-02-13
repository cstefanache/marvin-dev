import React, { useCallback, useEffect, useState } from 'react';
import './AddMethodStyles.scss';
import { PanelStack2 } from '@blueprintjs/core';
import SelectMethod from './SelectMethod';

const initialPanel = (props: any) => {
  return {
    props: {
      panelNumber: 1,
      ...props,
    },
    renderPanel: SelectMethod,
    title: props.title,
  };
};

export function AddMethod(props: any) {
  const { data } = props;
  const [activePanelOnly, setActivePanelOnly] = useState(true);
  const [showHeader, setShowHeader] = useState(true);

  const [currentPanelStack, setCurrentPanelStack] = useState([
    initialPanel({ ...props }),
  ]);

  useEffect(() => {
    setCurrentPanelStack([initialPanel({ ...props })]);
  }, [data]);

  const addToPanelStack = useCallback(
    (newPanel: any) => setCurrentPanelStack((stack) => [...stack, newPanel]),
    []
  );
  const removeFromPanelStack = useCallback(() => {
    setCurrentPanelStack((stack) => stack.slice(0, -1));
  }, []);
  return (
    <div style={props.style}>
      <PanelStack2
        onOpen={addToPanelStack}
        onClose={removeFromPanelStack}
        renderActivePanelOnly={activePanelOnly}
        showPanelHeader={showHeader}
        stack={currentPanelStack}
      />
    </div>
  );
}
