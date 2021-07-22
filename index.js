#!/usr/bin/env node

const { program } = require('commander');
const ora = require('ora');
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
const steps = {
    registry: 'Checking module on npm registry',
    install: 'Intalling dependencies',
    run: `Running ${formatModuleNameAndVersion(moduleName, program.opts())}`
};

const spinner = ora(steps.registry).start();

if (!moduleIsValid(moduleName)) {
    console.error(`NPM module ${moduleName} is invalid.`);
    spinner.fail(steps.registry);
    return;
}

spinner.succeed(steps.registry);

createModuleConfig(moduleName, program.opts().npmModuleVersion);

(async () => {
    await createModuleDir(moduleName);
    initModule(moduleName);
    spinner.start(steps.install);
    installDeps(moduleName);
    spinner.succeed(steps.install);
    await createIndex(moduleName, namedExport, program.opts().params);
    spinner.start(steps.run);
    const success = runModule(moduleName);
    if (success) {
        spinner.succeed(steps.run);
    }
})();
