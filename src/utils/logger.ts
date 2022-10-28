import * as colors from 'colors';

export function log(message: string, color = 'yellow'): void {
    console.log((colors as any)[color](`[ marvin ] ${message}`));
}
