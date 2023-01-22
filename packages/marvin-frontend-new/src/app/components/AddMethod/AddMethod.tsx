import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import { Button, MenuItem, PanelStack2 } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';

const SelectMethod = (props: any) => {
  const [selectedMethod, setSelectedMethod] = React.useState<any | undefined>();
  const [methods, setMethods] = useState<any>([]);
  const { exitUrl, sequenceStep } = props;
  useEffect(() => {
    const asyncFn = async () => {
      const methods = await window.electron.getMethodsForPath(exitUrl);
      setMethods(methods);
    };
    asyncFn();
  }, []);

  const openNewPanel = () => {
    props.openPanel({
      props: {},
      renderPanel: Panel2,
      title: `Panel 2`,
    });
  };

  const filterMethod: ItemPredicate<any> = (query, method) => {
    return method.method.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  const renderMethod: ItemRenderer<any> = (
    method,
    { handleClick, modifiers }
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem key={method.id} text={method.method} onClick={handleClick} />
    );
  };

  return (
    <div className="select-method-panel">
      {selectedMethod && selectedMethod.method}
      <p>Add method execution after: "{sequenceStep}"</p>
      <Select2
        fill={true}
        items={methods}
        itemPredicate={filterMethod}
        onItemSelect={setSelectedMethod}
        noResults={
          <MenuItem
            disabled={true}
            text="No results."
            roleStructure="listoption"
          />
        }
        itemRenderer={renderMethod}
      >
        <Button fill={true} text={selectedMethod?.method}  rightIcon="double-caret-vertical"/>
      </Select2>
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
