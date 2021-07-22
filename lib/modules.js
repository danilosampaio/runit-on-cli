const path = require('path');
const { mkdir, stat, readFile, writeFile } = require('fs/promises');
const homedir = require('os').homedir();
const shell = require('shelljs');
const Configstore = require('configstore');
const configInstance = new Configstore('runit-on-cli');

function moduleIsValid (name) {
    const { code } = shell.exec(`npm view ${name}`, { silent: true });
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

async function createIndex (moduleName, namedExport, params) {
    const template = await readFile(path.join(__dirname, 'defaultTemplate.js'), { encoding: 'utf-8'});

    const exportName = namedExport ? `{${ namedExport }}` : moduleName.replace(/-/g, '_').replace(/@/g, '_');
    const functionCall = namedExport ? namedExport : moduleName.replace(/-/g, '_').replace(/@/g, '_');
    
    const indexContent = template
        .replace(/\[DEFAULT_EXPORTED\]/g, exportName)
        .replace(/\[FUNCTION_CALL\]/g, functionCall)
        .replace(/\[MODULE_NAME\]/g, moduleName)
        .replace(/\[PARAMETERS\]/g, params ? params : '');

    const dir = getModuleDir(moduleName);
    shell.cd(dir);

    await writeFile(path.join(dir, 'index.js'), indexContent);
}

function runModule (moduleName) {
    const dir = getModuleDir(moduleName);
    shell.cd(dir);
    console.log('\n=== Result ===');
    return shell.exec('node index.js').code === 0;
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