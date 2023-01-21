import React, { useEffect, useRef, useState } from 'react';
import { Tab, Tabs } from '@blueprintjs/core';
import { Log } from '../Log';
import './ConsoleStyles.scss';

export function Console() {
  const [currentTab, setCurrentTab] = useState<null | string>(null);
  const [tabs, setTabs] = useState([]);

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

  return (
    <div className="console" style={{ height: 200 }}>
      {currentTab && (
        <Tabs
          id="TabsExample"
          onChange={handleTabChange}
          selectedTabId={currentTab}
        >
          {tabs.map((tab: string) => (
            <Tab key={tab} id={tab} title={tab} />
          ))}
        </Tabs>
      )}
      {currentTab && <Log key={currentTab} log={currentTab} />}
    </div>
  );
}
