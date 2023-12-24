from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
import os
import time
import face_recognition
import asyncio
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

# async def task(name, image):
#     print('task'+name)
#     result = DeepFace.verify("data/1/2.jpg", image, model_name = 'VGG-Face', enforce_detection=False)
#     return {'name': name, 'verified': str(result['verified'])}

# @app.route('/')
# def index():
#     return render_template('index.html')

@app.route('/rollcall', methods=['POST'])
def upload():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({'status': 'error', 'message': 'No JSON data in the request'})
 
        if data:
            results = []
            for item in data:

                result = DeepFace.verify("data/1/2.jpg", item['image'], model_name = 'VGG-Face', enforce_detection=False)
                res = 0
                # verified = str(result['verified'])
                if result['verified'] == True:
                    res = 1
                results.append({'name': item['user'], 'verified': res})
                
            return jsonify(results)

        else:
            return jsonify({'status': 'error', 'message': 'No file part'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})


if __name__ == '__main__':
    app.run(debug=True)