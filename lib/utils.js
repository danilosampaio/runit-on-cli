function formatModuleNameAndVersion (moduleName, npmModuleVersion) {
    return moduleName + (npmModuleVersion ? ' (' + npmModuleVersion + ')' : '');
}

module.exports = {
    formatModuleNameAndVersion
}