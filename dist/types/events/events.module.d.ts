import { Client } from 'discord.js';
import { Event } from './types/events';
export declare class EventsModule {
    private static readonly textChannelId;
    private static readonly voiceChannelId;
    private static readonly events;
    private readonly client;
    constructor(client: Client);
    initialize(): void;
    static getFullText(event: Event, minutes: number): string;
    static getCurrentBossText(name?: string[]): string;
    static getNextBossText(pattern: string, name?: string[]): string;
    voice(): Promise<void>;
    text(message: string): Promise<void>;
}
