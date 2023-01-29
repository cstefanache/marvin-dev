import { Button } from '@blueprintjs/core';

import './ButtonStyles.scss';

interface Props {
  onChange: () => void;
  children?: JSX.Element | JSX.Element[];
}
export default function RemoveButton({ onChange, children }: Props) {
  return (
    <div className="btn-container right">
      <Button onClick={onChange} icon="trash">
        {children}
      </Button>
    </div>
  );
};
