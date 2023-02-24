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
import Workspace from './pages/Workspace/Workspace';
import Config from './pages/Configuration/Config';
import Methods from './pages/Methods/Methods';

export function App() {
  const [workspace, setWorkspace] = useState<{ name: string; path: string }>();
  const [highlightedMethod, setHighlightedMethod] = useState<string | null>(
    null
  );

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

  const selectWorkspace = async (fromNew: boolean = false) => {
    const workspace = await window.electron.getWorkspace();
    console.log(workspace);
    setWorkspace(workspace);
    navigate(fromNew ? '/configuration' : '/');
  };

  const highlightMethod = (id: string) => {
    setHighlightedMethod(id);
    navigate('/');
  };

  return (
    <>
      <Header workspaceName={workspace?.name} />
      <Routes>
        <Route
          path="/"
          element={
            workspace && (
              <Workspace
                workspace={workspace}
                highlightedMethod={highlightedMethod}
              />
            )
          } // Execution Workflow aka Main Screen
        />
        <Route
          path="/workspaces"
          element={<Workspaces selectWorkspace={selectWorkspace} />} // List with WorkSpaces and the Open Folder button
        />
        <Route
          path="/configuration"
          element={<Config />} // Configuration page
        />
        <Route
          path="/methods"
          element={<Methods setHighlightedMethod={highlightMethod} />}
        />
      </Routes>
    </>
  );
}

export default App;
