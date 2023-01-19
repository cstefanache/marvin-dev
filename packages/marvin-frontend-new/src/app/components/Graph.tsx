import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Comparison,
  FlowBranch,
  Edit,
  Trash,
  Play,
  Plus,
} from '@blueprintjs/icons/lib/esm/generated/16px/paths';
import './GraphStyles.scss';
const flextree = require('d3-flextree').flextree;
const d3 = require('d3');

const cellStrokeCol = '#000000';
const cellBgCol = '#FBD065';
const spacing = 80;
const padding = 20;
const cellPadding = 5;
const maxCellSize = 250;
const minCellHeight = 100;
const minCellWidth = 100;
const verticalSpacing = 60;
const fontSize = 14;
const font = 'Helvetica';

function wrap(text: any, width: number) {
  text.each(function (this: any) {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr('x'),
      y = text.attr('y'),
      dy = 0,
      tspan = text
        .text(null)
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', dy + 'em');
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

function setAttrs(node: any, attrs: any): any {
  Object.keys(attrs).forEach((key) => {
    node.attr(key, attrs[key]);
  });
  return node;
}

const getTitleFromNode = (node: any) => {
  return node.data.sequenceStep;
};

const addSVGButton = (
  node: any,
  locateFn: Function,
  title: string,
  icon: any,
  bgCol = cellBgCol
) => {
  const button = node.append('g');
  setAttrs(button, {
    transform: locateFn,
    class: 'button',
  });

  const circle = setAttrs(button.append('circle'), {
    r: 10,
    fill: bgCol,
    stroke: cellStrokeCol,
    'stroke-width': 2,
  });

  setAttrs(circle.append('title'), {}).text(title);
  // setAttrs(button.append('rect'), {
  //   width: 20,
  //   height: 20,
  //   fill: bgCol,
  //   stroke: cellStrokeCol,
  //   'stroke-width': 2,
  //   transform: `translate(-10, -10)`,
  //   rx: 3,
  //   ry: 3,
  // });
  const iconElement = setAttrs(button.append('path'), {
    d: icon,
    transform: `translate(-5, -6)scale(0.7)`,
    'pointer-events': 'none',
  });

  return button;
};
const prepareGraphNode = (node: any) => {
  setAttrs(node.append('rect'), {
    width: (d: any) => d.xSize,
    height: (d: any) => d.ySize,
    fill: cellBgCol,
    stroke: cellStrokeCol,
    rx: 3,
    ry: 3,
    'stroke-width': 2,
  });
  setAttrs(node.append('circle'), {
    r: 4,
    fill: '#68C1EE',
    cx: (d: any) => d.xSize / 2,
    stroke: cellStrokeCol,
    'stroke-width': 2,
  });

  setAttrs(node.append('circle'), {
    r: 4,
    fill: cellBgCol,
    cx: (d: any) => d.xSize / 2,
    cy: (d: any) => d.ySize,
    stroke: cellStrokeCol,
    'stroke-width': 2,
  });

  const textNode = setAttrs(node.append('text'), {
    font,
    'font-size': fontSize,
    x: 20,
    y: 24,
    class: 'title',
    'text-anchor': 'left',
  })
    .text((d: any) => getTitleFromNode(d))
    .call(wrap, maxCellSize);

  setAttrs(node.append('text'), {
    font,
    'font-size': fontSize - 4,
    x: 20,
    y: function() {
      return 24 + d3.select(this.parentNode).select('.title').node().getBBox().height;
    },
    'text-anchor': 'left',
    'alignment-baseline': 'hanging',
  })
    .text((d: any) => `<> ${d.data.method}`)
    .call(wrap, maxCellSize);

  addSVGButton(node, (d: any) => `translate(0,20)`, 'Screenshot', Camera);
  addSVGButton(
    node,
    (d: any) => `translate(0,45)`,
    'Discovered Elements',
    Comparison
  );
  addSVGButton(node, (d: any) => `translate(0,80)`, 'Edit', Edit, '#46B044');
  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize},20)`,
    'Clone',
    FlowBranch
  );
  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize},80)`,
    'Delete',
    Trash,
    '#FB6565'
  );

  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize / 2 - 25},${d.ySize})`,
    'Execute up to this step',
    Play,
    '#68C1EE'
  );

  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize / 2 + 25},${d.ySize})`,
    'Add next step',
    Plus,
    '#68C1EE'
  );

  node
    .selectAll('.button')
    .on('mouseover', function (event: any) {
      const { target } = event;
      d3.select(target)
        .transition()
        .duration(100)
        .attr('r', 12)
        .attr('class', 'hover');
    })
    .on('mouseout', (event: any) => {
      const { target } = event;
      d3.select(target)
        .transition()
        .duration(100)
        .attr('r', 10)
        .attr('class', '');
    });
};

export function Graph({ flow }: { flow: any }) {
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
      return [width, height ];
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
          Math.min(
            Math.max(titleWidth, methodWidth) + cellPadding * 2 + 30,
            maxCellSize + padding * 2
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
        // M 100 300 Q 100 400 250 400 Q 400 400 400 500
        // return `M${source.x} ${source.y + source.ySize}
        //         Q ${source.x} ${source.y + source.ySize / 2} ${source.x + source.xSize / 2} ${source.y + source.ySize / 2}
        //         Q ${source.x + source.xSize} ${source.y + source.ySize / 2} ${source.x + source.xSize} ${source.y}`
      });

    const node = g.selectAll('.node').data(nodes);
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('id', (d: any) => `action-${d.data.id}`)
      .attr('transform', (d: any) => `translate(${d.x - d.xSize / 2} ${d.y})`);

    prepareGraphNode(nodeEnter);

    // nodeEnter
    //   .append('rect')
    //   .attr('width', (d: any) => d.xSize)
    //   .attr('height', (d: any) => d.ySize)
    //   .attr('fill', cellBgCol)
    //   .attr('stroke', cellStrokeCol)
    //   .attr('rx', 3)
    //   .attr('ry', 3);
  }, [flow]);

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', flexGrow: 1, backgroundColor: '#2F343C' }}
    ></svg>
  );
}
