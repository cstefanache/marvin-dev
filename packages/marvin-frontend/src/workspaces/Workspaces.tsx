import { useContext, useEffect, useMemo, useState } from 'react';

import { Button, Icon, InputGroup } from '@blueprintjs/core';
import './WorkspacesStyles.scss';
import { WorkspaceContext } from '../contexts/WorkspaceContext';

interface Props {
  selectWorkspace: (fromNew?: boolean) => void;
}

export default function Workspaces({ selectWorkspace }: Props) {
  const [workspaces, setWorkspaces] = useState([]);
  const workspaceContext = useContext(WorkspaceContext);
  const [filter, setFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

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

  const fiteredData = useMemo(() => {
    return filter && workspaces
      ? workspaces?.filter(
          (v) =>
            !filter || v.name?.toLowerCase().indexOf(filter.toLowerCase()) > -1
        )
      : workspaces;
  }, [workspaces, filter]);

  return (
    <div className="container">
      <div className="input">
        <span>Workspace label</span>
        <button onClick={selectWorkspaceFolder} />
      </div>
      {!showFilter ? (
        <Icon icon="filter" size={14} onClick={() => setShowFilter(true)} />
      ) : (
        <InputGroup
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name"
          rightElement={
            <Button
              icon="delete"
              minimal={true}
              onClick={() => {
                setShowFilter(false);
              }}
            />
          }
        />
      )}
      {workspaces && workspaces.length > 0 && (
        <ul className="list">
          <p>Recent:</p>
          {fiteredData.map((workspace: { path: string; name: string }) => {
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
