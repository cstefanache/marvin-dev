import React, { useContext, useState } from 'react';
import { Divider, Icon, Tag } from '@blueprintjs/core';

import { Property } from '../../../types/Types';
import TabPanel from '../CustomComponents/Tabs/TabPanel';
import Tabs from '../CustomComponents/Tabs/Tabs';
import CustomTextField, {
  CustomTextFieldWrapper,
} from '../CustomComponents/TextField/TextField';
import CustomSelect from '../CustomComponents/Selectors/Select';
import Selectors from '../CustomComponents/Selectors/Selectors';
import SubmitButton from '../CustomComponents/Buttons/SubmitButton';
import RemoveButton from '../CustomComponents/Buttons/RemoveButton';
import AddButton from '../CustomComponents/Buttons/AddButton';
import { getActionIcon } from '../../../utils';
import './WrapperStyles.scss';

export const getInputIcon = (
  title?: string,
  inputType?: string,
  isIteratorRoot?: boolean,
  size: number = 16
) => {
  if (inputType) {
    return <Icon icon={getActionIcon(inputType)} />;
  } else if (title) {
    const lowerName = title?.toLowerCase();
    if (isIteratorRoot) {
      return <Icon size={size} icon="property" />;
    } else if (lowerName === 'selectors') {
      return <Icon size={size} icon="select" />;
    } else if (lowerName === 'condition') {
      return <Icon size={size} icon="playbook" />;
    } else if (lowerName === 'sequence step name') {
      return <Icon size={size} icon="id-number" />;
    } else if (lowerName === 'name') {
      return <Icon size={size} icon="person" />;
    } else if (lowerName === 'selector' || lowerName === 'locator') {
      return <Icon size={size} icon="code" />;
    } else if (lowerName === 'root url') {
      return <Icon size={size} icon="open-application" />;
    } else if (lowerName === 'default timeout') {
      return <Icon size={size} icon="time" />;
    } else if (lowerName === 'delayed discovery') {
      return <Icon size={size} icon="stopwatch" />;
    } else if (lowerName === 'identifiers') {
      return <Icon size={size} icon="array" />;
    } else if (lowerName === 'identifier') {
      return <Icon size={size} icon="tag" />;
    } else if (lowerName === 'type') {
      return <Icon size={size} icon="list" />;
    } else if (lowerName === 'regex') {
      return <Icon size={size} icon="regex" />;
    } else if (lowerName === 'key') {
      return <Icon size={size} icon="key" />;
    } else if (lowerName === 'value' || lowerName === 'exact match') {
      return <Icon size={size} icon="numerical" />;
    } else if (lowerName === 'alias') {
      return <Icon size={size} icon="bookmark" />;
    } else if (
      lowerName === 'sequence execution loop' ||
      lowerName === 'method loop'
    ) {
      return <Icon size={size} icon="array" />;
    } else if (lowerName === 'post delay') {
      return <Icon size={size} icon="stopwatch" />;
    }
  }
};

interface CustomWrapperProps {
  property: Property;
  value: any;
  children: JSX.Element | JSX.Element[];
}

function Wrapper({ property, value, children }: CustomWrapperProps) {
  const {
    className,
    title,
    properties,
    uiType,
    error,
    uiIndex,
    description,
    collapsed,
    default: defaultValue,
  } = property;

  const [allowCollapse, setAllowCollapsed] = useState(collapsed);
  const [isCollapsed, setIsCollapsed] = useState(
    collapsed && (!value || value === defaultValue)
  );

  const renderWrapperElements = () => {
    switch (uiType) {
      case 'tabs':
        return (
          <div className="wrapper-container">
            <Tabs properties={properties} children={children} />
            {/* TODO: These children shouldn`t be inside a tab panel? */}
            {/* {children} */}
          </div>
        );
      case 'tab':
        return (
          <TabPanel index={uiIndex || 0}>
              {children}
          </TabPanel>
        );
      default:
        return (
          <div
            data-prop={property.title}
            data-registry={property.registryKey}
            className={`${
              property.type ? `${property.type}-` : ''
            }wrapper field-wrapper ${property.className || ''} ${
              error && 'error'
            }`}
          >
            {title && (
              <div className="schema-title">
                <span
                  style={{ marginRight: 5 }}
                  className={value ? 'value-filled' : ''}
                >
                  {error ? (
                    <Icon icon="warning-sign" size={12} />
                  ) : (
                    getInputIcon(title, property.inputType, false, 12)
                  )}
                </span>
                {title || description}
                {isCollapsed &&
                  allowCollapse &&
                  (!value ? (
                    <Icon
                      icon="plus"
                      className="actionable"
                      onClick={() => setIsCollapsed(false)}
                    />
                  ) : (
                    <Icon
                      icon="chevron-right"
                      className="actionable"
                      onClick={() => setIsCollapsed(false)}
                    />
                  ))}
                {!isCollapsed && allowCollapse && (
                  <Icon
                    icon="chevron-down"
                    className="actionable"
                    onClick={() => setIsCollapsed(true)}
                  />
                )}
              </div>
            )}
            {property.description &&
              title.trim() !== description.trim() &&
              property.type === 'array' && (
                <div style={{ width: '100%' }}>{property.description}</div>
              )}
            {error && <div className="error-message">{error[0].message}</div>}
            {!isCollapsed && children}
          </div>
        );
    }
  };
  return <>{renderWrapperElements()}</>;
}

export function CustomWrapper({
  property,
  value,
  children,
}: CustomWrapperProps) {
  return (
    <Wrapper value={value} property={property}>
      {children}
    </Wrapper>
  );
}

export function SelectMethodCustomWrapper({
  property,
  value,
  children,
}: CustomWrapperProps) {
  const { inputType, title, store, storeName, iterator } = property as any;

  const storeComponent = store && (
    <Tag
      minimal={true}
      icon="database"
      title={`Store value to variable name ${storeName}`}
    >
      {storeName}
    </Tag>
  );

  if (
    inputType === undefined ||
    inputType === 'fill' ||
    inputType === 'check' ||
    inputType === 'clearAndFill' ||
    inputType === 'store'
  ) {
    return (
      <div
        style={
          inputType !== undefined
            ? {
                marginBottom: 5,
                padding: 5,
                border: '1px solid rgba(255,255,255,.3)',
                borderLeftWidth: 5,
                borderLeftStyle: 'solid',
                borderLeftColor: '#FFF',
              }
            : { marginBottom: 10 }
        }
      >
        <Wrapper value={value} property={property}>
          {children}
        </Wrapper>
        {storeComponent}
      </div>
    );
  } else {
    return (
      <div
        style={{
          padding: 5,
          marginBottom: 5,
          border: '1px solid rgba(255,255,255,.3)',
          borderLeftWidth: 5,
          borderLeftStyle: 'solid',
          borderLeftColor: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          rowGap: 3,
          marginLeft: iterator ? 10 : 0,
        }}
      >
        <span>
          <Icon icon={getActionIcon(inputType)} />
          <span style={{ margin: '0 5px', display: 'inline-block' }}>
            [{inputType}]
          </span>{' '}
        </span>
        {/* <Tag  icon={getActionIcon(inputType)} minimal={true}>
          {inputType}
        </Tag> */}
        <Tag icon="tag" minimal={true}>
          {title}
        </Tag>
        {storeComponent}
      </div>
    );
  }
}

export const CustomRegistry = {
  string: { component: CustomTextField },
  integer: { component: CustomTextField },
  selectors: { component: Selectors },
  button: { component: SubmitButton },
  enum: { component: CustomSelect },
  removeButton: { component: RemoveButton },
  addButton: { component: AddButton },
} as any;
