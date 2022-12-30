import React, { useEffect, useState } from 'react';
import { SchemaForm } from '@ascentcore/react-schema-form';
import { hashCode } from '@marvin/discovery';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { CustomRegistry, CustomWrapper } from './CustomRegistry';
import * as uuid from 'uuid';

const flextree = require('d3-flextree').flextree;
const d3 = require('d3');

const padding = 20;
const cellPadding = 5;
const maxCellSize = 150;
const verticalSpacing = 20;
const font = '12px helvetica';

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

const getTitleFromNode = (node: any) => {
  return node.data.sequence_step;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FlowComponent() {
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);
  const svgRef = React.useRef(null);
  const [config, setConfig] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [path, setPath] = useState<string | null>(null);
  const [hieararchy, setHierarchy] = React.useState<any>(null);
  const [imageId, setImageId] = React.useState<string | null>(null);
  const [addFor, setAddFor] = React.useState<any | undefined>(undefined);
  const [schema, setSchema] = React.useState<any>(undefined);
  const [action, setAction] = React.useState<string | undefined>(undefined);
  const [actions, setActions] = React.useState<any | undefined>(undefined);

  const prepareActionForm = (action: string) => {
    setAction(action);
    const method = actions[addFor.exitUrl || addFor.url].filter(
      (method: any) => method.method === action
    )[0];
    if (method) {
      const schema = {
        type: 'object',
        title: method.method,
        properties: {
          sequence_step: {
            type: 'string',
            title: 'Sequence Step',
          },
          parameters: {
            type: 'object',
            properties: method.sequence
              .filter((s: any) => s.type === 'fill' || s.type === 'locate')
              .reduce((memo: any, obj: any) => {
                memo[obj.uid] = { type: 'string', title: obj.locator };
                return memo;
              }, {}),
          },
        },
      };
      setSchema(schema);
    }
  };

  useEffect(() => {
    const asyncFn = async () => {
      const flow = await window.electron.getFlow();
      const path = await window.electron.getWorkspacePath();
      const config = await window.electron.getConfig();
      setConfig(config);
      setPath(path);
      setActions(flow ? flow.actions : {});
      setGraph(flow ? flow.graph : []);
    };
    asyncFn();
  }, []);

  const run = (d: any) => {
    const buildSequence = (item: any, to: string[]) => {
      const { data, parent } = item;
      const { sequence_step } = data;
      if (parent) {
        to.push(sequence_step);
        buildSequence(parent, to);
      }
    };

    const sequence: string[] = [];
    buildSequence(d, sequence);

    const svg = d3.select(svgRef.current);
    svg.selectAll('.node').attr('opacity', 0.2);
    window.electron.runDiscovery(sequence.reverse());
  };

  const saveFlow = (data: any) => {
    
    addFor.children.push({
      id: uuid.v4(),
      ...data,
      method: action,
      url: addFor.exitUrl || addFor.url,
      children: []
    })
    
    window.electron.setFlow({
      actions,
      graph
    });
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    window.ipcRender.receive('action-finished', (id: string) => {
      d3.select(`#action-${id}`).attr('opacity', 1);
    });

    window.ipcRender.receive('run-completed', (id: string) => {
      svg.selectAll('.node').attr('opacity', 1);
    });

    svg.selectAll('*').remove();
    const temp = svg.append('g');
    let a = 0;
    const layout = flextree({
      children: (d: any) => d.children,
      nodeSize: (n: any) => {
        temp.selectAll('text').remove();
        const text = temp
          .append('text')
          .text((d: any) => getTitleFromNode(n))
          .style('font', font)
          // .attr('text-anchor', 'middle')
          .call(wrap, maxCellSize);
        const boundingBox = text.node().getBBox();
        const { width, height } = boundingBox;
        return [width + cellPadding * 2 + 30, height + cellPadding * 2 + 20];
      },
      spacing: (a: any, b: any) => 20,
    });

    const hier = {
      sequence_step: 'root',
      url: config ? config.rootUrl : '/',
      children: graph,
    };

    console.log(hier)

    const tree = layout.hierarchy(hier);

    layout(tree);

    tree.each((node: any) => {
      node.y += node.depth * verticalSpacing;
    });
    layout(tree);

    tree.each((node: any) => {
      node.y += node.depth * verticalSpacing;
    });

    const extents = tree.extents;

    const { top, bottom, left, right } = extents;

    const width = right - left + 2 * padding + 60;
    const height = bottom - top + 2 * padding;
    const transX = (width - 60) / 2;
    const g = svg
      .append('g')
      .attr('transform', `translate(${padding + transX} ${padding})`);

    const nodes = tree.descendants();
    const links = tree.links();

    var link = g.selectAll('path.link').data(links);

    const linkEnter = link
      .enter()
      .append('path')
      .attr('stroke', '#e2b862')
      .attr('d', (d: any) => {
        const { source, target } = d;

        return `M${source.x} ${source.y + source.ySize} L${target.x} ${
          target.y
        }`;
      });

    const node = g.selectAll('.node').data(nodes);

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('id', (d: any) => `action-${d.data.id}`)
      .attr('transform', (d: any) => `translate(${d.x - d.xSize / 2} ${d.y})`);

    nodeEnter
      .append('rect')
      .attr('width', (d: any) => d.xSize)
      .attr('height', (d: any) => d.ySize)
      .attr('fill', '#e9ddb7')
      .attr('stroke', '#e2b862')
      .attr('rx', 3)
      .attr('ry', 3);

    nodeEnter
      .append('circle')
      .attr('cx', (d: any) => d.xSize)
      .attr('cy', 13)
      .attr('r', 10)
      .attr('fill', '#1C9CEB')
      .attr('stroke', '#e2b862')
      .on('click', (e: any, d: any) => {
        if (d.data && d.data.id) {
          setImageId(d.data.id);
        }
      });

    nodeEnter
      .append('circle')
      .attr('cx', (d: any) => d.xSize)
      .attr('cy', 35)
      .attr('r', 10)
      .attr('fill', '#1C9CEB')
      .attr('stroke', '#e2b862')
      .on('click', (e: any, d: any) => {
        run(d);
      });

    nodeEnter
      .append('circle')
      .attr('cx', (d: any) => d.xSize / 2)
      .attr('cy', (d: any) => d.ySize)
      .attr('r', 10)
      .attr('fill', '#1C9CEB')
      .attr('stroke', '#e2b862')
      .on('click', (e: any, d: any) => {        
        console.log(d.data)
        setAddFor(d.data);        
      });

    nodeEnter
      .append('path')
      .attr('transform', (d: any) => `translate(${d.xSize - 7} 5)scale(0.6)`)
      .attr(
        'd',
        () =>
          'M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'
      )
      .attr('pointer-events', 'none');

    nodeEnter
      .append('path')
      .attr('transform', (d: any) => `translate(${d.xSize - 9} 25)scale(0.8)`)
      .attr('d', () => 'M8 5v14l11-7z')
      .attr('pointer-events', 'none');

    nodeEnter
      .append('path')
      .attr(
        'transform',
        (d: any) => `translate(${d.xSize / 2 - 10} ${d.ySize - 10})scale(0.8)`
      )

      .attr('d', () => 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');

    nodeEnter
      .append('text')
      .text((d: any) => getTitleFromNode(d))
      .style('font', font)
      .attr('x', (d: any) => d.xSize / 2)
      .attr('y', (d: any) => 17)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .call(wrap, maxCellSize);

    setSvgWidth(width);
    setSvgHeight(height);
  }, [graph, config]);

  return (
    <>
      <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>
      <Dialog open={imageId !== null} onClose={() => setImageId(null)}>
        {path && <img src={`file://${path}/screenshots/${imageId}.png`} />}
      </Dialog>
      {addFor && (
        <Dialog open={addFor} onClose={() => setAddFor(null)}>
          <DialogTitle>Add another action</DialogTitle>
          <DialogContent>
            <TextField
              label="Select Action"
              fullWidth={true}
              select
              value={action}
              onChange={(e) => prepareActionForm(e.target.value)}
            >
              {(actions[addFor.exitUrl || addFor.url] || []).map((action: any) => (
                <MenuItem key={action.method} value={action.method}>
                  {action.method}
                </MenuItem>
              ))}
            </TextField>
            {schema && (
              <SchemaForm
                schema={schema}
                wrapper={CustomWrapper as any}
                config={{ registry: CustomRegistry }}
                onSubmit={saveFlow}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default FlowComponent;
