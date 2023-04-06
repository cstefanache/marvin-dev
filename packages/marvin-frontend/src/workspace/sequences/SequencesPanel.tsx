import { DragLayout } from '../../components/DragLayout/DragLayout';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import { MouseEventHandler, useContext, useEffect, useState } from 'react';
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
  Alert,
  Intent,
  Divider,
  Dialog,
  DialogBody,
  DialogFooter,
} from '@blueprintjs/core';
import './SequencesPanel.scss';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { getIcon } from '../../utils';
import { FlowNavigator } from '../../components/FlowNavigator/FlowNavigator';
import Console from '../console/Console';

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
  deleteSequence: MouseEventHandler;
  moveSequence: Function;
  cutAtIndex: Function;
  isFirst: boolean;
  isLast: boolean;
  index: number;
}) {
  const {
    sequence,
    isFirst,
    isLast,
    deleteSequence,
    cutAtIndex,
    moveSequence,
    flow,
    index,
  } = props;

  return (
    <div className="sequences-block">
      <Tag className="bp4-round" intent="primary">
        {index + 1}
      </Tag>
      <Icon
        icon="trash"
        title="Delete from sequence"
        onClick={deleteSequence}
      />
      {!isFirst && (
        <Icon
          icon="chevron-up"
          title="Move up"
          onClick={() => moveSequence(index, true)}
        />
      )}
      {!isLast && (
        <Icon
          icon="chevron-down"
          title="Move down"
          onClick={() => moveSequence(index, false)}
        />
      )}
      {sequence.map((step, index) => (
        <>
          <Block id={step} flow={flow} />
          {index < sequence.length - 1 && (
            <span className="sequenceAction">
              <Icon icon="chevron-right" />
              <Icon icon="cut" onClick={() => cutAtIndex(index + 1)} />
            </span>
          )}
        </>
      ))}
    </div>
  );
}

