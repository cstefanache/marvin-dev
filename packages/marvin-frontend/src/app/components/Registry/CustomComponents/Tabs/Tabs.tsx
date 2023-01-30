import { Tabs, Tab } from '@blueprintjs/core';
import { TabContext } from '../../../../contexts/TabContext';
import { useContext } from 'react';

import TabPanel from './TabPanel';
import './TabsStyles.scss';

interface Props {
  // tabId: number;
  // onChange: (value: number) => void;
  children: JSX.Element | JSX.Element[];
  properties: any;
}
export default function CustomTabs ({ children, properties }: Props) {
  const { tab, setTab } = useContext(TabContext);

  const handleTabChange = (newTab: number) => {
    setTab(newTab);
  };

  return (
    <Tabs
      className="tabs-container"
      id="configTabs" 
      onChange={(tabId: number) => { handleTabChange(tabId)}} 
      selectedTabId={tab}
    >
      {Object.keys(properties).map((key, idx) => (
        <Tab key={key} id={idx} title={properties[key].title} panel={<TabPanel index={idx} children={children}/>} />
      ))}
  </Tabs>
  );
}