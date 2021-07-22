const [DEFAULT_EXPORTED] = require('[MODULE_NAME]');

(async () => {
    try {
        const output = await [FUNCTION_CALL]([PARAMETERS]);

        console.log(output);
    } catch (error) {
        console.log(error);
    }
})();
