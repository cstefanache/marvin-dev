import * as colors from 'colors';

const aditionalLoggers: any[] = [];

export function log(
  message: string,
  color = 'yellow',
  overwriteLast: boolean = false,
  forceWrite: boolean = false
): void {
  if (!overwriteLast || forceWrite) {
    (colors as any)[color](`[ marvin ] ${message}`);
  }

  aditionalLoggers.forEach((logger: unknown) => {
    // @ts-ignore
    logger?.log(message, color, overwriteLast);
  });
}

export function registerLogger(logger: unknown) {
  aditionalLoggers.push(logger);
}
