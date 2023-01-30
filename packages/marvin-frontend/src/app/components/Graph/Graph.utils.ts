const d3 = require('d3');
import {
  Camera,
  Comparison,
  FlowBranch,
  Edit,
  Trash,
  Play,
  Plus,
} from '@blueprintjs/icons/lib/esm/generated/16px/paths';

export const cellStrokeCol = '#000000';
export const cellBgCol = '#FBD065';
export const spacing = 80;
export const padding = 20;
export const cellPadding = 5;
export const maxCellSize = 250;
export const minCellHeight = 100;
export const minCellWidth = 100;
export const verticalSpacing = 60;
export const fontSize = 14;
export const font = 'Helvetica';

export function wrap(text: any, width: number) {
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
        .attr('text-rendering', 'optimizeSpeed')
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
          .attr('text-rendering', 'optimizeSpeed')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

export function setAttrs(node: any, attrs: any): any {
  Object.keys(attrs).forEach((key) => {
    node.attr(key, attrs[key]);
  });
  return node;
}

export function getTitleFromNode(node: any) {
  return node.data.sequenceStep;
}

export function addSVGButton(
  node: any,
  locateFn: Function,
  title: string,
  icon: any,
  func: Function,
  attrs: any = {},
  bgCol = cellBgCol
) {
  const button = node.append('g');
  setAttrs(button, {
    transform: locateFn,
    class: 'button',
    ...attrs,
  }).on('click', (e: any, d: any) => func(d));

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
  setAttrs(button.append('path'), {
    d: icon,
    transform: `translate(-5, -6)scale(0.7)`,
    'pointer-events': 'none',
  });

  return button;
}
export function prepareGraphNode(node: any, runEvents: any = {}) {
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

  setAttrs(node.append('text'), {
    font,
    'font-size': fontSize,
    'text-rendering': 'optimizeSpeed',
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
    'text-rendering': 'optimizeSpeed',
    x: 20,
    y: function () {
      return (
        24 + d3.select(this.parentNode).select('.title').node().getBBox().height
      );
    },
    'text-anchor': 'left',
    'alignment-baseline': 'hanging',
  })
    .text((d: any) => (d.data.method ? `<> ${d.data.method}` : ''))
    .call(wrap, maxCellSize);

  setAttrs(node.append('path'), {
    transform: (d: any) => `translate(18, ${d.ySize - 26})scale(0.6)`,
    d: `M9.5,4c0.4,0,0.8-0.1,1.1-0.3C12,4.5,12.9,6,13,7.6l0,0c0,0.5,0.5,0.9,1,0.9
    c0.6,0,1-0.4,1-1c0-0.1,0-0.1,0-0.2c-0.2-2.4-1.5-4.4-3.5-5.5c-0.1-1-0.9-1.8-2-1.8s-2,0.9-2,2S8.4,4,9.5,4L9.5,4z M4,8.5
    c0-0.7-0.4-1.3-0.9-1.7c0.3-1.4,1.2-2.6,2.5-3.3c0.3-0.1,0.6-0.4,0.6-0.9s-0.4-1-1-1c-0.2,0-0.3,0-0.5,0.1c-1.9,1-3.2,2.8-3.6,5
    C0.4,7.1,0,7.8,0,8.5c0,1.1,0.9,2,2,2S4,9.6,4,8.5L4,8.5z M12.8,9.7c-1.1,0-2,0.9-2,2c0,0.1,0,0.2,0,0.3C10,12.6,9,12.9,8,12.9
    c-1.2,0-2.3-0.4-3.2-1.1c-0.2-0.2-0.4-0.3-0.7-0.3c-0.6,0-1,0.4-1,1c0,0.3,0.1,0.6,0.3,0.8l0,0C4.6,14.4,6.2,15,8,15
    c1.5,0,3-0.5,4.1-1.3c0.2,0.1,0.5,0.1,0.7,0.1c1.1,0,2-0.9,2-2S13.9,9.7,12.8,9.7L12.8,9.7z`,
  });

  setAttrs(node.append('path'), {
    transform: (d: any) => `translate(43, ${d.ySize - 25})scale(0.5)`,
    d: `M10,5 C10,5.55 10.45,6 11,6 L15,6 C15.55,6 16,5.55 16,5 L16,1 C16,0.45 15.55,0 15,0 C14.45,0 14,0.45 14,1 L14,2.74 C12.54,1.07 10.4,0 8,0 C3.58,0 0,3.58 0,8 C0,12.06 3.02,15.4 6.94,15.92 C6.96,15.92 6.98,15.93 7,15.93 C7.33,15.97 7.66,16 8,16 C12.42,16 16,12.42 16,8 C16,7.45 15.55,7 15,7 C14.45,7 14,7.45 14,8 C14,11.31 11.31,14 8,14 C7.29,14 6.63,13.85 6,13.62 L6,13.63 C3.67,12.81 2,10.61 2,8 C2,4.69 4.69,2 8,2 C9.77,2 11.36,2.78 12.46,4 L11,4 C10.45,4 10,4.45 10,5 Z`,
  });

  setAttrs(node.append('text'), {
    font,
    'font-size': fontSize - 4,
    'text-rendering': 'optimizeSpeed',
    x: 30,
    y: (d: any) => d.ySize - 25,
    'text-anchor': 'left',
    'alignment-baseline': 'hanging',
  }).text((d: any) => d.data.loop || 1);

  setAttrs(node.append('text'), {
    font,
    'font-size': fontSize - 4,
    'text-rendering': 'optimizeSpeed',
    x: 55,
    y: (d: any) => d.ySize - 25,
    'text-anchor': 'left',
    'alignment-baseline': 'hanging',
  }).text((d: any) => d.data.methodLoop || 1);

  addSVGButton(
    node,
    (d: any) => `translate(0,20)`,
    'Screenshot',
    Camera,
    (d: any) => {
      runEvents['screenshot'](d.data.id);
    },
    { opacity: (d: any) => (d.data.exitUrl !== undefined ? 1 : 0) }
  );
  addSVGButton(
    node,
    (d: any) => `translate(0,45)`,
    'Discovered Elements',
    Comparison,
    (d: any) => runEvents['showDiscovered'](d.data.exitUrl),
    { opacity: (d: any) => (d.data.exitUrl !== undefined ? 1 : 0) }
  );
  addSVGButton(
    node,
    (d: any) => `translate(0,80)`,
    'Edit',
    Edit,
    (d: any) => runEvents['editMethod'](d.parent?.data, d.data),
    {},
    '#46B044'
  );
  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize},20)`,
    'Clone',
    FlowBranch,
    () => {}
  );
  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize},80)`,
    'Delete',
    Trash,
    (d: any) => {
      runEvents['cutBranch'](d.data.id);
    },
    {},
    '#FB6565'
  );

  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize / 2 - 25},${d.ySize})`,
    'Execute up to this step',
    Play,
    (d: any) => runEvents['play'](d),
    {},
    '#68C1EE'
  );

  addSVGButton(
    node,
    (d: any) => `translate(${d.xSize / 2 + 25},${d.ySize})`,
    'Add next step',
    Plus,
    (d: any) => runEvents['addMethod'](d.data),
    { opacity: (d: any) => (d.data.exitUrl !== undefined ? 1 : 0) },
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
}
