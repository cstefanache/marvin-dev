import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import { Button, PanelStack2 } from '@blueprintjs/core';

const Panel1 = (props: any) => {
  const openNewPanel = () => {
    props.openPanel({
      props: {},
      renderPanel: Panel2,
      title: `Panel 2`,
    });
  };
  return (
    <div className="docs-panel-stack-contents-example">
      <h1>test</h1>
      <Button onClick={openNewPanel} text="Open panel type 2" />
    </div>
  );
};
const Panel2 = (props: any) => {
  const openNewPanel = () => {
    props.openPanel({
      props: {},
      renderPanel: Panel3,
      title: `Panel 3`,
    });
  };
  return (
    <div className="docs-panel-stack-contents-example">
      <h5>Parent counter was {props.counter}</h5>
      <Button onClick={openNewPanel} text="Open panel type 3" />
    </div>
  );
};
const Panel3 = (props: any) => {
  const openNewPanel = () => {
    props.openPanel({
      props: {},
      renderPanel: Panel1,
      title: `Panel 1`,
    });
  };

  return (
    <div className="docs-panel-stack-contents-example">
      <Button onClick={openNewPanel} text="Open panel type 1" />
    </div>
  );
};
const initialPanel = {
  props: {
    panelNumber: 1,
  },
  renderPanel: Panel1,
  title: 'Panel 1',
};

export function AddMethod() {
  const [activePanelOnly, setActivePanelOnly] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [currentPanelStack, setCurrentPanelStack] = useState([initialPanel]);

  const addToPanelStack = useCallback(
    (newPanel: any) => setCurrentPanelStack((stack) => [...stack, newPanel]),
    []
  );
  const removeFromPanelStack = useCallback(
    () => setCurrentPanelStack((stack) => stack.slice(0, -1)),
    []
  );
  return (
    <PanelStack2
      onOpen={addToPanelStack}
      onClose={removeFromPanelStack}
      renderActivePanelOnly={activePanelOnly}
      showPanelHeader={showHeader}
      stack={currentPanelStack}
    />
  );
}
