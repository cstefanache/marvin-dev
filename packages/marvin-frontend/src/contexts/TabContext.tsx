import { createContext, useContext, useState } from 'react';

interface TabContextType {
  tab: number,
  setTab: (value: number) => void;
}
export const TabContext = createContext<TabContextType>({
  tab: 0,
  setTab: () => {}
});


