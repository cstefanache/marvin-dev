import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import WorkspaceRoot from './workspace/WorkspaceRoot';

// import App from './app/app';

/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    require: any;
  }

  var store: any;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <WorkspaceRoot />
  </BrowserRouter>
);
