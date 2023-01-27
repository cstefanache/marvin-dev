import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import { Button, Divider, MenuItem, PanelStack2 } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { SchemaForm } from '@ascentcore/react-schema-form';
import {
  CustomRegistry, CustomWrapper, SelectMethodCustomWrapper,
} from '../Registry/Wrapper/Wrapper';
import CreateMethod from './CreateMethod';

const SelectMethod = (props: any) => {
  const [selectedMethod, setSelectedMethod] = React.useState<any | undefined>();
  const [schema, setSchema] = React.useState<any>();
  const [methods, setMethods] = useState<any>([]);
  const [data, setData] = useState<any>(null);
  console.log(props);
  const {
    parent: { exitUrl, sequenceStep },
    save,
  } = props;

  useEffect(() => {
    const asyncFn = async () => {
      const methods = await window.electron.getMethodsForPath(exitUrl);
      setMethods(methods || []);
    };
    asyncFn();
  }, []);

  const openNewPanel = () => {
    props.openPanel({
      props: { exitUrl },
      renderPanel: CreateMethod,
      title: `Create New Method`,
    });
  };

  useEffect(() => {
    if (selectedMethod) {
      setData({ sequenceStep: `Exec: ${selectedMethod.method}` });
      const method = selectedMethod;
      const { iterator } = method;
      const schema = {
        type: 'object',
        title: method.method,
        properties: {
          sequenceStep: {
            type: 'string',
            title: 'Sequence Step Name',
          },
          parameters: {
            type: 'object',
            title: 'Parameters',
            description: 'List of parameters required by the selected method',
            properties: {
              ...(iterator && {
                [iterator.uid]: {
                  type: 'string',
                  title: iterator.name,
                  description: iterator.locator,
                },
              }),
              ...(method.sequence || [])
                // .filter((s: any) => s.type === 'fill')
                .reduce((memo: any, obj: any) => {
                  memo[obj.uid] = {
                    type: 'string',
                    title: obj.locator,
                    inputType: obj.type
                  };
                  return memo;
                }, {}),
            },
          },
        },
      };
      console.log(schema);

      setSchema(schema);
    }
  }, [selectedMethod]);

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
      <pre>Url: {exitUrl}</pre>
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
        <Button
          fill={true}
          text={selectedMethod?.method}
          rightIcon="double-caret-vertical"
        />
      </Select2>

      <p className="text-center"> - or -</p>
      <div className="text-center">
        <Button className="bp4-intent-primary" onClick={openNewPanel}>
          Create a new method
        </Button>
      </div>

      {schema && (
        <>
          <Divider />
          <SchemaForm
            schema={schema}
            data={data}
            wrapper={SelectMethodCustomWrapper as any}
            config={{ registry: CustomRegistry }}
            onSubmit={(data) =>
              save({ method: selectedMethod.method, ...data }, props.parent)
            }
          />
        </>
      )}
    </div>
  );
};

export default SelectMethod;
