"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const cron_1 = require("cron");
const log4js_1 = require("log4js");
const format_1 = require("../utils/format");
const path_1 = require("path");
const logger = log4js_1.getLogger('EVENTS');
class EventsModule {
    constructor(client) {
        this.client = client;
    }
    initialize() {
        for (const [index, event] of EventsModule.events.entries()) {
            for (const minutes of event.notify) {
                const pattern = format_1.Format.addMinutesToPattern(event.pattern, -minutes);
                new cron_1.CronJob(pattern, async () => {
                    let message;
                    if (minutes === 0) {
                        const nextEvent = EventsModule.events[index === EventsModule.events.length - 1 ? 0 : index + 1];
                        message = `${EventsModule.getCurrentBossText(event.name)}. ${EventsModule.getNextBossText(nextEvent.pattern, nextEvent.name)}`;
                    }
                    else {
                        message = EventsModule.getFullText(event, minutes);
                    }
                    await this.text(message);
                    await this.voice();
                }, null, true, 'Europe/Moscow');
            }
        }
    }
    static getFullText(event, minutes) {
        const minutesInString = format_1.Format.minutesToString(minutes, [
            ['остался', 'осталось', 'осталось'],
            ['осталась', 'осталось', 'осталось'],
        ]);
        const namesInString = event.name.map((n) => `**${n}**`).join(' и ');
        const boss = event.name.length > 1 ? 'боссов' : 'босса';
        return `До ${boss} ${namesInString} ${minutesInString}`;
    }
    static getCurrentBossText(name = []) {
        const bossSpawned = name.length > 1 ? 'Появились боссы' : 'Появился босс';
        return `${bossSpawned} ${name.map((n) => `**${n}**`).join(' и ')}`;
    }
    static getNextBossText(pattern, name = []) {
        const job = new cron_1.CronJob(pattern, () => null, null, false, 'Europe/Moscow');
        const time = job.nextDate() && job.nextDate().format('HH:mm');
        const nextBossString = name.length > 1 ? 'Следующие боссы' : 'Следующий босс';
        return `${nextBossString} - ${name.map((n) => `**${n}**`).join(' и ')} в **${time}**`;
    }
    async voice() {
        var _a, _b;
        const channel = this.client.channels.cache.get(EventsModule.voiceChannelId);
        if (!channel)
            return;
        try {
            const connection = (_b = (_a = this.client.voice) === null || _a === void 0 ? void 0 : _a.connections.find(({ channel }) => EventsModule.voiceChannelId === channel.id)) !== null && _b !== void 0 ? _b : (await channel.join());
            connection.on('error', logger.error);
            const dispatcher = connection.play(path_1.join(__dirname, '../../media/notif.mp3'), { volume: 0.5 });
            dispatcher.on('finish', () => {
                dispatcher.destroy();
            });
            dispatcher.on('error', logger.error);
        }
        catch (e) {
            logger.error(e);
        }
    }
    async text(message) {
        const channel = this.client.channels.cache.get(EventsModule.textChannelId);
        if (!channel)
            return;
        try {
            await channel.send(message);
        }
        catch (e) {
            logger.error(e);
        }
    }
}
exports.EventsModule = EventsModule;
EventsModule.textChannelId = process.env.DISCORD_TEXT_CHANNEL_ID;
EventsModule.voiceChannelId = process.env.DISCORD_VOICE_CHANNEL_ID;
// eslint-disable-next-line @typescript-eslint/no-var-requires
EventsModule.events = Array.from(require('../../database/events.json'));
