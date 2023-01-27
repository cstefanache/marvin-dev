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
    () => {},
    { opacity: (d: any) => (d.data.exitUrl !== undefined ? 1 : 0) }
  );
  addSVGButton(
    node,
    (d: any) => `translate(0,80)`,
    'Edit',
    Edit,
    () => {},
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
    () => {},
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
