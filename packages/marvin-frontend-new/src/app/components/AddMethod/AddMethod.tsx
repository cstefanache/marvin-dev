import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import { Button, Divider, MenuItem, PanelStack2 } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { CustomRegistry, CustomWrapper } from '../Registry/Wrapper/Wrapper';
import SelectMethod from './SelectMethod';

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
      renderPanel: SelectMethod,
      title: `Panel 1`,
    });
  };

  return (
    <div className="docs-panel-stack-contents-example">
      <Button onClick={openNewPanel} text="Open panel type 1" />
    </div>
  );
};

const initialPanel = (props: any) => {
  return {
    props: {
      panelNumber: 1,
      ...props,
    },
    renderPanel: SelectMethod,
    title: 'Select Method',
  };
};

export function AddMethod(props: any) {
  const [activePanelOnly, setActivePanelOnly] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [currentPanelStack, setCurrentPanelStack] = useState([
    initialPanel(props),
  ]);

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
