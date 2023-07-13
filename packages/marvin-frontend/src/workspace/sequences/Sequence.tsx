import { MouseEventHandler } from 'react';
import { Models } from '@marvin/discovery';
import { Icon, Tag } from '@blueprintjs/core';
import { Block } from './Block';
import './SequencesPanel.scss';
export function SequencesBlock(props: {
  sequence: Models.SequenceItem;
  flow: Models.FlowModel;
  loadingIds: string[];
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
    loadingIds,
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
            <Block
              id={step}
              flow={flow}
              loading={loadingIds && loadingIds.indexOf(step) !== -1}
            />
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
