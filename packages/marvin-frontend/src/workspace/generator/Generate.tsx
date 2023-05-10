import { useEffect, useState } from 'react';
import './Generate.scss';
import { Button, Card, Icon } from '@blueprintjs/core';

export default function Generate(props: any) {
  return (
    <div className="generate-panel">
      <Card interactive={false} elevation={2}>
        <h2>Generate Cypress Tests from Flow</h2>
        <p>
          This action will generate a complete folder setup for E2E JS tests
          using Cypress Automation framework. The generated tests will use the
          provided Flow described in the workspace panel
        </p>
        <Button
          icon="refresh"
          text="Generate Cypress Tests"
          onClick={() => {
            window.electron.generateTests(false);
          }}
        />
      </Card>
      <Card interactive={false} elevation={2}>
        <h2>Generate Cypress Tests from Sequences</h2>
        <p>
          This action will generate a complete folder setup for E2E JS tests
          using Cypress Automation framework. The generated tests will use the
          provided list from the Sequences
        </p>
        <Button
          icon="refresh"
          text="Generate Cypress Tests from Sequences"
          onClick={() => {
            window.electron.generateTests(true);
          }}
        />
      </Card>
    </div>
  );
}
