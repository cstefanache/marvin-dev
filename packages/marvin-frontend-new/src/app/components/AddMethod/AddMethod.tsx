import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import { Button, Divider, MenuItem, PanelStack2 } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { CustomRegistry, CustomWrapper } from '../Registry/Wrapper/Wrapper';
import SelectMethod from './SelectMethod';

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
  const removeFromPanelStack = useCallback(() => {
    setCurrentPanelStack((stack) => stack.slice(0, -1));
  }, []);
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
