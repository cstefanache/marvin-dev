// const showDiscoveredElements =

import React from 'react';
import { Log } from '../../components/Log';

export default function RunningPanel(props: any) {
  const { path, loadingIds } = props;

  return (
    <div className='running-panel'>
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
      <Log log="marvin:discovery" />
    </div>
  );
}
