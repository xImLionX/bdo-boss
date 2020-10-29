import { CronJob } from 'cron';
import { Client, TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import { getLogger } from 'log4js';
import { Format } from '../utils/format';
import { Event } from './types/events';
import { join } from 'path';

const logger = getLogger('EVENTS');

export class EventsModule {
  private static readonly textChannelId: string = process.env.DISCORD_TEXT_CHANNEL_ID as string;
  private static readonly voiceChannelId: string = process.env.DISCORD_VOICE_CHANNEL_ID as string;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  private static readonly events: Event[] = Array.from(require('../../database/events.json'));
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  initialize(): void {
    for (const [index, event] of EventsModule.events.entries()) {
      for (const minutes of event.notify) {
        const pattern = Format.addMinutesToPattern(event.pattern, -minutes);
        new CronJob(
          pattern,
          async () => {
            let message;
            if (minutes === 0) {
              const nextEvent = EventsModule.events[index === EventsModule.events.length - 1 ? 0 : index + 1];
              message = `${EventsModule.getCurrentBossText(event.name)}. ${EventsModule.getNextBossText(
                nextEvent.pattern,
                nextEvent.name,
              )}`;
            } else {
              message = EventsModule.getFullText(event, minutes);
            }
            await this.text(message);
            await this.voice();
          },
          null,
          true,
          'Europe/Moscow',
        );
      }
    }
  }

  static getFullText(event: Event, minutes: number): string {
    const minutesInString = Format.minutesToString(minutes, [
      ['остался', 'осталось', 'осталось'],
      ['осталась', 'осталось', 'осталось'],
    ]);
    const namesInString = event.name.map((n) => `**${n}**`).join(' и ');
    const boss = event.name.length > 1 ? 'боссов' : 'босса';

    return `До ${boss} ${namesInString} ${minutesInString}`;
  }

  static getCurrentBossText(name: string[] = []): string {
    const bossSpawned = name.length > 1 ? 'Появились боссы' : 'Появился босс';
    return `${bossSpawned} ${name.map((n) => `**${n}**`).join(' и ')}`;
  }

  static getNextBossText(pattern: string, name: string[] = []): string {
    const job = new CronJob(pattern, () => null, null, false, 'Europe/Moscow');
    const time = job.nextDate() && job.nextDate().format('HH:mm');
    const nextBossString = name.length > 1 ? 'Следующие боссы' : 'Следующий босс';
    return `${nextBossString} - ${name.map((n) => `**${n}**`).join(' и ')} в **${time}**`;
  }

  async voice(): Promise<void> {
    const channel = this.client.channels.cache.get(EventsModule.voiceChannelId) as VoiceChannel | undefined;
    if (!channel) return;
    try {
      const connection: VoiceConnection =
        this.client.voice?.connections.find(({ channel }) => EventsModule.voiceChannelId === channel.id) ??
        (await channel.join());
      connection.on('error', logger.error);
      const dispatcher = connection.play(join(__dirname, '../../media/notif.mp3'), { volume: 0.5 });
      dispatcher.on('finish', () => {
        dispatcher.destroy();
      });
      dispatcher.on('error', logger.error);
    } catch (e) {
      logger.error(e);
    }
  }

  async text(message: string): Promise<void> {
    const channel = this.client.channels.cache.get(EventsModule.textChannelId) as TextChannel | undefined;
    if (!channel) return;
    try {
      await channel.send(message);
    } catch (e) {
      logger.error(e);
    }
  }
}
