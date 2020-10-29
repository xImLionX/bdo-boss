export declare class Format {
    static addMinutesToPattern(pattern: string, minutes: number): string;
    static minutesToString(minutes: number, prefix?: string[][]): string | null;
    static plural(num: number, word: string[]): string;
}
