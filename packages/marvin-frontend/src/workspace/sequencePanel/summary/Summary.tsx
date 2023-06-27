import { useState } from 'react';
import { Alert, Icon, Intent, InputGroup } from '@blueprintjs/core';
import './Summary.scss';
import { Tooltip2 } from '@blueprintjs/popover2';

export default function Summary(props: any) {
  const { selectedElement, addBranch, newFolder, deleteNode, run } = props;
  const { currentNode } = selectedElement || {};
  const [deleteId, setDeleteId] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState<any>(null);

  const handleMoveConfirm = () => {
    deleteNode(deleteId);
    setDeleteId(null);
  };

  return (
    <span className="summary">
      <Tooltip2 content="Remove" minimal>
        <Icon
          icon="trash"
          title="Remove current execution step and children"
          onClick={() => {
            setDeleteId(currentNode.id);
          }}
        />
      </Tooltip2>
      <Tooltip2 content="Add" minimal>
        <Icon icon="add" onClick={addBranch} title="Add new execution step" />
      </Tooltip2>
      <Tooltip2 content="Group Methods" minimal>
        <Icon
          icon="folder-new"
          title="Create new folder"
          onClick={() => setNewFolderName('Method Group')}
        />
      </Tooltip2>
      <span className="divider" />
      <Tooltip2 content="Change parent" minimal>
        <Icon
          icon="inheritance"
          title="Change parent"
          onClick={props.changeParent}
        />
      </Tooltip2>
      <span className="divider" />
      <Tooltip2 content="Run" minimal position="bottom">
        <Icon icon="play" onClick={() => run(true)} title="Play" />
      </Tooltip2>
      <Tooltip2 content="Run and Discover" minimal>
        <Icon icon="search-template" onClick={run} title="Run and Discover" />
      </Tooltip2>
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
    </span>
  );
}
