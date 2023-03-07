import * as colors from 'colors';

const aditionalLoggers: any[] = [];

export function log(message: string, color = 'yellow'): void {
  console.log(`[ marvin ] ${message}`[color]);
  (colors as any)[color](`[ marvin ] ${message}`);

  aditionalLoggers.forEach((logger: unknown) => {
    // @ts-ignore
    logger?.log(message, color);
  });
}

export function registerLogger(logger: unknown) {
  aditionalLoggers.push(logger);
}
