import { useEffect, useState } from 'react';

import { FileInput, Icon, Callout } from "@blueprintjs/core";
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
      <div>
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
      <div>
        <Callout title="Get started with Marvin" className="callout">
          <p>Your working folder must contain the following congiguration JSON files:</p>
          <ul>
            <li><em>flow.json</em></li>
            <li><em>output.json</em></li>
            <li><em>config.json</em></li>
          </ul>
        </Callout>
      </div>
      
    </div>
  );
}
