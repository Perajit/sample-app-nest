const { execSync } = require('child_process');

const args = process.argv.slice(2); 
const migrationCommand = args[0];
const migrationName = args[1];
const migrationsPath = 'src/database/migrations';
const dataSourcePath = 'dist/database/data-source.js';
const buildCommand = 'npm run build';

try {
  switch (migrationCommand) {
    case 'create':
      if (!migrationName) {
        throw Error('Missing migration name for "create".');
      }
  
      const createPath = `${migrationsPath}/${migrationName}`;
      execSync(`typeorm migration:create ${createPath}`, { stdio: 'inherit' });
      break;
  
    case 'generate':
      if (!migrationName) {
        throw Error('Missing migration name for "generate".');
      }
  
      const generatePath = `${migrationsPath}/${migrationName}`;
      execSync(`${buildCommand} && typeorm migration:generate ${generatePath} -d ${dataSourcePath}`, { stdio: 'inherit' });
      break;
  
    case 'run':
      execSync(`${buildCommand} && typeorm migration:run -d ${dataSourcePath}`, { stdio: 'inherit' });
      break;
  
    case 'revert':
      execSync(`${buildCommand} && typeorm migration:revert -d ${dataSourcePath}`, { stdio: 'inherit' });
      break;
  
    default:
      throw Error(`Unknown command: ${migrationCommand}. Use 'create <name>', 'generate <name>', 'run', or 'revert'.`);
  }
} catch(error) {
  console.error(error);
  process.exit(1);
}
