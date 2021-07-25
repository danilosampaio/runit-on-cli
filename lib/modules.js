const path = require('path');
const { mkdir, stat, readFile, writeFile } = require('fs/promises');
const homedir = require('os').homedir();
const shell = require('shelljs');
const Configstore = require('configstore');
const configInstance = new Configstore('runit-on-cli');

function moduleIsValid (name) {
    const current = configInstance.get(name);
    
    if (current && current.installed) {
        return true;
    }

    const { code } = shell.exec(`npm view ${name}`, {
        silent: true,
        fatal: true
    });
    return code === 0;
}

function createModuleConfig (moduleName, npmModuleVersion) {
    if (!configInstance.get(moduleName)) {
        configInstance.set(moduleName, {
            version: npmModuleVersion || 'latest'
        });
    }
}

function getModuleDir (moduleName) {
    return path.join(homedir, '.runit-on-cli', `${moduleName}-cli`);
}

async function createModuleDir (moduleName) {
    const dir = getModuleDir(moduleName);
    try {
        await stat(dir);
    } catch (error) {
        await mkdir(dir, { recursive: true });
    }
}

function initModule (moduleName) {
    const dir = getModuleDir(moduleName);
    shell.cd(dir);
    const { code } = shell.exec(`npm init -y`, { silent: true });
    return code === 0;
}

function installDeps (moduleName) {
    const current = configInstance.get(moduleName);
    
    if (current.installed) {
        return true;
    }

    const dir = getModuleDir(moduleName);
    shell.cd(dir);
    const { code } = shell.exec(`npm install ${moduleName}`, { silent: true });

    if (code === 0) {
        configInstance.set(moduleName, {
            ...current,
            installed: true
        });
    }
    return code === 0;
}

function parseFunctionCall (moduleName, namedExport, functionName, callModuleAsFunction) {
    let functionCall;
    const functionSufix = callModuleAsFunction ? '()' : '';

    if (namedExport) {
        if (functionName) {
            functionCall = `${namedExport}${functionSufix}.${functionName}`
        } else {
            functionCall = `${namedExport}${functionSufix}`;
        }
    } else {
        const validVarName = moduleName
            .replace(/-/g, '_')
            .replace(/@/g, '_')
            .replace(/\./g, '_');

        if (functionName) {
            functionCall = `${validVarName}${functionSufix}.${functionName}`;
        } else {
            functionCall = `${validVarName}${functionSufix}`;
        }
    }

    return functionCall;
}

async function createIndex (
    moduleName,
    namedExport,
    functionName,
    params,
    callModuleAsFunction,
    subModule,
    transformOutput
) {
    const template = await readFile(path.join(__dirname, 'defaultTemplate.js'), { encoding: 'utf-8'});

    const exportName = namedExport ? `{${ namedExport }}` : moduleName.replace(/-/g, '_').replace(/@/g, '_').replace(/\./g, '_');
    const functionCall = parseFunctionCall(moduleName, namedExport, functionName, callModuleAsFunction);
    const moduleImport = subModule ? `${moduleName}/${subModule}` : moduleName;
    
    const indexContent = template
        .replace(/\[DEFAULT_EXPORTED\]/g, exportName)
        .replace(/\[FUNCTION_CALL\]/g, functionCall)
        .replace(/\[MODULE_NAME\]/g, moduleImport)
        .replace(/\[PARAMETERS\]/g, params ? params : '')
        .replace(/\[TRANSFORM_OUTPUT\]/g, transformOutput ? transformOutput : 'output');

    const dir = getModuleDir(moduleName);
    shell.cd(dir);

    await writeFile(path.join(dir, 'index.js'), indexContent);
}

async function runModule (moduleName) {
    const dir = getModuleDir(moduleName);
    shell.cd(dir);
    
    const runTemplate = require(dir);
    
    try {
        return await runTemplate();
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    moduleIsValid,
    createModuleConfig,
    getModuleDir,
    createModuleDir,
    initModule,
    installDeps,
    createIndex,
    runModule
}