import subprocess
import os
import sys
import time
import webbrowser
import threading
import signal

def run_backend():
    """Lance le backend Spring Boot"""
    os.chdir('backend')
    print("🚀 Démarrage du backend Spring Boot...")
    # En mode développement: mvn spring-boot:run
    # En production: java -jar target/backend-0.0.1-SNAPSHOT.jar
    process = subprocess.Popen(['mvn', 'spring-boot:run'], 
                               stdout=subprocess.PIPE, 
                               stderr=subprocess.PIPE,
                               text=True)
    for line in process.stdout:
        print(f"[BACKEND] {line.strip()}")
        if "Started FacturaApplication" in line:
            print("✅ Backend démarré sur http://localhost:8080")
    os.chdir('..')

def run_frontend():
    """Lance le frontend React"""
    os.chdir('frontend')
    print("🚀 Démarrage du frontend React...")
    process = subprocess.Popen(['npm', 'run', 'dev', '--', '--host'], 
                               stdout=subprocess.PIPE, 
                               stderr=subprocess.PIPE,
                               text=True)
    for line in process.stdout:
        print(f"[FRONTEND] {line.strip()}")
        if "Local:" in line or "Network:" in line:
            print("✅ Frontend démarré")
    os.chdir('..')

if __name__ == "__main__":
    print("=" * 50)
    print("📊 FACTURA - Application de traçabilité commerciale")
    print("=" * 50)
    
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