import Structure from './structure';
import CypressCodeGenerator from './code';

async function run() {
  const structure = new Structure('./output');

  const code = new CypressCodeGenerator(structure.flow, structure.config);
  await code.generate();
}

run();
