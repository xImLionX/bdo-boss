export class Format {
  static addMinutesToPattern(pattern: string, minutes: number): string {
    const regExp = /(\d+|\*) (\d+|\*) (\d+|\*) (\d+|\*) (\d+|\*) (\d+|\*)/;

    let h = 0;

    if (minutes > 0) {
      h = Math.floor(minutes / 60);
    } else if (minutes < 0) {
      h = Math.ceil(minutes / 60);
    }

    const m = minutes - h * 60;
    const match = pattern.match(regExp) as string[];

    const oldM = parseInt(match[2], 10);
    const oldH = parseInt(match[3], 10);
    const oldD = parseInt(match[6], 10);

    let newM = oldM + m;
    let newH = oldH + h;
    let newD = oldD;

    if (oldM + m >= 60 || oldM + m < 0) {
      newM = oldM + m < 0 ? 60 + newM : newM - 60;
      newH = oldM + m < 0 ? newH - 1 : newH + 1;
    }

    if (oldH + h >= 24 || oldH + h < 0) {
      newH = oldH + h < 0 ? 24 + newH : newH - 24;
      newD = oldH + h < 0 ? oldD - 1 : oldD + 1;
    }

    if (newH < 0) {
      newH = 24 + newH;
      if (newD === 0) {
        newD = 6;
      } else {
        newD -= 1;
      }
    }

    if (newD > 6 || newD < 0) {
      newD = newD > 6 ? newD - 7 : 7 + newD;
    }

    return `${match[1]} ${newM} ${newH} ${match[4]} ${match[5]} ${newD}`;
  }

  static minutesToString(minutes: number, prefix?: string[][]): string | null {
    const isZeroMinutes = minutes === 0;
    const isPrefixArray = Array.isArray(prefix);

    if (!isZeroMinutes && isPrefixArray) {
      let timeString = '';

      const h = Math.floor(minutes / 60);
      const m = Math.floor(minutes - h * 60);
      let hPlural = null;
      let mPlural = null;
      let pPlural = null;

      if (h > 0) {
        hPlural = Format.plural(h, ['час', 'часа', 'часов']);
        timeString += `${h} ${hPlural} `;
      }

      if (m > 0) {
        mPlural = Format.plural(m, ['минута', 'минуты', 'минут']);
        timeString += `${h > 0 ? 'и ' : ''}${m} ${mPlural} `;
      }

      if (prefix) {
        pPlural = hPlural ? Format.plural(h, prefix[0]) : Format.plural(m, prefix[1]);
        timeString = `${pPlural} **${timeString}**`;
      }

      return timeString;
    }

    return null;
  }

  static plural(num: number, word: string[]): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return word[num % 100 > 4 && num % 100 < 20 ? 2 : cases[num % 10 < 5 ? num % 10 : 5]];
  }
}
