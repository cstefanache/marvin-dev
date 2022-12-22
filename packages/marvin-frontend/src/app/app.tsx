// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    require: any;
  }
}
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';

import { ThemeProvider } from '@mui/material/styles';
import { Button } from '@mui/material';
import Workspaces from './pages/Workspaces';
import Workspace from './pages/Workspace';
import theme from './theme';

export function App() {
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<string>();

  const navigate = useNavigate();

  useEffect(() => {
    const asyncFn = async () => {
      const workspace = await window.electron.getWorkspace();
      if (!workspace) {
        navigate('/select-project');
      }
      setLoading(false);
      setWorkspace(workspace);
    };
    asyncFn();
  }, []);

  const selectWorkspace = (workspace: any) => {
    console.log(workspace);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={workspace && <Workspace workspace={workspace} />}
        />
        <Route
          path="/select-project"
          element={<Workspaces selectWorkspace={selectWorkspace} />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
