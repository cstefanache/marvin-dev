import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AddMethodStyles.scss';
import { Button, Divider, MenuItem, PanelStack2 } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { SchemaForm } from '@ascentcore/react-schema-form';
import {
  CustomRegistry,
  CustomWrapper,
  SelectMethodCustomWrapper,
} from '../Registry/Wrapper/Wrapper';
import CreateMethod from './CreateMethod';
import { exit } from 'process';

const SelectMethod = (props: any) => {
  const [selectedMethod, setSelectedMethod] = React.useState<any | undefined>();
  const [schema, setSchema] = React.useState<any>();
  const [methods, setMethods] = useState<any>([]);
  const [data, setData] = useState<any>(null);
  const { parent, save, data: propData } = props;
  // const { exitUrl, sequenceStep } = parent || {};
  const { exitUrl } = props;
  const sequenceStep = '';
  const { method } = propData || {};

  useEffect(() => {
    const asyncFn = async () => {
      const methods = await window.electron.getMethodsForPath(exitUrl);
      setMethods(methods || []);

      if (method && methods) {
        const selectedMethod = methods.find((m: any) => m.method === method);
        setData(propData);
        setSelectedMethod(selectedMethod);
      }
    };
    asyncFn();
  }, [exitUrl]);

  const openNewPanel = () => {
    props.openPanel({
      props: { exitUrl },
      renderPanel: CreateMethod,
      title: `Create New Method`,
    });
  };

  useEffect(() => {
    if (selectedMethod) {
      if (!propData) {
        setData({ sequenceStep: `Exec: ${selectedMethod.method}` });
      }
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
                    description: obj.details, 
                    inputType: obj.type,
                  };
                  return memo;
                }, {}),
            },
          },
          loop: {
            type: 'integer',
            title: 'Sequence Execution Loop',
            default: 1,
            description: 'Number of times to loop this step',
          },
          methodLoop: {
            type: 'integer',
            title: 'Method Loop',
            default: 1,
            description: 'Number of times to loop this method',
          },
        },
      };
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
      {!propData && (
        <>
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
            popoverProps={{ matchTargetWidth: true, minimal: true }}
          >
            <Button
              fill={true}
              alignText="left"
              text={selectedMethod?.method || 'Select a method'}
              rightIcon="double-caret-vertical"
            />
          </Select2>
          {!schema && (
            <>
              <p className="text-center"> - or -</p>
              <div className="text-center">
                <Button className="bp4-intent-primary" onClick={openNewPanel}>
                  Create a new method
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {schema && (
        <>
          <pre>Url: {exitUrl}</pre>
          <pre>Method: {method}</pre>
          {!propData && <Divider />}
          <SchemaForm
            schema={schema}
            data={data}
            wrapper={SelectMethodCustomWrapper as any}
            config={{ registry: CustomRegistry }}
            onSubmit={
              (data) => {
                if (data.id) {
                  delete data.children;
                  save(data);
                } else {
                  save(
                    { method: selectedMethod.method, ...data },
                    props.parent
                  );
                }
              }
              // save({ method: selectedMethod.method, ...data }, props.parent)
            }
          />
        </>
      )}
    </div>
  );
};

export default SelectMethod;
