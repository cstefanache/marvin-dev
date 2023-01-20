import * as colors from 'colors';

export class Logger {
  private consoleLogFn: Function;
  private logs: string[] = [];

  constructor(private section: string, color: string) {
    this.consoleLogFn = (colors as any)[color];
  }

  public log(message: string): void {
      this.consoleLogFn(`[ ${this.section} ] ${message}`);
      this.logs.push(message);
  }

  public error(message: string): void{
    (colors as any)['red'](`[ ${this.section} ] ${message}`);
    this.logs.push(message);
  }
}


const logs: { [key: string]: Logger } = {};

export default function getLog(section: string, color = 'grey'): Logger {
  let log = logs[section];
  if (!log) {
    log = new Logger(section, color);
    logs[section] = log;
  }

  return log;
}
