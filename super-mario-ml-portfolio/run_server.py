#!/usr/bin/env python3
"""
Simple HTTP Server for Super Mario ML Portfolio
Run this script to serve the website locally and fix image loading issues.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# Configuration
PORT = 8000
HOST = 'localhost'

def main():
    # Change to the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Create server
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
            print(f"🚀 Super Mario ML Portfolio Server Starting...")
            print(f"📁 Serving files from: {script_dir}")
            print(f"🌐 Server running at: http://{HOST}:{PORT}")
            print(f"🎮 Open your browser and go to: http://{HOST}:{PORT}")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print("-" * 50)
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://{HOST}:{PORT}')
                print("🌐 Browser opened automatically!")
            except:
                print("⚠️  Could not open browser automatically. Please open manually.")
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the other server.")
            print("💡 You can change the PORT variable in this script to use a different port.")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
