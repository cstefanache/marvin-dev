import * as colors from 'colors';

export function log(message: string, color = 'yellow'): void {
    (colors as any)[color](`[ marvin ] ${message}`);
}
