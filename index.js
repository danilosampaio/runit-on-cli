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
    .option('-t, --transform-output [transformFunction]', 'define a function to modify module/function return')
    .option('-u, --sub-module [subModule]', 'import a submodule, such as "crypto-js/sha256"')

program.parse(process.argv);

const moduleName = program.args[0];
const namedExport = program.args[1];
const {
    silent,
    npmModuleVersion,
    functionName,
    params,
    callModuleAsFunction,
    subModule,
    transformOutput
} = program.opts();

const steps = {
    registry: 'Checking module on npm registry',
    install: 'Installing dependencies',
    run: `Running ${formatModuleNameAndVersion(moduleName, npmModuleVersion)}`,
    fail: `Fail running ${formatModuleNameAndVersion(moduleName, npmModuleVersion)}`
};

if (!moduleName) {
    console.error('the module name is required. \n$ runit-on-cli <module-name>');
    return;
}

let spinner;

if(!silent) {
    spinner = ora(steps.registry).start();
}

if (!moduleIsValid(moduleName)) {
    if(!silent) {
        spinner.fail(`NPM module ${moduleName} is invalid.`);
    }
    return;
}

if(!silent) {
    spinner.succeed(steps.registry);
}

(async () => {
    createModuleConfig(moduleName, npmModuleVersion);

    await createModuleDir(moduleName);
    initModule(moduleName);
    if(!silent) {
        spinner.start(steps.install);
    }
    installDeps(moduleName);
    if(!silent) {
        spinner.succeed(steps.install);
    }
    await createIndex(
        moduleName,
        namedExport,
        functionName,
        params,
        callModuleAsFunction,
        subModule,
        transformOutput
    );

    if(!silent) {
        spinner.start(steps.run);
    }
    
    try {
        const result = await runModule(moduleName);
        if(!silent) {
            spinner.succeed(steps.run);
            console.log('\n===== Result =====');
            console.log(result);
            console.log('==================\n');
        } else {
            console.log(result);
        }
    } catch (error) {
        if(!silent) {
            spinner.fail(steps.fail);
            console.log(error);
        } else {
            console.log(error);
        }
    }
})();
