function formatModuleNameAndVersion (moduleName, cliOptions) {
    return moduleName + (cliOptions.npmModuleVersion ? ' (' + cliOptions.npmModuleVersion + ')' : '');
}

module.exports = {
    formatModuleNameAndVersion
}