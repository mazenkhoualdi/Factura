// main.js - Coquille desktop de Factura
//
// Rôle :
//  1. Lire/créer la config PostgreSQL dans %ProgramData%\Factura\config.properties
//  2. Lancer le backend Spring Boot (backend.jar) avec la JRE embarquée
//  3. Attendre que le serveur réponde sur 127.0.0.1
//  4. Ouvrir une fenêtre pointant vers l'application (pas un navigateur, une vraie fenêtre app)
//  5. Fermer proprement le process Java quand l'utilisateur quitte

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

const isDev = !app.isPackaged;

// --- Emplacements ---
// En dev : tout est dans ce dossier. En prod (installé) : process.resourcesPath
// pointe vers Factura/resources (backend.jar, jre/).
const RESOURCES_DIR = isDev
  ? path.join(__dirname, 'resources')
  : process.resourcesPath;

const JRE_JAVA = path.join(
  RESOURCES_DIR,
  'jre',
  'bin',
  process.platform === 'win32' ? 'javaw.exe' : 'java'
);
const BACKEND_JAR = path.join(RESOURCES_DIR, 'backend.jar');

// Données persistantes de l'appli (uploads, config) -> hors de Program Files,
// car ce dossier n'est pas garanti accessible en écriture pour un utilisateur standard.
const DATA_DIR = path.join(app.getPath('appData'), 'Factura');
const CONFIG_FILE = path.join(DATA_DIR, 'config.properties');
const LICENSE_FILE = path.join(DATA_DIR, 'license.lic');
const UPLOADS_DIR = path.join(DATA_DIR, 'data'); // devient le cwd du process java

let backendProcess = null;
let mainWindow = null;
let logStream = null;

function getLogFilePath() {
  return path.join(DATA_DIR, 'backend.log');
}

function ensureConfig() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  if (!fs.existsSync(CONFIG_FILE)) {
    // Config par défaut au premier lancement. L'administrateur IT peut éditer
    // ce fichier texte à la main puis relancer l'application.
    const defaultConfig = [
      '# Configuration de connexion PostgreSQL pour Factura',
      '# Modifiez ces valeurs puis relancez l\'application.',
      'DB_URL=jdbc:postgresql://localhost:5432/factura',
      'DB_USER=postgres',
      'DB_PASSWORD=postgres',
      'SERVER_PORT=8080',
      ''
    ].join('\r\n');
    fs.writeFileSync(CONFIG_FILE, defaultConfig, 'utf-8');
  }
}

function readConfig() {
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const env = {};
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  });
  return env;
}

function waitForServer(port, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get({ host: '127.0.0.1', port, path: '/', timeout: 1500 }, (res) => {
        res.resume();
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Le serveur backend n\'a pas démarré à temps.'));
        } else {
          setTimeout(tryOnce, 800);
        }
      });
    };
    tryOnce();
  });
}

function startBackend(userEnv) {
  const port = userEnv.SERVER_PORT || '8080';

  const javaEnv = Object.assign({}, process.env, {
    DB_URL: userEnv.DB_URL,
    DB_USER: userEnv.DB_USER,
    DB_PASSWORD: userEnv.DB_PASSWORD,
    SERVER_PORT: port,
    UPLOADS_DIR: '.',
    LICENSE_FILE: LICENSE_FILE
  });

  logStream = fs.createWriteStream(getLogFilePath(), { flags: 'a' });
  logStream.write(`\r\n===== Démarrage ${new Date().toISOString()} =====\r\n`);
  logStream.write(`Commande : ${JRE_JAVA} -jar ${BACKEND_JAR}\r\n`);

  backendProcess = spawn(JRE_JAVA, ['-jar', BACKEND_JAR], {
    cwd: UPLOADS_DIR,          // les dossiers uploads/* relatifs se créent ici
    env: javaEnv,
    windowsHide: true
  });

  backendProcess.stdout && backendProcess.stdout.on('data', (d) => logStream.write(d));
  backendProcess.stderr && backendProcess.stderr.on('data', (d) => logStream.write(d));

  backendProcess.on('exit', (code) => {
    logStream.write(`\r\n===== Process terminé, code=${code} =====\r\n`);
    if (code !== 0 && mainWindow === null) {
      dialog.showErrorBox(
        'Factura',
        `Le serveur backend s'est arrêté de façon inattendue (code ${code}).\n\nConsultez le fichier de log pour le détail :\n${getLogFilePath()}`
      );
    }
  });

  return port;
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,     // masque la barre de menu Electron par défaut
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      devTools: isDev,         // pas d'outils de dev exposés en production
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(`http://localhost:${port}`);
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  try {
    ensureConfig();
    const userEnv = readConfig();
    const port = startBackend(userEnv);

    const splash = new BrowserWindow({
      width: 420, height: 280, frame: false, resizable: false,
      icon: path.join(__dirname, 'assets', 'icon.ico')
    });
    splash.loadFile(path.join(__dirname, 'assets', 'splash.html'));

    await waitForServer(port, 60000);

    splash.close();
    createWindow(port);
  } catch (err) {
    dialog.showErrorBox(
      'Factura - Erreur de démarrage',
      `${err.message}\n\nVérifiez que PostgreSQL est démarré et que le fichier de configuration\n${CONFIG_FILE}\ncontient les bons identifiants.\n\nDétails de l'erreur backend :\n${getLogFilePath()}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    // Sous Windows, java lance parfois un process enfant : taskkill /T pour tout arrêter proprement.
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid, '/T', '/F']);
    } else {
      backendProcess.kill();
    }
  }
});
