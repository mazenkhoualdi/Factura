import subprocess
import os
import sys
import time
import webbrowser
import threading
import signal

# Détermine le dossier racine du projet (celui qui contient backend/ et
# frontend/), quel que soit l'endroit d'où le .exe est lancé.
if getattr(sys, "frozen", False):
    # Exécutable généré par PyInstaller : sys.executable pointe vers le .exe
    EXE_DIR = os.path.dirname(os.path.abspath(sys.executable))
else:
    # Exécution via "python launcher.py"
    EXE_DIR = os.path.dirname(os.path.abspath(__file__))

def find_project_root(start_dir, max_levels=5):
    """Remonte l'arborescence à partir de start_dir jusqu'à trouver un
    dossier contenant à la fois "backend" et "frontend". Cela rend le
    launcher indépendant de l'endroit exact où PyInstaller a déposé le
    .exe (dist/, launcher/, racine du projet, etc.)."""
    current = os.path.abspath(start_dir)
    for _ in range(max_levels):
        if os.path.isdir(os.path.join(current, "backend")) and os.path.isdir(os.path.join(current, "frontend")):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            break
        current = parent
    # Repli : comportement d'origine (un niveau au-dessus de l'exe)
    return os.path.abspath(os.path.join(start_dir, ".."))

PROJECT_ROOT = find_project_root(EXE_DIR)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

# mvn/npm sont des scripts .cmd sous Windows ; shell=True permet de les
# retrouver correctement dans le PATH sans dépendre du répertoire courant.
IS_WINDOWS = os.name == "nt"

def find_chrome():
    """Cherche l'exécutable Chrome de façon fiable, même depuis un Python
    32-bit sur un Windows 64-bit (où %ProgramFiles% est redirigé vers
    "Program Files (x86)" et ne permet donc pas de voir un Chrome 64-bit
    installé dans le vrai "Program Files"). On interroge d'abord le
    registre (App Paths), qui est la méthode fiable, puis on retombe sur
    une liste de chemins classiques, y compris %ProgramW6432% qui donne
    toujours le vrai "Program Files" 64-bit."""
    # 1) Registre Windows : App Paths\chrome.exe (vue 64-bit ET 32-bit)
    if IS_WINDOWS:
        try:
            import winreg
            for view in (winreg.KEY_WOW64_64KEY, winreg.KEY_WOW64_32KEY):
                try:
                    key = winreg.OpenKey(
                        winreg.HKEY_LOCAL_MACHINE,
                        r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe",
                        0,
                        winreg.KEY_READ | view,
                    )
                    path, _ = winreg.QueryValueEx(key, None)
                    winreg.CloseKey(key)
                    if path and os.path.isfile(path):
                        return path
                except OSError:
                    continue
        except ImportError:
            pass

    # 2) Repli : chemins classiques, avec ProgramW6432 pour contourner la
    # redirection WOW64 d'un process 32-bit.
    candidates = [
        os.path.join(os.environ.get("ProgramW6432", r"C:\Program Files"), "Google\\Chrome\\Application\\chrome.exe"),
        os.path.join(os.environ.get("PROGRAMFILES", r"C:\Program Files"), "Google\\Chrome\\Application\\chrome.exe"),
        os.path.join(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"), "Google\\Chrome\\Application\\chrome.exe"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Google\\Chrome\\Application\\chrome.exe"),
    ]
    for path in candidates:
        if path and os.path.isfile(path):
            return path
    return None

def open_app_window(url):
    """Ouvre l'URL dans une fenêtre Chrome "app" : pas de barre d'adresse,
    pas d'onglets, juste le titre de la page (comme une application de
    bureau, voir index.html -> <title>Factura</title>). Si Chrome n'est pas
    trouvé, on retombe sur un onglet classique du navigateur par défaut."""
    chrome_path = find_chrome()
    if chrome_path:
        subprocess.Popen([chrome_path, f"--app={url}", "--window-size=1366,768"])
    else:
        print("⚠️ Chrome introuvable, ouverture dans le navigateur par défaut.")
        webbrowser.open_new_tab(url)

def run_backend():
    """Lance le backend Spring Boot"""
    print(f"🚀 Démarrage du backend Spring Boot... ({BACKEND_DIR})")
    if not os.path.isdir(BACKEND_DIR):
        print(f"❌ Dossier backend introuvable : {BACKEND_DIR}")
        return
    # En mode développement: mvn spring-boot:run
    # En production: java -jar target/backend-0.0.1-SNAPSHOT.jar
    process = subprocess.Popen(
        "mvn spring-boot:run",
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        shell=IS_WINDOWS,
    )
    for line in process.stdout:
        print(f"[BACKEND] {line.strip()}")
        if "Started FacturaApplication" in line:
            print("✅ Backend démarré sur http://localhost:8080")

def run_frontend():
    """Lance le frontend React"""
    print(f"🚀 Démarrage du frontend React... ({FRONTEND_DIR})")
    if not os.path.isdir(FRONTEND_DIR):
        print(f"❌ Dossier frontend introuvable : {FRONTEND_DIR}")
        return
    process = subprocess.Popen(
        "npm run dev -- --host",
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        shell=IS_WINDOWS,
    )
    for line in process.stdout:
        print(f"[FRONTEND] {line.strip()}")
        if "Local:" in line or "Network:" in line:
            print("✅ Frontend démarré")

if __name__ == "__main__":
    print("=" * 50)
    print("📊 FACTURA - Application de traçabilité commerciale")
    print("=" * 50)
    print(f"📁 Racine du projet détectée : {PROJECT_ROOT}")

    # Démarrer le backend en arrière-plan
    backend_thread = threading.Thread(target=run_backend)
    backend_thread.daemon = True
    backend_thread.start()

    # Attendre que le backend démarre
    time.sleep(10)

    # Démarrer le frontend
    frontend_thread = threading.Thread(target=run_frontend)
    frontend_thread.daemon = True
    frontend_thread.start()

    # Attendre et ouvrir la fenêtre application (sans barre d'adresse)
    time.sleep(5)
    print("🌐 Ouverture de l'application (fenêtre autonome, comme une app de bureau)...")
    open_app_window('http://localhost:5173')

    print("\n📌 L'application est en cours d'exécution.")
    print("   - Backend: http://localhost:8080")
    print("   - Frontend: http://localhost:5173")
    print("\n🛑 Appuyez sur Ctrl+C pour arrêter l'application.\n")

    try:
        # Garder le script actif
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Arrêt de l'application...")
        sys.exit(0)
