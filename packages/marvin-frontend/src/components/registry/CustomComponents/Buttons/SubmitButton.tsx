import { Button } from '@blueprintjs/core';

import './ButtonStyles.scss';

interface Props {
  value: string;
  onChange: () => void;
  children?: JSX.Element | JSX.Element[];
}

export default function SubmitButton({ value, onChange, children }: Props) {
  return (
    <div className="btn-container right">
      <Button onClick={onChange} text={value} className="submit-button">
        {children}
      </Button>
    </div>
  );
}