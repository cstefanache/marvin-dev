import React, { useEffect, useRef, useState } from 'react';

import './GraphStyles.scss';
const flextree = require('d3-flextree').flextree;
const d3 = require('d3');

import {
  wrap,
  prepareGraphNode,
  font,
  maxCellSize,
  fontSize,
  cellPadding,
  padding,
  minCellHeight,
  minCellWidth,
  verticalSpacing,
  spacing,
} from './Graph.utils';

export function Graph({
  config,
  flow,
  openDrawer,
  runDiscovery,
  showDiscoveredElements,
}: {
  config: any;
  flow: any;
  openDrawer: Function;
  runDiscovery: Function;
  showDiscoveredElements: Function;
}) {
  const [path, setPath] = useState(null);
  const [imageId, setImg] = useState(null);
  const [storedContainer, setStoredContainer] = useState<any>(null);
  const svgRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const asyncFn = async () => {
      const path = await window.electron.getWorkspacePath();
      setPath(path);
    };
    asyncFn();
  }, []);

  const run = (d: any) => {
    const ids: any[] = [];
    const buildSequence = (item: any, to: string[]) => {
      const { data, parent } = item;
      const { sequenceStep, id } = data;
      if (parent) {
        to.push(sequenceStep);
        ids.push(id);
        buildSequence(parent, to);
      }
    };

    const sequence: string[] = [];
    buildSequence(d, sequence);

    const svg = d3.select(svgRef.current);
    svg.selectAll('.node').attr('class', 'node disabled');
    svg.selectAll('.node .button').attr('opacity', 0);
    d3.select(`#action-root`).attr('class', 'node loading');
    ids.forEach((id) => {
      d3.select(`#action-${id}`).attr('class', 'node loading');
    });
    runDiscovery(sequence.reverse());
  };

  useEffect((): any => {
    function handleResize() {
      console.log({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  window.ipcRender.receive('running-discovery', () => {
    if (overlayRef.current) {
      (overlayRef.current as any).style.display = 'flex';
    }
  });

  useEffect(() => {
    const { graph } = flow;
    const svg = d3.select(svgRef.current);

    let measureContainer = storedContainer;
    if (!measureContainer) {
      measureContainer = svg.append('g');
      setStoredContainer(storedContainer);
    }

    const toRemove = svg.selectAll('.graph');
    const g = svg.append('g').attr('class', 'graph');

    window.ipcRender.receive('action-finished', (id: string) => {
      const idToUpdate = id ? id : 'root';
      d3.select(`#action-${idToUpdate}`)
        .attr('opacity', 1)
        .attr('class', 'node');
    });

    window.ipcRender.receive('run-completed', (id: string) => {
      svg.selectAll('.node').attr('opacity', 1).attr('class', 'node');
      svg.selectAll('.node .button').attr('opacity', 1);
    });

    function getMeasurementFor(textContent: string, fontSize: number) {
      measureContainer.selectAll('text').remove();
      const text = measureContainer
        .append('text')
        .text((d: any) => textContent)
        .attr('font', font)
        .attr('font-size', fontSize)
        .attr('text-anchor', 'left')
        .call(wrap, maxCellSize);

      const boundingBox = text.node().getBBox();
      const { width, height, y } = boundingBox;
      return [width, height, text];
    }
    const layout = flextree({
      children: (d: any) => d.children,
      nodeSize: (n: any) => {
        const [titleWidth, titleHeight, titleElement] = getMeasurementFor(
          n.data.sequenceStep,
          fontSize
        );
        const [methodWidth, methodHeight, methodElement] = getMeasurementFor(
          n.data.method,
          fontSize - 2
        );

        Object.assign(n, { titleElement, methodElement });

        return [
          Math.max(
            Math.min(
              Math.max(titleWidth, methodWidth) + cellPadding * 2 + 30,
              maxCellSize + padding * 2
            ),
            minCellWidth
          ),
          Math.max(titleHeight + methodHeight, minCellHeight),
        ];
      },
      spacing: (a: any, b: any) => spacing,
    });

    const hier = {
      sequenceStep: 'App Entry',
      // url: config ? config.rootUrl : '/',
      url: '/',
      exitUrl: config ? config.exitUrl : '',
      id: 'root',
      children: graph,
    };

    console.log('Building tree (2)');
    const tree = layout.hierarchy(hier);
    layout(tree);

    tree.each((node: any) => {
      node.y += node.depth * verticalSpacing;
    });

    const extents = tree.extents;

    const { top, bottom, left, right } = extents;

    const width = right - left + 2 * padding + 60;
    const height = bottom - top + 2 * padding;
    const transX = (width - 60) / 2;

    function handleZoom(e: any) {
      g.attr('transform', e.transform);
    }

    let zoom = d3.zoom().on('zoom', handleZoom);

    svg.call(zoom);
    // zoom.scaleTo(svg, 0.5);
    const { width: gWidth, height: gHeight } = g.node().getBBox();
    zoom.translateTo(
      svg,
      0,
      svg.node().getBoundingClientRect().height / 2 - 30
    );
    const nodes = tree.descendants();
    const links = tree.links();

    const link = g.selectAll('path.link').data(links);
    console.log('Building links');
    const linkEnter = link
      .enter()
      .append('path')
      .attr('stroke', '#e2b862')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', (d: any) => {
        const { source, target } = d;

        const startPointX = source.x;
        const startPointY = source.y + source.ySize;
        const endPointX = target.x;
        const endPointY = target.y;
        const midPointX = startPointX + (endPointX - startPointX) / 2;
        const midPointY = startPointY + (endPointY - startPointY) / 2;

        return `
            M${startPointX} ${startPointY} 
            Q${startPointX} ${midPointY} ${midPointX} ${midPointY}
            Q${endPointX} ${midPointY} ${endPointX} ${endPointY}
            `;
      });

    console.log('Building nodes');
    const node = g.selectAll('.node').data(nodes);
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('id', (d: any) => `action-${d.data.id}`)
      .attr('transform', (d: any) => `translate(${d.x - d.xSize / 2} ${d.y})`);

    prepareGraphNode(nodeEnter, {
      play: run,
      addMethod: (obj: any) => {
        openDrawer('addMethod', 'Add Method', obj);
      },
      editMethod: (obj: any, data: any) => {
        openDrawer('addMethod', 'Edit Method', obj, data);
      },
      screenshot: (id: any) => {
        console.log('setting image', id);
        setImg(id);
      },
      cutBranch: (id: any) => {
        window.electron.cutBranch(id);
      },
      showDiscovered: showDiscoveredElements,
    });
    toRemove.remove();
    if (overlayRef.current) {
      (overlayRef.current as any).style.display = 'none';
    }
  }, [flow]);

  return (
    <div
      style={{
        display: 'flex',
        flexGrow: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {path && imageId && (
        <div
          className="backdrop"
          onClick={() => {
            setImg(null);
          }}
        >
          <img
            className="coverimage"
            src={`file://${path}/screenshots/${imageId}.png`}
          />
        </div>
      )}
      <svg
        ref={svgRef}
        style={{ width: '100%', flexGrow: 1, backgroundColor: '#2F343C' }}
      ></svg>
      <div
        ref={overlayRef}
        className="rebuildingGraph"
        style={{
          display: 'none',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 32
        }}
      >
        <span>Running Discovery</span>
      </div>
    </div>
  );
}
