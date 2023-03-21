import { useEffect, useState } from 'react';

import { Button, Icon } from '@blueprintjs/core';

export default function Generate(props: any) {
  return (
    <div className="container">
      <Button
        icon="refresh"
        text="Generate Cypress Tests"
        onClick={() => {
          window.electron.generateTests();
        }}
      />
    </div>
  );
}
