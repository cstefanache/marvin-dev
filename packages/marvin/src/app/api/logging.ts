import * as colors from 'colors';
import { registerLogger } from 'packages/discovery/src/utils/logger';
import App from '../app';

export class Logger {
  private consoleLogFn: Function;
  private logs: string[][] = [];

  constructor(public section: string, color: string) {
    this.consoleLogFn = (colors as any)[color];
    this.log(`Logger initialized for ${section}`);
  }

  public log(
    message: string,
    col?: string,
    overwriteLast: boolean = false
  ): void {
    console.log(this.consoleLogFn(`[ ${this.section} ] ${message}`));
    if (App.mainWindow) {
      App.mainWindow.webContents.send('log', this.section, [
        col,
        message,
        overwriteLast,
      ]);
    }
    if (overwriteLast) {
      this.logs.pop();
    }
    this.logs.push([col, message]);
  }

  public error(message: string): void {
    (colors as any)['red'](`[ ${this.section} ] ${message}`);
    this.logs.push(['red', message]);
  }

  public getLogs(count = 500): string[][] {
    return this.logs.slice(-count);
  }
}

export const logs: { [key: string]: Logger } = {};

const marvinLogger = new Logger('Runner', 'yellow');
logs['Runner'] = marvinLogger;
registerLogger(marvinLogger);

export const testLogger = new Logger('Tests', 'green');
logs['Tests'] = testLogger;
registerLogger(testLogger, 'Tests');

export const helpLogger = new Logger('Help', 'green');
logs['Help'] = helpLogger;
registerLogger(helpLogger, 'Help');

export default function getLog(section: string, color = 'grey'): Logger {
  let log = logs[section];
  if (!log) {
    if (App.mainWindow) {
      App.mainWindow.webContents.send('log-section', section);
    }
    log = new Logger(section, color);
    logs[section] = log;
  }

  return log;
}

export function getRegisteredLogs(): string[] {
  return Object.keys(logs);
}

export function getLogs(section: string, count = 100): string[][] {
  if (section) {
    return logs[section].getLogs(count);
  }
}
