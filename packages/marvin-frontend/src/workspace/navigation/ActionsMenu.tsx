import { useState } from 'react';
import { Alert, Intent, InputGroup, MenuItem } from '@blueprintjs/core';

export default function ActionsMenu(props: any) {
  const {
    selectedElement,
    addBranch,
    newFolder,
    deleteNode,
    run,
    selectSequenceItem,
    element,
    onSelect,
  } = props;
  const { currentNode } = selectedElement || {};
  const [deleteId, setDeleteId] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState<any>(null);

  const handleMoveConfirm = () => {
    deleteNode(deleteId);
    setDeleteId(null);
  };
  return (
    <div>
      <MenuItem
        onClick={() => selectSequenceItem(element)}
        style={{ height: 18, width: 28, padding: 0 }}
      >
        <MenuItem
          text="Delete"
          icon="trash"
          onClick={() => {
            setDeleteId(currentNode.id);
          }}
        />
        <MenuItem text="Add" icon="add" onClick={addBranch} />
        <MenuItem
          text="New folder"
          icon="folder-new"
          onClick={() => setNewFolderName('Method Group')}
        />
        <MenuItem
          text="Change Parent"
          icon="inheritance"
          onClick={props.changeParent}
        />
        <MenuItem text="Run" icon="play" onClick={() => run(true)} />
        <MenuItem
          text="Run and Discover"
          icon="search-template"
          onClick={run}
        />
      </MenuItem>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Confirm"
        icon="folder-new"
        intent={Intent.PRIMARY}
        isOpen={newFolderName !== null}
        onCancel={() => setNewFolderName(null)}
        onConfirm={() => {
          newFolder(newFolderName);
          setNewFolderName(null);
        }}
      >
        <p>Enter folder name:</p>
        <InputGroup
          autoFocus={true}
          fill={true}
          onChange={(e: any) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          value={newFolderName}
        />
      </Alert>

      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        icon="trash"
        intent={Intent.DANGER}
        isOpen={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleMoveConfirm}
      >
        <p>
          Are you sure you want to move <b>filename</b> to Trash? You will be
          able to restore it later, but it will become private to you.
        </p>
      </Alert>
    </div>
  );
}
