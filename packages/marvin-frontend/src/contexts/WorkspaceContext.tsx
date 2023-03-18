import { createContext, useReducer } from 'react';

export const WorkspaceContext = createContext({
  methodPanelWidth: 350,
  navigationPanelHeight: 350,
  consolePanelHeight: 300,
  consolePanelWidth: 400,
  selectedPanel: 'discovered',
  focus: undefined
});
