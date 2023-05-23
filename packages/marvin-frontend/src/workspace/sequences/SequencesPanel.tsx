import { DragLayout } from '../../components/DragLayout/DragLayout';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import { MouseEventHandler, ReactNode, useEffect, useState } from 'react';
import { Models } from '@marvin/discovery';
import {
  Button,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  NonIdealState,
  Tag,
  Alert,
  Intent,
  Dialog,
  DialogBody,
  DialogFooter,
} from '@blueprintjs/core';
import './SequencesPanel.scss';
import { FlowNavigator } from '../../components/FlowNavigator/FlowNavigator';
import Console from '../console/Console';
import { SchemaForm } from '@ascentcore/react-schema-form';
import {
  CustomRegistry,
  CustomWrapper,
} from '../../components/registry/Wrapper/Wrapper';

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
  sequence: Models.SequenceItem;
  flow: Models.FlowModel;
  deleteSequence: MouseEventHandler;
  addVariable: Function;
  deleteVariable: Function;
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
    <div className="sequences-wrapper">
      <div className="sequences-wrapper-controls">
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
            onClick={() => moveSequence(true)}
          />
        )}
        {!isLast && (
          <Icon
            icon="chevron-down"
            title="Move down"
            onClick={() => moveSequence(false)}
          />
        )}
        <span className="divider"></span>
        Variables
        <Icon
          icon="add"
          title="Add variable"
          onClick={() => props.addVariable()}
        />
        {(sequence.store || []).map((item, index) => (
          <span className="variable">
            <span className="variable-key">{item.key}</span> {item.value}
            <Icon
              icon="trash"
              size={12}
              onClick={() => props.deleteVariable(index)}
            />
          </span>
        ))}
      </div>
      <div className="sequences-block">
        {sequence.sequences.map((step, index) => (
          <>
            <Block id={step} flow={flow} />
            {index < sequence.sequences.length - 1 && (
              <span className="sequenceAction">
                <Icon icon="chevron-right" />
                <Icon icon="cut" onClick={() => cutAtIndex(index + 1)} />
              </span>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

const variableSchema = {
  type: 'object',
  properties: {
    key: {
      type: 'string',
      title: 'Key',
      pattern: '^[a-zA-Z_$][a-zA-Z_$0-9]*$',
    },
    value: {
      type: 'string',
      title: 'Value',
    },
  },
  required: ['key', 'value'],
};

export function SequencesPanel(props: SequencesPanelProps) {
  const { flow } = props;

  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(0);
  const [selectedBlock, setSelectedBlock] = useState<Models.Block>(null);
  const [blocks, setBlocks] = useState<Models.Block[]>(null);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [addVarToSeq, setAddVarToSeq] = useState<any>(null);
  const [mainLayoutHoriz, setMainLayoutHoriz] = useState<boolean>(false);
  const [isDefineNewOpen, setIsDefineNewOpen] = useState<boolean>(false);
  const [newSequenceName, setNewSequenceName] =
    useState<string>('New Sequence');
  const [deleteBlockIndex, setDeleteBlockIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteVarIndices, setDeleteVarIndices] = useState<any[] | null>(null);
  useEffect(() => {
    if (flow) {
      const { blocks } = flow;
      setBlocks(blocks);
      if (!blocks) {
        setBlocks([]);
        window.electron.setBlocks([]);
        setSelectedBlock({
          name: 'New Sequence Block',
          items: [],
        });
      } else {
        if (blocks.length === 0) {
          setSelectedBlock({
            name: 'New Sequence Block',
            items: [],
          });
        } else {
          setSelectedBlock(blocks[0]);
        }
      }
    }
  }, [flow]);

  const deleteSequence = (index: number) => {
    selectedBlock.items.splice(index, 1);
    setSelectedBlock({
      ...selectedBlock,
      items: [...selectedBlock.items],
    });
  };

  const save = () => {
    const blocks = [
      ...props.flow.blocks,
      {
        name: newSequenceName,
        items: [],
      },
    ];
    blocks[selectedBlockIndex] = selectedBlock;
    setBlocks(blocks);
    window.electron.setBlocks(blocks);
    setNewSequenceName(newSequenceName);
    setIsDefineNewOpen(false);
  };

  const deleteSequenceBlock = () => {
    const blocks = [...props.flow.blocks];
    blocks.splice(deleteBlockIndex, 1);
    setBlocks(blocks);
    window.electron.setBlocks(blocks);
    setDeleteBlockIndex(null);
    setSelectedBlock(null);
  };

  const moveSequence = (index: number, up: boolean) => {
    const items = [...selectedBlock.items];
    const sequence = items[index];
    items.splice(index, 1);
    items.splice(up ? index - 1 : index + 1, 0, sequence);
    setSelectedBlock({
      ...selectedBlock,
      items,
    });
  };

  const cutSequenceAtIndex = (sequenceIndex: number, index: number) => {
    const selectedItem = selectedBlock.items[sequenceIndex];
    const topCut = {
      store: [...selectedItem.store],
      sequences: [...selectedItem.sequences.slice(0, index)],
    };
    const bottomCut = {
      store: [...selectedItem.store],
      sequences: [...selectedItem.sequences.slice(index)],
    };

    selectedBlock.items.splice(sequenceIndex, 1, topCut, bottomCut);
    setSelectedBlock({
      ...selectedBlock,
      items: [...selectedBlock.items],
    });
  };

  const saveBlocks = () => {
    const blocks = [...props.flow.blocks];
    blocks[selectedBlockIndex] = selectedBlock;
    setBlocks(blocks);
    window.electron.setBlocks(blocks);
  };

  const deleteVariable = (itemIndex: number, varIndex: number) => {
    const variable = selectedBlock.items[itemIndex].store[varIndex];
    setDeleteVarIndices([variable.key, variable.value, itemIndex, varIndex]);
  };

  const confirmDeleteVariable = () => {
    const [key, value, itemIndex, varIndex] = deleteVarIndices;
    selectedBlock.items[itemIndex].store.splice(varIndex, 1);
    setSelectedBlock({
      ...selectedBlock,
      items: [...selectedBlock.items],
    });
    setDeleteVarIndices(null);
  };

  if (blocks) {
    return (
      <DragLayout
        orientation="horizontal"
        contextKey="methodPanelWidth"
        left={
          <TitlePanel
            title="Sequence"
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
                >
                  <MenuItem
                    text="Delete"
                    icon="trash"
                    onClick={() => setDeleteBlockIndex(blockIndex)}
                  />
                  <MenuItem
                    text="Run"
                    icon="play"
                    onClick={() => props.runSequence(block.items, true)}
                  />
                </MenuItem>
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
                        props.runSequence(selectedBlock.items, true)
                      }
                    />
                  </h4>
                  <div className="sequences-list">
                    {(selectedBlock.items || []).map((sequence, index) => (
                      <SequencesBlock
                        index={index}
                        isFirst={index === 0}
                        isLast={index === selectedBlock.items.length - 1}
                        deleteSequence={() => setDeleteIndex(index)}
                        moveSequence={(up) => moveSequence(index, up)}
                        cutAtIndex={(subIndex) =>
                          cutSequenceAtIndex(index, subIndex)
                        }
                        addVariable={() => {
                          setAddVarToSeq(sequence);
                        }}
                        deleteVariable={(varIndex) =>
                          deleteVariable(index, varIndex)
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
                            function addToSeq(
                              element: any,
                              sequence: Models.SequenceItem
                            ) {
                              const { currentNode, parentNode, skip } = element;
                              if (parentNode && parentNode.id > 0) {
                                addToSeq(parentNode, sequence);
                              }
                              sequence.sequences.push(currentNode.id);
                              return sequence;
                            }
                            const seq = { store: [], sequences: [] };
                            addToSeq(element, seq);
                            const sequences = [...selectedBlock.items];
                            sequences.push(seq);
                            setSelectedBlock({
                              ...selectedBlock,
                              items: sequences,
                            });
                            setIsAddOpen(false);
                          }}
                        />
                      )}
                    </DialogBody>
                  </Dialog>
                  <Dialog
                    title="Add Variable"
                    isOpen={addVarToSeq !== null}
                    onClose={() => setAddVarToSeq(null)}
                  >
                    <DialogBody>
                      <SchemaForm
                        className="variable-form"
                        wrapper={CustomWrapper as unknown as ReactNode}
                        config={{ registry: CustomRegistry }}
                        schema={variableSchema}
                        onSubmit={(data, err) => {
                          if (!err || err.length === 0) {
                            addVarToSeq.store.push(data);
                            setAddVarToSeq(null);
                          }
                        }}
                      />
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
                  <Alert
                    cancelButtonText="Cancel"
                    confirmButtonText="Delete"
                    icon="trash"
                    intent={Intent.DANGER}
                    isOpen={deleteBlockIndex !== null}
                    onCancel={() => setDeleteBlockIndex(null)}
                    onConfirm={() => {
                      deleteSequenceBlock();
                    }}
                  >
                    <p>Are you sure you want to delete this sequence block?</p>
                  </Alert>
                  <Alert
                    cancelButtonText="Cancel"
                    confirmButtonText="Delete"
                    icon="trash"
                    intent={Intent.DANGER}
                    isOpen={deleteVarIndices !== null}
                    onCancel={() => setDeleteVarIndices(null)}
                    onConfirm={() => confirmDeleteVariable()}
                  >
                    <p>
                      Are you sure you want to delete variable{' '}
                      <b>{deleteVarIndices ? deleteVarIndices[0] : ''}</b>{' '}
                      having value
                      {deleteVarIndices ? deleteVarIndices[1] : ''}?
                    </p>
                  </Alert>
                </>
              ) : (
                <NonIdealState icon="gantt-chart" title="No block selected" />
              )}
            </div>
          </DragLayout>
        </TitlePanel>
      </DragLayout>
    );
  } else {
    return <NonIdealState icon="gantt-chart" title="Malformed Workspace?" />;
  }
}
