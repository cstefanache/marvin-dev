import { DragLayout } from '../../components/DragLayout/DragLayout';
import { TitlePanel } from '../../components/TitlePanel/TitlePanel';
import {
  MouseEventHandler,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
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

import { SequencesBlock } from './Sequence';
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
  running: boolean;
  config: any;
  runSequence: Function;
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
  const { flow, config } = props;

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
  const [filter, setFilter] = useState<string>('');

  const [loadingIds, setLoadingIds] = useState<string[][]>([]);

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

    window.ipcRender.receive('action-finished', (id: string) => {
      setLoadingIds((loadingIds: any) => {
        for (let i = 0; i < loadingIds.length; i++) {
          const index = loadingIds[i].indexOf(id);
          if (index !== -1) {
            loadingIds[i].splice(index, 1);
            break;
          }
        }
        return [...loadingIds];
      });
    });

    window.ipcRender.receive('run-completed', async (id: string) => {
      setLoadingIds([]);
    });
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

  const filteredData = useMemo(() => {
    return filter && blocks
      ? blocks?.filter(
          (v) =>
            !filter || v.name?.toLowerCase().indexOf(filter.toLowerCase()) > -1
        )
      : blocks;
  }, [blocks, filter]);

  const runSequence = (sequence: any, flag: boolean) => {
    const loadingIdsLocal = sequence.reduce((memo, item: any) => {
      memo.push([...item.sequences]);
      return memo;
    }, []);

    setLoadingIds(loadingIdsLocal);
    props.runSequence(sequence, flag);
  };

  if (filteredData) {
    return (
      <DragLayout
        orientation="horizontal"
        contextKey="methodPanelWidth"
        left={
          <TitlePanel
            title="Sequences"
            suffix={[
              <Icon icon="add" onClick={() => setIsDefineNewOpen(true)} />,
            ]}
          >
            <div>
              <InputGroup
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name"
                rightElement={
                  <Button
                    icon="delete"
                    minimal={true}
                    onClick={() => {
                      setFilter('');
                    }}
                  />
                }
              />
              <Menu>
                {filteredData.map((block, blockIndex) => (
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
                      onClick={() => runSequence(block.items, true)}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </div>
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
                      disabled={loadingIds.length > 0}
                      minimal
                      onClick={() => runSequence(selectedBlock.items, true)}
                    />
                  </h4>
                  <div className="sequences-list">
                    {(selectedBlock.items || []).map((sequence, index) => (
                      <SequencesBlock
                        index={index}
                        loadingIds={loadingIds[index]}
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
                    canOutsideClickClose={false}
                    canEscapeKeyClose={false}
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
                            const seq = {
                              store:
                                selectedBlock.items.length === 0
                                  ? config.aliases.store
                                  : [],
                              sequences: [],
                            };
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
