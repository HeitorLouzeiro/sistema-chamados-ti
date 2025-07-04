#!/usr/bin/env python3
"""
Script para aguardar o banco de dados estar pronto antes de iniciar o Django
"""
import os
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_db():
    """Aguarda o banco de dados estar pronto"""
    db_conn = None
    db_is_ready = False
    
    # Extrair informações da DATABASE_URL
    database_url = os.environ.get('DATABASE_URL', '')
    if not database_url:
        print("❌ DATABASE_URL não encontrada")
        return False
    
    print("🔄 Aguardando o banco de dados ficar pronto...")
    
    max_attempts = 30  # 30 tentativas (30 segundos)
    attempt = 0
    
    while not db_is_ready and attempt < max_attempts:
        attempt += 1
        try:
            print(f"Tentativa {attempt}/{max_attempts}...")
            
            # Tentar conectar com o banco
            db_conn = psycopg2.connect(
                host='db',
                database='sistema_chamados',
                user='postgres',
                password='postgres123',
                port=5432
            )
            
            # Verificar se a conexão está funcionando
            cursor = db_conn.cursor()
            cursor.execute('SELECT 1')
            cursor.close()
            
            db_is_ready = True
            print("✅ Banco de dados está pronto!")
            
        except OperationalError as e:
            print(f"⏳ Banco ainda não está pronto: {e}")
            time.sleep(1)
            
        finally:
            if db_conn:
                db_conn.close()
    
    if not db_is_ready:
        print("❌ Timeout: Banco de dados não ficou pronto a tempo")
        return False
    
    return True

if __name__ == '__main__':
    if wait_for_db():
        print("🎉 Banco de dados pronto! Prosseguindo...")
        exit(0)
    else:
        print("💥 Falha ao aguardar o banco de dados")
        exit(1)
