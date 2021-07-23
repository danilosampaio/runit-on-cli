const path = require('path');
const { stat, readFile } = require('fs/promises');
const Configstore = require('configstore');
const configInstance = new Configstore('runit-on-cli');

const { 
    createIndex,
    createModuleConfig,
    createModuleDir,
    getModuleDir,
    initModule,
    installDeps,
    moduleIsValid,
    runModule
} = require('./lib/modules');

const { formatModuleNameAndVersion } = require('./lib/utils');

test('moduleIsValid', () => {
    expect(moduleIsValid('greedy-wrap')).toBe(true);
    expect(moduleIsValid('invalidModuloNameThatNotExists')).toBe(false);
});

test('createModuleConfig', () => {
    createModuleConfig('greedy-wrap');
    expect(configInstance.get('greedy-wrap').version).toBe('latest');
});

test('formatModuleNameAndVersion', () => {
    expect(formatModuleNameAndVersion('greedy-wrap', {})).toBe('greedy-wrap');
    expect(formatModuleNameAndVersion('greedy-wrap', { npmModuleVersion: '1.0.0' })).toBe('greedy-wrap (1.0.0)');
});

test('createModuleDir', async () => {
    await createModuleDir('greedy-wrap');
    const dir = getModuleDir('greedy-wrap');
    expect(await stat(dir)).not.toBeNull();
});

test('initModule', async () => {
    initModule('greedy-wrap');
    const dir = getModuleDir('greedy-wrap');
    expect(await stat(path.join(dir, 'package.json'))).not.toBeNull();
});

test('installDeps', async () => {
    installDeps('greedy-wrap');
    const config = configInstance.get('greedy-wrap');
    expect(config.installed).toBe(true);
});

test('createIndex', async () => {
    await createIndex('greedy-wrap', null, null, ['\'abc\'']);
    const indexContent = await readFile(path.join(getModuleDir('greedy-wrap'), 'index.js'), { encoding: 'utf-8'})
    expect(indexContent.indexOf('greedy_wrap(\'abc\')')).not.toBe(-1);
});

test('runModule', async () => {
    const success = await runModule('greedy-wrap', true);
    expect(success).toBe('abc');
});
