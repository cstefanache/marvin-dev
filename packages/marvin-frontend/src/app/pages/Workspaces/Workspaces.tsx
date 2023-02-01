import { useEffect, useState } from 'react';

import { FileInput, Icon, Callout } from '@blueprintjs/core';
import './WorkspacesStyles.scss';

interface Props {
  selectWorkspace: (fromNew?: boolean) => void;
}

export default function Workspaces({ selectWorkspace }: Props) {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const asyncFn = async () => {
      const workspaces = await window.electron.getWorkspaces();
      setWorkspaces(workspaces);
    };
    asyncFn();
  }, []);

  const selectWorkspaceFolder = async () => {
    await window.electron.selectNewWorkspaceFolder();
    selectWorkspace(true);
  };

  const selectExistingWorkspace = async (workspace: any) => {
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
  }

  return (
    <div className="container">
      {/* <FileInput className="input" text="Workspaces" onInputChange={selectWorkspaceFolder} /> */}
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
