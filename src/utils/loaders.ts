import * as fs from 'fs';

export function loadJSON(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}
