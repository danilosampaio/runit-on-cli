const [DEFAULT_EXPORTED] = require('[MODULE_NAME]');

async function TRANSFORM_OUTPUT_FUNCTION (output) {
    return [TRANSFORM_OUTPUT];
}

async function runModule () {
    try {
        const output = await [FUNCTION_CALL]([PARAMETERS]);
        return TRANSFORM_OUTPUT_FUNCTION(output);
    } catch (error) {
        console.error(error);
    }
}

module.exports = runModule;