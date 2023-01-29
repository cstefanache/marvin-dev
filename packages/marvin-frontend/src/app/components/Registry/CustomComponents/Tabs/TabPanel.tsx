import { useContext } from 'react';

import { TabContext } from '../../../../contexts/TabContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
}

export default function TabPanel(props: TabPanelProps) {
  const { children, index } = props;
  const { tab } = useContext(TabContext);
  return tab === index ? <>{children}</> : null;
}
