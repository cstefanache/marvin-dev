// const showDiscoveredElements =

import React from 'react';

export default function RunningPanel(props: any) {
  const { path, loadingIds } = props;

  return (
    <>
      <div
        className="image"
        style={{
          backgroundImage: `url(file://${path}/screenshots/${(
            loadingIds[0] || ''
          ).replace('-discovery', '')}.png)`,
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
        }}
      ></div>
    </>
  );
}
