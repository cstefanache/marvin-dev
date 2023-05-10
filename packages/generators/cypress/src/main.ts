import Structure from './structure';
import CypressCodeGenerator from './code';

async function run() {
  const structure = new Structure('./tmp/care-to-pets-dev', true);

  const code = new CypressCodeGenerator(structure.flow, structure.config, './tmp/care-to-pets-e2e');
  await code.generate();
}

run();
