import { Button, Icon } from '@blueprintjs/core';

import './ButtonStyles.scss';

interface Props {
  onChange: () => void;
  children?: JSX.Element | JSX.Element[];
}
export default function RemoveButton({ onChange, children }: Props) {
  return <Icon icon="trash" onClick={onChange} />;
}
