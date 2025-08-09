from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from DevForge!',
        'timestamp': datetime.now().isoformat(),
        'environment': os.getenv('FLASK_ENV', 'development')
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
