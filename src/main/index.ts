import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';

const rendererDevServerUrl = process.env['ELECTRON_RENDERER_URL'];
const isDev = Boolean(rendererDevServerUrl) || !app.isPackaged;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (rendererDevServerUrl) {
    await mainWindow.loadURL(rendererDevServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const rendererPath = path.join(__dirname, '../renderer/index.html');
    await mainWindow.loadFile(rendererPath);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

app.on('second-instance', (_event, _commandLine, _workingDirectory, additionalData) => {
  const win = BrowserWindow.getAllWindows().at(0);
  if (win) {
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});

app.whenReady().then(() => {
  if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  }

  ipcMain.handle('app:ping', async () => {
    return `Pong from Electron v${process.versions.electron}`;
  });

  void createWindow();
});
