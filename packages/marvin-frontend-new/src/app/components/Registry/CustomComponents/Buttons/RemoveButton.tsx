import { Button } from '@blueprintjs/core';

import '../Buttons/ButtonStyles.scss';

interface Props {
  value: string;
  onChange: () => void;
  children?: JSX.Element | JSX.Element[];
}
export default function RemoveButton({ value, onChange, children }: Props) {
  return (
    <div className="btn-container right">
      <Button intent="danger" text={value} onClick={onChange}>
        {children}
      </Button>
    </div>
  );
};
