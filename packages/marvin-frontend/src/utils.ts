export const getIcon = (item: any) => {
  switch (item.from) {
    case 'info':
      return 'info-sign';
    case 'actions':
      return 'hand-up';
    case 'input':
      return 'text-highlight';
    case 'iterable':
      return 'comparison';
    default:
      return 'help';
  }
};

export const getActionIcon = (action: any) => {
  switch (action) {
    case 'fill':
    case 'clearAndFill':
      return 'text-highlight';
    case 'click':
      return 'hand-up';
    case 'store':
      return 'bookmark';
    default:
      return 'help';
  }
};

export function getNodesForFilter(tree: any, filter: Function): any[] {
  const list: any[] = [];

  function traverse(node: any) {
    if (filter(node)) {
      list.push(node);
    }

    (node.children || []).forEach((childNode: any) => traverse(childNode));
  }
  traverse(tree)

  return list;
}

export function localFlattenTree(tree: any): any[] {
  const flatTree: any[] = [];
  let currentId = 0;

  function traverse(
    node: any,
    parent: any,
    localParentId: number | undefined
  ): any {
    const currentNode: any = {
      currentNode: node,
      parentNode: parent,
      name: node.sequenceStep,
      id: currentId,
      parent: localParentId,
    };
    flatTree.push(currentNode);
    currentId += 1;
    if (node.children) {
      currentNode.children = node.children.reduce((memo: any[], child: any) => {
        const childNode: any = traverse(child, currentNode, currentNode.id);
        memo.push(childNode.id);
        return memo;
      }, []);
    }

    return currentNode;
  }

  // flatTree.push({
  //   currentNode: tree,
  //   name: tree.name,
  //   id: 0,
  //   parent: undefined,
  //   children: traverse(tree, undefined, undefined),
  // });

  traverse(tree, undefined, undefined);

  return flatTree;
}
