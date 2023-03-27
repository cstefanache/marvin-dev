import { DragLayout } from '../../components/DragLayout/DragLayout';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import { useContext, useEffect, useState } from 'react';
import { Models } from '@marvin/discovery';
import {
  Button,
  FormGroup,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  NonIdealState,
  Tab,
  Tag,
  Tabs,
} from '@blueprintjs/core';
import './SequencesPanel.scss';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { getIcon } from '../../utils';

export interface TreeItem {
  id: number;
  name: string;
  currentNode: Models.ActionItem;
  parentNode: TreeItem | undefined;
}

export interface SequencesPanelProps {
  flow: Models.FlowModel;
  runSequence: Function;
}

function Block(props: { id: string; flow: Models.FlowModel }) {
  const [actionItem, setActionItem] = useState<Models.ActionItem>(null);
  useEffect(() => {
    function findActionItemById(
      id: string,
      parent: Models.ActionItem[]
    ): Models.ActionItem {
      for (let i = 0; i < parent.length; i++) {
        const item = parent[i];
        if (item.id === id) {
          return item;
        } else if (item.children) {
          const child = findActionItemById(id, item.children);
          if (child) {
            return child;
          }
        }
      }
    }

    setActionItem(findActionItemById(props.id, props.flow.graph));
  }, [props.id]);

  if (actionItem) {
    return (
      <Tag icon="flow-linear" intent="primary">
        {actionItem.sequenceStep}
      </Tag>
    );
  } else {
    return <Tag icon="error">{props.id} missing</Tag>;
  }
}

function SequencesBlock(props: {
  sequence: string[];
  flow: Models.FlowModel;
}) {
  return (
    <div className="sequences-block">
      {/* <Icon
        icon="trash"
        title="Delete from sequence"
        onClick={props.deleteBlock}
      /> */}
      {props.sequence.map((step, index) => (
        <>
          <Block id={step} flow={props.flow} />
          {index < props.sequence.length - 1 && <Icon icon="chevron-right" />}
        </>
      ))}
    </div>
  );
}

export function SequencesPanel(props: SequencesPanelProps) {
  const { flow } = props;

  const workspaceContext = useContext(WorkspaceContext);

  const [selectedBlock, setSelectedBlock] = useState<Models.Block>(null);
  const [blocks, setBlocks] = useState<Models.Block[]>(null);
  useEffect(() => {
    if (flow) {
      const { blocks } = flow;
      setBlocks(blocks);
      if (blocks.length) {
        setSelectedBlock(blocks[0]);
      }
    }
  }, [flow]);

  

  function moveBlock(sequence: string[], up: boolean) {
    const newBlocks = blocks.map((block) => {
      return {
        ...block,
        sequences: block.sequences.map((seq) => {
          if (seq === sequence) {
            const index = block.sequences.indexOf(seq);
            if (index > 0) {
              const inc = up ? -1 : 1;
              const newSeq = block.sequences[index - inc];
              block.sequences[index - inc] = seq;
              block.sequences[index] = newSeq;
            }
          }
          return seq;
        }),
      };
    });
    setBlocks(newBlocks);
  }

  if (blocks) {
    return (
      <DragLayout
        orientation="horizontal"
        contextKey="methodPanelWidth"
        left={
          <TitlePanel title="Method">
            <Menu>
              {blocks.map((block) => (
                <MenuItem
                  title={block.name}
                  text={block.name}
                  icon="gantt-chart"
                />
              ))}
            </Menu>
          </TitlePanel>
        }
        defaultSize={350}
        minSize={350}
      >
        <TitlePanel title="Sequences">
          <div className="sequences">
            {selectedBlock ? (
              <>
                <h4 className="bp4-heading">
                  {selectedBlock.name}
                  <Button
                    icon="play"
                    minimal
                    onClick={() => props.runSequence(selectedBlock.sequences)}
                  />
                </h4>
                <div className="sequences-list">
                  {selectedBlock.sequences.map((sequence, index) => (
                    <SequencesBlock
                      key={index}
                      sequence={sequence}
                      flow={flow}
                    />
                  ))}
                </div>
              </>
            ) : (
              <NonIdealState icon="gantt-chart" title="No block selected" />
            )}
          </div>
        </TitlePanel>
      </DragLayout>
    );
  } else {
    return <NonIdealState icon="gantt-chart" title="Malformed Workspace?" />;
  }
}
