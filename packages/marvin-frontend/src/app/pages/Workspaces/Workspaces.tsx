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

  return (
    <div className="container">
      <div>
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
                <li
                  key={workspace.path}
                  onClick={() => selectExistingWorkspace(workspace)}
                >
                  <Icon icon="box" />
                  <div className="item-text">
                    <p>{workspaceName}</p>
                    <span>{workspace.path}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
