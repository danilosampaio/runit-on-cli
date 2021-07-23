const [DEFAULT_EXPORTED] = require('[MODULE_NAME]');

async function runModule () {
    try {
        const output = await [FUNCTION_CALL]([PARAMETERS]);

        return output;
    } catch (error) {
        console.error(error);
    }
}

module.exports = runModule;