export function SequencesPanel(props: SequencesPanelProps) {
  const { flow } = props;

  // const workspaceContext = useContext(WorkspaceContext);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(0);
  const [selectedBlock, setSelectedBlock] = useState<Models.Block>(null);
  const [blocks, setBlocks] = useState<Models.Block[]>(null);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [mainLayoutHoriz, setMainLayoutHoriz] = useState<boolean>(false);
  const [isDefineNewOpen, setIsDefineNewOpen] = useState<boolean>(false);
  const [newSequenceName, setNewSequenceName] =
    useState<string>('New Sequence');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  useEffect(() => {
    if (flow) {
      const { blocks } = flow;
      setBlocks(blocks);
      if (!blocks) {
        setBlocks([]);
        window.electron.setBlocks([]);
        setSelectedBlock({
          name: 'New Sequence Block',
          sequences: [[]],
        });
      } else {
        if (blocks.length === 0) {
          setSelectedBlock({
            name: 'New Sequence Block',
            sequences: [],
          });
        } else {
          setSelectedBlock(blocks[0]);
        }
      }
    }
  }, [flow]);

  const deleteSequence = (index: number) => {
    selectedBlock.sequences.splice(index, 1);
    setSelectedBlock({
      ...selectedBlock,
      sequences: [...selectedBlock.sequences],
    });
  };

  const save = () => {
    const blocks = [
      ...props.flow.blocks,
      {
        name: newSequenceName,
        sequences: [],
      },
    ];
    blocks[selectedBlockIndex] = selectedBlock;
    setBlocks(blocks);
    window.electron.setBlocks(blocks);

    setNewSequenceName('New Sequence');
    setIsDefineNewOpen(false);
  };

  const moveSequence = (index: number, up: boolean) => {
    const sequences = [...selectedBlock.sequences];
    const sequence = sequences[index];
    sequences.splice(index, 1);
    sequences.splice(up ? index - 1 : index + 1, 0, sequence);
    setSelectedBlock({
      ...selectedBlock,
      sequences,
    });
  };

  const cutSequenceAtIndex = (sequenceIndex: number, index: number) => {
    const sequences = [...selectedBlock.sequences];
    const previous = sequences[sequenceIndex];
    const first = previous.slice(0, index);
    const second = previous.slice(index);
    sequences[sequenceIndex] = first;
    sequences.splice(sequenceIndex + 1, 0, second);
    // sequences[sequenceIndex] = sequences[sequenceIndex].slice(index);
    setSelectedBlock({
      ...selectedBlock,
      sequences,
    });
  };

  const saveBlocks = () => {
    const blocks = [...props.flow.blocks];
    blocks[selectedBlockIndex] = selectedBlock;
    setBlocks(blocks);
    window.electron.setBlocks(blocks);
  };

  if (blocks) {
    return (
      <span>
        <DragLayout
          orientation="horizontal"
          contextKey="methodPanelWidth"
          left={
            <TitlePanel
              title="Method"
              suffix={[
                <Icon icon="add" onClick={() => setIsDefineNewOpen(true)} />,
              ]}
            >
              <Menu>
                {blocks.map((block, blockIndex) => (
                  <MenuItem
                    title={block.name}
                    text={block.name}
                    icon="gantt-chart"
                    onClick={() => {
                      setSelectedBlockIndex(blockIndex);
                      setSelectedBlock(block);
                    }}
                  />
                ))}
              </Menu>
            </TitlePanel>
          }
          defaultSize={350}
          minSize={350}
        >
          <TitlePanel title="Sequences">
            <DragLayout
              orientation={mainLayoutHoriz ? 'horizontal-reversed' : 'vertical'}
              contextKey={
                mainLayoutHoriz ? 'consolePanelHeight' : 'consolePanelWidth'
              }
              defaultSize={200}
              minSize={20}
              left={
                <Console
                  mainLayoutHoriz={mainLayoutHoriz}
                  setMainLayoutHoriz={setMainLayoutHoriz}
                />
              }
            >
              <div className="sequences">
                {selectedBlock ? (
                  <>
                    <h4 className="bp4-heading">
                      <InputGroup
                        value={selectedBlock.name}
                        fill={false}
                        large={false}
                        onChange={(evt) =>
                          setSelectedBlock({
                            ...selectedBlock,
                            name: evt.target.value,
                          })
                        }
                      />
                      <Button icon="floppy-disk" minimal onClick={saveBlocks} />
                      <Button
                        icon="play"
                        minimal
                        onClick={() =>
                          props.runSequence(selectedBlock.sequences)
                        }
                      />
                    </h4>
                    <div className="sequences-list">
                      {selectedBlock.sequences.map((sequence, index) => (
                        <SequencesBlock
                          index={index}
                          isFirst={index === 0}
                          isLast={index === selectedBlock.sequences.length - 1}
                          deleteSequence={() => setDeleteIndex(index)}
                          moveSequence={(up) => moveSequence(index, up)}
                          cutAtIndex={(subIndex) =>
                            cutSequenceAtIndex(index, subIndex)
                          }
                          key={index}
                          sequence={sequence}
                          flow={flow}
                        />
                      ))}
                      <Button fill={true} onClick={() => setIsAddOpen(true)}>
                        Add new sequence
                      </Button>
                    </div>
                  </>
                ) : (
                  <NonIdealState icon="gantt-chart" title="No block selected" />
                )}
              </div>
            </DragLayout>
          </TitlePanel>
        </DragLayout>
        <Dialog
          title="Define new sequence"
          isOpen={isDefineNewOpen}
          onClose={() => setIsDefineNewOpen(false)}
        >
          <DialogBody>
            <InputGroup
              placeholder="Enter Name"
              value={newSequenceName}
              onChange={(evt) => {
                setNewSequenceName(evt.target.value);
              }}
            />
          </DialogBody>
          <DialogFooter
            actions={
              <>
                <Button
                  onClick={() => {
                    setNewSequenceName('New Sequence');
                    setIsDefineNewOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button intent="primary" onClick={save}>
                  Save
                </Button>
              </>
            }
          ></DialogFooter>
        </Dialog>
        <Dialog
          title="Add Sequence"
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
        >
          <DialogBody>
            {props.flow && (
              <FlowNavigator
                graph={props.flow.graph}
                subIds={[]}
                autoExpand={true}
                loadingIds={[]}
                onSelect={(element) => {
                  function addToSeq(element: any, sequence: string[]) {
                    const { currentNode, parentNode, skip } = element;

                    if (parentNode && parentNode.id > 0) {
                      addToSeq(parentNode, sequence);
                    }

                    sequence.push(currentNode.id);
                    return sequence;
                  }

                  const seq = [];
                  addToSeq(element, seq);
                  const sequences = [...selectedBlock.sequences];
                  sequences.push(seq);
                  setSelectedBlock({
                    ...selectedBlock,
                    sequences,
                  });
                  setIsAddOpen(false);
                }}
              />
            )}
          </DialogBody>
        </Dialog>
        <Alert
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          icon="trash"
          intent={Intent.DANGER}
          isOpen={deleteIndex !== null}
          onCancel={() => setDeleteIndex(null)}
          onConfirm={() => {
            deleteSequence(deleteIndex);
            setDeleteIndex(null);
          }}
        >
          <p>Are you sure you want to delete this sequence?</p>
        </Alert>
      </span>
    );
  } else {
    return <NonIdealState icon="gantt-chart" title="Malformed Workspace?" />;
  }
}
