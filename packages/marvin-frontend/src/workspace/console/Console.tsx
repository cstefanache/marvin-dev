import './Console.scss';
import { Button, Icon, InputGroup, Tab, Tabs } from '@blueprintjs/core';

import { Log } from '../../components/log/Log';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import { useEffect, useState } from 'react';

export default function Console(props: any) {
  const { mainLayoutHoriz, setMainLayoutHoriz } = props;

  const [currentTab, setCurrentTab] = useState<null | string>(null);
  const [tabs, setTabs] = useState([]);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    const asyncFn = async () => {
      const loggers = await window.electron.getLoggers();
      setTabs(loggers);
      setCurrentTab(loggers[0]);
    };
    asyncFn();
  }, []);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
  };

  const tabsComponent = currentTab && (
    <Tabs
      className="console-tabs"
      onChange={handleTabChange}
      selectedTabId={currentTab}
    >
      {tabs.map((tab: string) => (
        <Tab key={tab} id={tab} title={tab} />
      ))}
    </Tabs>
  );

  return (
    <TitlePanel
      title="Console"
      collapsible={
        <InputGroup
          leftIcon="filter"
          placeholder="Filter"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
          }}
          rightElement={
            <Button
              icon="delete"
              minimal={true}
              onClick={() => {
                setFilter('');
              }}
            />
          }
        />
      }
      suffix={
        mainLayoutHoriz
          ? [
              tabsComponent,
              <Icon
                icon="vertical-distribution"
                size={12}
                onClick={() => setMainLayoutHoriz(false)}
              />,
            ]
          : [
              tabsComponent,
              <Icon
                icon="horizontal-distribution"
                size={12}
                onClick={() => setMainLayoutHoriz(true)}
              />,
            ]
      }
    >
      {currentTab && <Log key={currentTab} log={currentTab} filter={filter} />}
    </TitlePanel>
  );
}
