from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os

from deepgram import DeepgramClient, SpeakOptions

load_dotenv()

app = Flask(__name__, static_folder="./static", static_url_path="/static")

def synthesize_audio(text, model):
    try:
        deepgram = DeepgramClient(os.environ.get("DEEPGRAM_API_KEY"))
        options = SpeakOptions(model=model)
        audio_folder = os.path.join(app.static_folder, 'audio')
        if not os.path.exists(audio_folder):
            os.makedirs(audio_folder)
        filename = os.path.join(app.static_folder, audio_folder, "output.mp3")
        deepgram.speak.v("1").save(filename, {"text":text}, options)
        return filename
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

        audio_file = synthesize_audio(text, model)
        audio_url = f"{request.url_root}static/audio/{os.path.basename(audio_file)}"

        return jsonify({"success": True, "audioUrl": audio_url})

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)})

    except Exception as e:
        return jsonify({"success": False, "error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
