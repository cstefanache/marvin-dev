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
      console.log(workspaces)
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
          {workspaces.map((workspace: string) => {
            const workspaceName = workspace.substring(workspace.lastIndexOf('/') + 1);

            return (
              <li key={workspace} onClick={selectWorkspaceFolder}>
                <Icon icon="box"/>
                <div className="item-text">
                  <p>{workspaceName.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</p>
                  <span>{workspace}</span>
                </div>
              </li>
            )}
          )}
        </ul>
      }
    </div>
  );
}
