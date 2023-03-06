import React, { useEffect, useState } from 'react';
import { Alert, Icon, Intent, InputGroup } from '@blueprintjs/core';

export default function Summary(props: any) {
  const { selectedElement, addBranch, newFolder, deleteNode, run } = props;
  const { currentNode } = selectedElement || {};
  const [deleteId, setDeleteId] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any>(null);
  const handleMoveConfirm = () => {
    deleteNode(deleteId);
    setDeleteId(null);
  };

  // const toggleMenu = () => {
  //   const { currentNode } = selectedElement;
  //   const { url } = currentNode;

  //   // props.flow.filter( item => {
  //   //   item.
  //   // })
  //   const menuItems = props.flow.filter(
  //     (item: any) => item.currentNode.exitUrl === url
  //   );
  //   setMenuItems(
  //     menuItems.map((item: any) => ({
  //       id: item.currentNode.id,
  //       name: item.name,
  //     }))
  //   );
  // };

  return (
    <div className="summary">
      <div className="summary-actions">
        Actions:
        <Icon
          icon="trash"
          title="Remove current execution step and children"
          onClick={() => {
            setDeleteId(currentNode.id);
          }}
        />
        <Icon icon="add" onClick={addBranch} title="Add new execution step" />
        <Icon
          icon="folder-new"
          title="Create new folder"
          onClick={() => setNewFolderName('Method Group')}
        />
        <span className="divider" />
        <Icon icon="inheritance" title="Change parent" onClick={props.changeParent} />
        <span className="divider" />
        <Icon icon="play" onClick={run} title="Run" />
      </div>
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
