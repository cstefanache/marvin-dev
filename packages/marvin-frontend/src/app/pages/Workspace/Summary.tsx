import React, { useEffect, useState } from 'react';
import { Alert, Icon, Intent, InputGroup } from '@blueprintjs/core';

export default function Summary(props: any) {
  const { selectedElement, addBranch, newFolder, deleteNode } = props;
  const { currentNode } = selectedElement || {};
  const [deleteId, setDeleteId] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState<any>(null);

  const handleMoveConfirm = () => {
    deleteNode(deleteId);
    setDeleteId(null);
  };
  return (
    <div className="summary">
      <div className="summary-actions">
        Actions:
        <Icon
          icon="trash"
          onClick={() => {
            setDeleteId(currentNode.id);
          }}
        />
        <Icon icon="add" onClick={addBranch} />
        <Icon
          icon="folder-new"
          onClick={() => setNewFolderName('Method Group')}
        />
      </div>
      <div className="summary-content">Text</div>
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
