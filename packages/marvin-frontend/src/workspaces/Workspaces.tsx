import { useContext, useEffect, useState } from 'react';

import { Icon } from '@blueprintjs/core';
import './WorkspacesStyles.scss';
import { WorkspaceContext } from '../contexts/WorkspaceContext';

interface Props {
  selectWorkspace: (fromNew?: boolean) => void;
}

export default function Workspaces({ selectWorkspace }: Props) {
  const [workspaces, setWorkspaces] = useState([]);
  const workspaceContext = useContext(WorkspaceContext);

  useEffect(() => {
    const asyncFn = async () => {
      const workspaces = await window.electron.getWorkspaces();
      setWorkspaces(workspaces);
    };
    asyncFn();
  }, []);

  const selectWorkspaceFolder = async () => {
    workspaceContext.focus = undefined;
    await window.electron.selectNewWorkspaceFolder();
    selectWorkspace(true);
  };

  const selectExistingWorkspace = async (workspace: any) => {
    workspaceContext.focus = undefined;
    await window.electron.selectWorkspace(workspace);
    selectWorkspace();
  };

  const deletePath = async (path: string) => {
    const asyncFn = async () => {
      await window.electron.deletePath(path);
      const workspaces = await window.electron.getWorkspaces();
      setWorkspaces(workspaces);
    };
    asyncFn();
  };

  return (
    <div className="container">
      <div className="input">
        <span>Workspace</span>
        <button onClick={selectWorkspaceFolder}></button>
      </div>
      {workspaces && workspaces.length > 0 && (
        <ul className="list">
          <p>Recent:</p>
          {workspaces.map((workspace: { path: string; name: string }) => {
            const workspaceName = workspace.name;

            return (
              <li key={workspace.path}>
                <Icon icon="box" />
                <div
                  className="item-text"
                  onClick={() => selectExistingWorkspace(workspace)}
                >
                  <p>{workspaceName}</p>
                  <span>{workspace.path}</span>
                </div>
                <Icon icon="trash" onClick={() => deletePath(workspace.path)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
