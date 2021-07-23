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

program.version('1.0.3');

program
    .option('-n, --npm-module-version [version]', 'npm module version')
    .option('-s, --silent', 'print only the module output, withou progress or logs')
    .option('-e, --call-module-as-function', 'call the exported module as a function intead of object')
    .option('-f, --function-name [functionName]', 'call a specific function from exported module')
    .option('-p, --params [parameters...]', 'function params')

program.parse(process.argv);

const moduleName = program.args[0];
const namedExport = program.args[1];
const steps = {
    registry: 'Checking module on npm registry',
    install: 'Intalling dependencies',
    run: `Running ${formatModuleNameAndVersion(moduleName, program.opts())}`,
    fail: `Fail running ${formatModuleNameAndVersion(moduleName, program.opts())}`
};

if (!moduleName) {
    console.error('the module name is required. \n$ runit-on-cli <module-name>');
    return;
}

let spinner;

if(!program.opts().silent) {
    spinner = ora(steps.registry).start();
}

if (!moduleIsValid(moduleName)) {
    if(!program.opts().silent) {
        spinner.fail(`NPM module ${moduleName} is invalid.`);
    }
    return;
}

if(!program.opts().silent) {
    spinner.succeed(steps.registry);
}

(async () => {
    createModuleConfig(moduleName, program.opts().npmModuleVersion);

    await createModuleDir(moduleName);
    initModule(moduleName);
    if(!program.opts().silent) {
        spinner.start(steps.install);
    }
    installDeps(moduleName);
    if(!program.opts().silent) {
        spinner.succeed(steps.install);
    }
    await createIndex(moduleName, namedExport, program.opts().functionName, program.opts().params, program.opts().callModuleAsFunction);
    if(!program.opts().silent) {
        spinner.start(steps.run);
    }
    
    try {
        const result = await runModule(moduleName, program.opts().silent);
        if(!program.opts().silent) {
            spinner.succeed(steps.run);
            console.log('\n\n===== Result =====');
            console.log(result);
            console.log('==================\n');
        }
    } catch (error) {
        if(!program.opts().silent) {
            spinner.fail(steps.fail);
            console.log(error);
        }
    }
})();
