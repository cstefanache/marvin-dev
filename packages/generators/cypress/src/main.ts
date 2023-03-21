import Structure from './structure';
import CypressCodeGenerator from './code';

async function run() {
  const structure = new Structure('./tmp/LocalTriblio');

  const code = new CypressCodeGenerator(structure.flow, structure.config, 'packages/sample-frontend-e2e/src');
  await code.generate();
}

run();
