import { ipcMain } from 'electron';
import { getRegisteredLogs, getLogs } from '../api/logging';

export default class LoggingEvents {
  static bootstrapLoggerEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

ipcMain.handle('get-loggers', () => {
  return getRegisteredLogs();
});

ipcMain.handle('get-logs', (_, section: string) => { 
  return getLogs(section);
})
