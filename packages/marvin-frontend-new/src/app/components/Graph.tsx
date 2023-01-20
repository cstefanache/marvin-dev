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

export function Graph({ flow }: { flow: any }) {
  const [path, setPath] = useState(null);
  const [imageId, setImg] = useState(null);

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
    ids.forEach((id) => {
      d3.select(`#action-${id}`).attr('class', 'node loading');
    });
    window.electron.runDiscovery(sequence.reverse());
  };

  const svgRef = useRef(null);
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

  useEffect(() => {
    const { graph } = flow;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const measureContainer = svg.append('g');

    window.ipcRender.receive('action-finished', (id: string) => {
      d3.select(`#action-${id}`).attr('opacity', 1).attr('class', 'node');
    });

    window.ipcRender.receive('run-completed', (id: string) => {
      svg.selectAll('.node').attr('opacity', 1).attr('class', 'node');
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
      return [width, height];
    }

    const layout = flextree({
      children: (d: any) => d.children,
      nodeSize: (n: any) => {
        const [titleWidth, titleHeight] = getMeasurementFor(
          n.data.sequenceStep,
          fontSize
        );
        const [methodWidth, methodHeight] = getMeasurementFor(
          n.data.method,
          fontSize - 2
        );

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
      sequenceStep: 'root',
      // url: config ? config.rootUrl : '/',
      url: '/',
      children: graph,
    };
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
    const g = svg.append('g');

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

    var link = g.selectAll('path.link').data(links);

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

    const node = g.selectAll('.node').data(nodes);
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('id', (d: any) => `action-${d.data.id}`)
      .attr('transform', (d: any) => `translate(${d.x - d.xSize / 2} ${d.y})`);

    prepareGraphNode(nodeEnter, {
      play: run,
      screenshot: (id: any) => {
        console.log('setting image', id);
        setImg(id);
      },
    });
  }, [flow]);

  return (
    <>
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
    </>
  );
}
