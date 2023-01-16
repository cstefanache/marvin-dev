/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    require: any;
  }
}

import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Header from './components/Header/Header';
import Workspaces from './pages/Workspaces/Workspaces';
import Workspace from './pages/Workspace';
import Config from './pages/Config';


export function App() {
  const [workspace, setWorkspace] = useState<string>();
  const [workspaceName, setWorkspaceName] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const asyncFn = async () => {
      const workspace = await window.electron.getWorkspace();
      console.log(workspace);
      if (!workspace) {
        navigate('/workspaces');
      }
      setWorkspace(workspace);
      const workspaceName =  workspace.substring(workspace.lastIndexOf('/') + 1);
      setWorkspaceName(workspaceName.replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase()))
    };
    asyncFn();
  }, [navigate]);

  const selectWorkspace = () => {
    console.log(workspace);
  };

  return (
    <>
      <Header workspaceName={workspaceName}/>
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
