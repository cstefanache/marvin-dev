import { useEffect, useState } from 'react';

import { FileInput, Icon } from "@blueprintjs/core";
import "./WorkspacesStyles.scss";

interface Props {
  selectWorkspace: () => void;
}

export default function Workspaces({
  selectWorkspace
}: Props) {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const asyncFn = async () => {
      const workspaces = await window.electron.getWorkspaces();
      setWorkspaces(workspaces);
    };
    asyncFn();
  }, []);

  const selectWorkspaceFolder = () => {
    window.electron.selectNewWorkspaceFolder();
    selectWorkspace();
  }

  return (
    <div className="container bp4-dark">
      <FileInput className="input" text="Workspaces" onInputChange={selectWorkspaceFolder} />

      {workspaces && workspaces.length > 0 && 
        <ul className="list">
          {workspaces.map((workspace: { path: string, name: string }) => {
            const workspaceName = workspace.name;

            return (
              <li key={workspace.path} onClick={selectWorkspaceFolder}>
                <Icon icon="box"/>
                <div className="item-text">
                  <p>{workspaceName}</p>
                  <span>{workspace.path}</span>
                </div>
              </li>
            )}
          )}
        </ul>
      }
    </div>
  );
}
