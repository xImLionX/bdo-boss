import * as log4js from 'log4js';
import { Logger } from 'log4js';
import { Client } from 'discord.js';
import { EventsModule } from './events/events.module';

let logger!: Logger;

function setupLogger(): void {
  log4js.configure('log4js.json');
  logger = log4js.getLogger('INIT');
}

async function setupDiscord(): Promise<Client> {
  const client = new Client();

  client.on('ready', () => {
    logger.info(`Logged in as ${client.user?.tag || 'Unknown'}!`);
  });

  client.on('error', (error) => {
    logger.error(error);
  });

  logger.info('Logging in to Discord...');
  await client.login(process.env.DISCORD_TOKEN);
  return client;
}

function setupEventsModule(client: Client): void {
  const eventsModule = new EventsModule(client);
  eventsModule.initialize();
}

(async () => {
  setupLogger();
  try {
    const client: Client = await setupDiscord();
    await setupEventsModule(client);
  } catch (e) {
    logger.fatal(e);
    process.exit(1);
  }
})();
