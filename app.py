from flask import Flask, request, Response, jsonify
from dotenv import load_dotenv
import os
import io

from deepgram import DeepgramClient, SpeakOptions

load_dotenv()

app = Flask(__name__, static_folder="./static", static_url_path="/static")

def synthesize_audio(text, model):
    try:
        deepgram = DeepgramClient(os.environ.get("DEEPGRAM_API_KEY"))
        options = SpeakOptions(model=model)
        dg_stream = deepgram.speak.v("1").stream({"text":text}, options)        
        return dg_stream

    except Exception as e:
        raise ValueError(f"Speech synthesis failed: {str(e)}")

@app.route("/", methods=["GET"])
def serve_index():
    return app.send_static_file("index.html")

@app.route("/api", methods=["POST"])
def synthesize_speech():
    try:
        data = request.get_json()
        text = data.get('text')
        model = data.get('model')

        if not text:
            raise ValueError("Text is required in the request")

        response = synthesize_audio(text, model)

        def generate_audio():
            # Yield the audio data incrementally
            chunk_size = 1024
            while True:
                chunk = response.stream.read(chunk_size)
                if not chunk:
                    break
                yield chunk

        # Return a Response object with the generator function
        return Response(generate_audio(), mimetype='audio/wav')

    except Exception as e:
        return jsonify({"success": False, "error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
