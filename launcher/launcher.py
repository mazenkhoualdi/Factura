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
    
    # Attendre et ouvrir le navigateur
    time.sleep(5)
    print("🌐 Ouverture de l'application dans le navigateur...")
    webbrowser.open('http://localhost:5173')
    
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
