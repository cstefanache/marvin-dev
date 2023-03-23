import * as colors from 'colors';

const aditionalLoggers: any[] = [];
const targetLoggers: { [key: string]: any } = {};

export function log(
  message: string,
  color = 'yellow',
  overwriteLast: boolean = false,
  forceWrite: boolean = false,
  target?: string
): void {
  if (!overwriteLast || forceWrite) {
    (colors as any)[color](`[ marvin ] ${message}`);
  }

  if (target) {
    targetLoggers[target]?.log(message, color, overwriteLast);
  } else {
    aditionalLoggers.forEach((logger: unknown) => {
      // @ts-ignore
      logger?.log(message, color, overwriteLast);
    });
  }
}

export function registerLogger(logger: unknown, target?: string): void {
  if (target) {
    targetLoggers[target] = logger;
  } else {
    aditionalLoggers.push(logger);
  }
}
