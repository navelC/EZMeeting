from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
import os
import time
import asyncio
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

@app.route('/rollcall', methods=['POST'])
def rollcall():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({'status': 'error', 'message': 'No JSON data in the request'})
 
        if data:
            results = []
            for item in data:

                result = DeepFace.verify("data/"+ item['userID']+"/1.jpg", item['image'], model_name = 'VGG-Face', enforce_detection=False)
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


@app.route('/upload', methods=['POST'])
def upload():
    try:
        # Check if the 'file' field is in the request
        # if 'file' not in request.files:
        #     return jsonify({'status': 'error', 'message': 'No file part'})

        file = request.files['file']
        userID = request.form['userID']
        print(file)
        # Check if the file is present and has an allowed extension
        if file and allowed_file(file.filename):
            # Save the file to a folder (create the folder if not exists)
            upload_folder = 'data/'+userID
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)

            # remove_file(upload_folder)
            file_path = os.path.join(upload_folder, '1.jpg')
            file.save(file_path)

            return jsonify({'status': 'success', 'message': 'File uploaded successfully', 'file_path': file_path})
        else:
            return jsonify({'status': 'error', 'message': 'Invalid file'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

def allowed_file(filename):
    # Adjust this function to define the allowed file extensions
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def remove_file(folderPath):
    files = [f for f in os.listdir(folderPath) if os.path.isfile(os.path.join(folderPath, f))]
    for file in files:
        file_path = os.path.join(folderPath, file)
        os.remove(file_path)
                

if __name__ == '__main__':
    app.run(debug=True)