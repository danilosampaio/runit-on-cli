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

program.version('1.0.7');

program
    .option('-c, --call-module-as-function', 'call the exported module as a function intead of object')
    .option('-f, --function-name [functionName]', 'call a specific function from exported module')
    .option('-n, --npm-module-version [version]', 'run a specific version of the npm module')
    .option('-p, --params [parameters...]', 'list of params that will be passed to the module/function call')
    .option('-s, --silent', 'print only the module output, without progress or logs')
    .option('-u, --sub-module [subModule]', 'import a submodule, such as "crypto-js/sha256"')

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
    await createIndex(moduleName, namedExport, program.opts().functionName, program.opts().params, program.opts().callModuleAsFunction, program.opts().subModule);
    if(!program.opts().silent) {
        spinner.start(steps.run);
    }
    
    try {
        const result = await runModule(moduleName, program.opts().silent);
        if(!program.opts().silent) {
            spinner.succeed(steps.run);
            console.log('\n===== Result =====');
            console.log(result);
            console.log('==================\n');
        } else {
            console.log(result);
        }
    } catch (error) {
        if(!program.opts().silent) {
            spinner.fail(steps.fail);
            console.log(error);
        } else {
            console.log(error);
        }
    }
})();
