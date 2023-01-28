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
