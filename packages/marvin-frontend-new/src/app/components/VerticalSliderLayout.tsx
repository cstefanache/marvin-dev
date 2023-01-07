import { Box, Button, Stack, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import Side from './Side';

function VerticalSlidingContainer({
  leftComponent,
  rightComponent,
  onResize,
}: {
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
  onResize: (width: number) => void;
}) {
  const [width, setWidth] = useState(300);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  useEffect(() => {
    onResize(width);
  }, [width]);

  const onMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setStartWidth(width);
    setDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setWidth(startWidth + e.clientX - startX);
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    setDragging(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100vh',
        userSelect: 'none',
      }}
      onMouseMove={onMouseMove}
    >
      <Box
        sx={{
          width: width,
          height: '100%',
          borderRight: '1px solid #ccc',
          overflow: 'hidden',
        }}
      >
        {leftComponent}
      </Box>
      <Box
        sx={{
          width: '5px',
          height: '100%',
          backgroundColor: '#ccc',
          cursor: 'col-resize',
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      ></Box>
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {rightComponent}
      </Box>
    </Box>
  );
}
