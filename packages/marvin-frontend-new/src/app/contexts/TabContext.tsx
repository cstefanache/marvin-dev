import { createContext, useContext, useState } from 'react';

interface TabContextType {
  tab: number,
  setTab: (value: number) => void;
}
export const TabContext = createContext<TabContextType>({} as TabContextType);

interface Props { 
  children: JSX.Element | JSX.Element[]
}

export const TabProvider = ({ children }: Props) => {
  const [tab, setTab] = useState(0);
  const value = { tab, setTab };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const tabContext = useContext(TabContext);

  if (tabContext === undefined) {
    throw new Error('useTab must be used within a CountProvider');
  }

  return tabContext;
}

