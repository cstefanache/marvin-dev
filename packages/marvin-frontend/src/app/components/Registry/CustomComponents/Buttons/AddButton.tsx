import { Button } from '@blueprintjs/core';

import './ButtonStyles.scss';

interface Props {
  value: string;
  onChange: () => void;
  children?: JSX.Element | JSX.Element[];
}
export default function AddButton({ value, onChange, children }: Props) {
  return (
    <div className="btn-container left">
      <Button  text={value} onClick={onChange}  icon="add">
        {children}
      </Button>
    </div>
  );
};