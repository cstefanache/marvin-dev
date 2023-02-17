import Structure from './structure';
import CypressCodeGenerator from './code';
import { FlowModel } from '../../../discovery/src/models/models';
import { Config } from '@marvin/discovery';

async function run() {
  const structure = new Structure();
  structure.generate();

  const code = new CypressCodeGenerator(structure.flow, structure.config);
  await code.generate();
}

run();
