"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const discord_js_1 = require("discord.js");
const events_module_1 = require("./events/events.module");
let logger;
function setupLogger() {
    log4js.configure('log4js.json');
    logger = log4js.getLogger('INIT');
}
async function setupDiscord() {
    const client = new discord_js_1.Client();
    client.on('ready', () => {
        var _a;
        logger.info(`Logged in as ${((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag) || 'Unknown'}!`);
    });
    client.on('error', (error) => {
        logger.error(error);
    });
    logger.info('Logging in to Discord...');
    await client.login(process.env.DISCORD_TOKEN);
    return client;
}
function setupEventsModule(client) {
    const eventsModule = new events_module_1.EventsModule(client);
    eventsModule.initialize();
}
(async () => {
    setupLogger();
    try {
        const client = await setupDiscord();
        await setupEventsModule(client);
    }
    catch (e) {
        logger.fatal(e);
        process.exit(1);
    }
})();
