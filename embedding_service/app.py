import os
import logging
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load sentence transformer model
# SentenceTransformer will automatically download it on first run if not present
logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("SentenceTransformer model loaded successfully.")
except Exception as e:
    logger.critical(f"Failed to load sentence-transformers model: {str(e)}")
    raise e

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model": "all-MiniLM-L6-v2",
        "dimensions": 384
    }), 200

@app.route('/embed', methods=['POST'])
def embed():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' parameter in request body"}), 400
    
    text = data['text']
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "'text' parameter must be a non-empty string"}), 400
    
    try:
        logger.info(f"Generating embedding for text snippet: '{text[:60]}...'")
        embedding = model.encode(text).tolist()
        return jsonify({"embedding": embedding}), 200
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        return jsonify({
            "error": "Internal error generating embedding",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    # Use Waitress WSGI server for a more robust production run on Windows
    from waitress import serve
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting embedding service on port {port} via waitress...")
    serve(app, host='0.0.0.0', port=port)
    # Fallback to dev server if serve fails:
    # app.run(host='0.0.0.0', port=port, debug=False)
