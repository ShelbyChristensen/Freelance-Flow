from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.get("/")
def home():
    return jsonify({"message": "Freelance Flow API running"}), 200

if __name__ == "__main__":
    app.run(port=5555, debug=True)
