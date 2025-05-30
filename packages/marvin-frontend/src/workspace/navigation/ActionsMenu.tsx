import { useState } from 'react';
import { Alert, Intent, InputGroup, MenuItem } from '@blueprintjs/core';
import './ActionsMenu.scss'

export default function ActionsMenu(props: any) {
  const {
    selectedElement,
    addBranch,
    newFolder,
    deleteNode,
    run,
    selectSequenceItem,
    element,
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
        icon="more"
        onClick={() => selectSequenceItem(element)}
        style={{ height: 18, width: 18, padding: 0 }}
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
        <MenuItem text="Run" icon="play" onClick={() => run(true, element)} />
        <MenuItem
          text="Run and Discover"
          icon="search-template"
          onClick={() => run(false, element)}
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
        className="alert"
      >
        <p>Enter folder name:</p>
        <InputGroup
          autoFocus={true}
          fill={true}
          onChange={(e: any) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          value={newFolderName}
          style={{ width: '100%' }}
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
          Are you sure you want to remove this Method? You will not be able to
          undo this action.
        </p>
      </Alert>
    </div>
  );
}
