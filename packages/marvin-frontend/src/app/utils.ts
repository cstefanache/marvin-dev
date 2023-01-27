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
