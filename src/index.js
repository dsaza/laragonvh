const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron/main');
const path = require('node:path');
const fsPromises = require('node:fs/promises');
const { createVirtualHosts } = require('./lib/virtual-hosts');

let mainWindow;
let addHostWindow;

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

const TEMPLATE_MENU = [
  {
    label: 'File',
    submenu: [
      {
        id: 'addHost',
        label: 'New Virtual Host',
        click: () => {
          createAddHostWindow();
        },
      },
      {
        id: 'syncHosts',
        label: 'Sync Hosts',
        click: () => {
          mainWindow.webContents.send('laragonvh:on-sync-hosts');
        },
      }
    ],
  },
  {
    label: 'Window',
    submenu: [
      ...(IS_DEVELOPMENT) ? [
        {
          label: 'Reload',
          role: 'reload',
        },
        {
          label: 'Toggle Developer Tools',
          role: 'toggleDevTools',
        },
      ] : [],
      {
        label: 'Minimize',
        role: 'minimize',
      },
      {
        label: 'Exit',
        role: 'quit',
      },
    ],
  },
  {
    label: 'GitHub',
    click: () => {
      shell.openExternal('https://github.com/dsaza');
    }
  },
]

if (require('electron-squirrel-startup')) {
  app.quit();
}

const disableSyncHosts = () => {
  Menu.getApplicationMenu().getMenuItemById('addHost').enabled = false;
  Menu.getApplicationMenu().getMenuItemById('syncHosts').enabled = false;
}

const enableSyncHosts = () => {
  Menu.getApplicationMenu().getMenuItemById('addHost').enabled = true;
  Menu.getApplicationMenu().getMenuItemById('syncHosts').enabled = true;
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 686,
    height: 460,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    title: 'Laragon Virtual Hosts',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, './views/index.html'));

  const mainMenu = Menu.buildFromTemplate(TEMPLATE_MENU);
  Menu.setApplicationMenu(mainMenu);
};

const createAddHostWindow = () => {
  if (addHostWindow != null) {
    addHostWindow.show();
    return;
  }

  addHostWindow = new BrowserWindow({
    width: 586,
    height: 360,
    title: 'Add Virtual Host',
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    movable: false,
    parent: mainWindow,
    modal: true,
    closable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  addHostWindow.loadFile(path.join(__dirname, './views/add-host.html'));
};

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('laragonvh:show-add-host-window', () => {
  createAddHostWindow();
});

ipcMain.on('laragonvh:close-add-host-window', () => {
  addHostWindow.hide();
});

ipcMain.handle('laragonvh:exist-folder', async (_, path) => {
  try {
    const stats = await fsPromises.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
});

ipcMain.handle('laragonvh:sync-hosts', async (_, hosts) => {
  disableSyncHosts();
  const isCreated = await createVirtualHosts(hosts);
  enableSyncHosts();
  return isCreated;    
});
