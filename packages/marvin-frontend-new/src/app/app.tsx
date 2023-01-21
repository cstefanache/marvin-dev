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

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Header from './components/Header/Header';
import Workspaces from './pages/Workspaces/Workspaces';
import Workspace from './pages/Workspace';
import Config from './pages/Configuration/Config';


export function App() {
  const [workspace, setWorkspace] = useState<{name: string, path: string}>();

  const navigate = useNavigate();

  useEffect(() => {
    const asyncFn = async () => {
      const workspace = await window.electron.getWorkspace();
      if (!workspace) {
        navigate('/workspaces');
      }
      setWorkspace(workspace);
    };
    asyncFn();
  }, [navigate]);

  const selectWorkspace = () => {
    if (workspace) navigate('/');
  };

  return (
    <>
      <Header workspaceName={workspace?.name}/>
      <Routes>
        <Route
          path="/"
          element={workspace && <Workspace workspace={workspace} />} // Execution Workflow aka Main Screen
        />
        <Route
          path="/workspaces"
          element={<Workspaces selectWorkspace={selectWorkspace} />} // List with WorkSpaces and the Open Folder button
        />
        <Route
          path="/configuration"
          element={<Config />} // Configuration page
        />
      </Routes>
    </>
  );
}

export default App;
