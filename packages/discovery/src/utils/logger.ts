import * as colors from 'colors';

const aditionalLoggers = [];


export function log(message: string, color = 'yellow'): void {
    (colors as any)[color](`[ marvin ] ${message}`);

    aditionalLoggers.forEach(logger => {
        logger.log(message);
    })
}

export function registerLogger(logger) {
    aditionalLoggers.push(logger);
}
