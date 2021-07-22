#!/usr/bin/env node

const { program } = require('commander');
const { formatModuleNameAndVersion } = require('./lib/utils');
const {
    moduleIsValid,
    createModuleConfig,
    createModuleDir,
    initModule,
    installDeps,
    createIndex,
    runModule
} = require('./lib/modules');

program.version('1.0.0');

program
    .option('-n, --npm-module-version [version]', 'npm module version')
    .option('-p, --params [parameters...]', 'function params')

program.parse(process.argv);

const moduleName = program.args[0];
const namedExport = program.args[1];

if (!moduleIsValid(moduleName)) {
    console.error(`NPM module ${moduleName} is invalid.`);
    return;
}

createModuleConfig(moduleName, program.opts().npmModuleVersion);

console.log(`Running ${formatModuleNameAndVersion(moduleName, program.opts())}`);

(async () => {
    await createModuleDir(moduleName);
    initModule(moduleName);
    installDeps(moduleName);
    await createIndex(moduleName, namedExport, program.opts().params);
    runModule(moduleName);
})();
