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

export const getInputIcon = (title?: string, inputType?: string) => {
  if (inputType) {
    return <Icon icon={getActionIcon(inputType)} />;
  } else if (title) {
    const lowerName = title?.toLowerCase();

    if (lowerName === 'name') {
      return <Icon icon="person" />;
    } else if (lowerName === 'selector' || lowerName === 'locator') {
      return <Icon icon="code" />;
    } else if (lowerName === 'root url') {
      return <Icon icon="open-application" />;
    } else if (lowerName === 'default timeout') {
      return <Icon icon="time" />;
    } else if (lowerName === 'identifiers') {
      return <Icon icon="array" />;
    } else if (lowerName === 'identifier') {
      return <Icon icon="tag" />;
    } else if (lowerName === 'type') {
      return <Icon icon="list" />;
    } else if (lowerName === 'regex') {
      return <Icon icon="book" />;
    }
  }
};

interface CustomWrapperProps {
  property: Property;
  children: JSX.Element | JSX.Element[];
}

function Wrapper({ property, children }: CustomWrapperProps) {
  const { type, title, description, properties, uiType, uiIndex, inputType } =
    property;
  console.log(property);
  if (property.type === 'object') {
    property.uiType = 'container';
  }
  const renderWrapperElements = () => {
    switch (uiType) {
      case 'divider':
        return <Divider className="divider" />;
      case 'container':
        return (
          <div className="wrapper-container">
            {description && type !== 'object' && (
              <div className="wrapper-description">
                <p>
                  {getInputIcon(title, inputType)} {description}
                </p>
              </div>
            )}
            {type === 'object' && (
              <div className="wrapper-container">
                <div className="wrapper-title">
                  <p>
                    {getInputIcon(title, inputType)} {title}
                  </p>
                  {description && (
                    <blockquote className="bp4-blockquote">
                      {description}
                    </blockquote>
                  )}
                </div>
              </div>
            )}
            <div className="wrapper-container">{children}</div>
          </div>
        );
      case 'tabs':
        return (
          <div className="wrapper-container">
            <Tabs properties={properties} children={children} />
            {/* TODO: These children shouldn`t be inside a tab panel? */}
            {/* {children} */}
          </div>
        );
      case 'tab':
        return <TabPanel index={uiIndex || 0}>{children}</TabPanel>;
      default:
        // TODO: check how to use the size property with Blueprint
        // return (<Grid item {...(size || { xs: 12 })} sx={{ pl: 1, mt: 1 }}>{children}</Grid>);
        return <div className="wrapper-container">{children}</div>;
    }
  };

  return <>{renderWrapperElements()}</>;
}

export function CustomWrapper({ property, children }: CustomWrapperProps) {
  return <Wrapper property={property}>{children}</Wrapper>;
}

export function SelectMethodCustomWrapper({
  property,
  children,
}: CustomWrapperProps) {
  const { inputType, title } = property as any;

  if (
    inputType === undefined ||
    inputType === 'fill' ||
    inputType === 'clearAndFill' ||
    inputType === 'store'
  ) {
    return (
      <div
        style={
          inputType !== undefined
            ? { paddingLeft: 5, borderLeft: '4px solid #FFF' }
            : {}
        }
      >
        {/* {inputType && <Icon icon={getActionIcon(inputType)} />} */}
        <Wrapper property={property}>{children}</Wrapper>
      </div>
    );
  } else {
    return (
      <div
        style={{
          marginBottom: 15,
          paddingLeft: 5,
          borderLeft: '4px solid #FFF',
        }}
      >
        <Icon icon={getActionIcon(inputType)} />
        <span style={{ margin: '0 5px', display: 'inline-block' }}>
          [{inputType}]
        </span>{' '}
        <Tag minimal={true}>{title}</Tag>
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
