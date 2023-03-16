import { createContext, useReducer } from 'react';

export const WorkspaceContext = createContext({
  methodPanelWidth: 350,
  navigationPanelHeight: 350,
  selectedPanel: 'discovered',
  focus: undefined
});
