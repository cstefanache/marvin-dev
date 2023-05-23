import { useContext, useEffect, useMemo, useState } from 'react';

import { Button, Icon, InputGroup, NonIdealState } from '@blueprintjs/core';
import './WorkspacesStyles.scss';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import { TitlePanel } from '../components/TitlePanel/TitlePanel';

interface Props {
  selectWorkspace: (fromNew?: boolean) => void;
}

export default function Workspaces({ selectWorkspace }: Props) {
  const [workspaces, setWorkspaces] = useState([]);
  const workspaceContext = useContext(WorkspaceContext);
  const [filter, setFilter] = useState('');

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

  const filteredData = useMemo(() => {
    return filter && workspaces
      ? workspaces?.filter(
          (v) =>
            !filter || v.name?.toLowerCase().indexOf(filter.toLowerCase()) > -1
        )
      : workspaces;
  }, [workspaces, filter]);

  return (
    <div className="container">
      <TitlePanel
        title={
          <div className="input">
            <span>Workspace</span>
            <button onClick={selectWorkspaceFolder}></button>
          </div>
        }
      >
        <div>
          <InputGroup
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name"
            rightElement={
              <Button
                icon="delete"
                minimal={true}
                onClick={() => {
                  setFilter('');
                }}
              />
            }
          />
          {filteredData && filteredData.length > 0 ? (
            <ul className="list">
              <p>Recent:</p>
              {filteredData.map((workspace: { path: string; name: string }) => {
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
                    <Icon
                      icon="trash"
                      onClick={() => deletePath(workspace.path)}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <NonIdealState
              title="No items available"
              description="If you think there should be, try reducing filtering."
              icon="info-sign"
              iconSize={48}
              className="no-state"
            />
          )}
        </div>
      </TitlePanel>
    </div>
  );
}
