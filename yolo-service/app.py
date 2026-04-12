from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model (use pre-trained nano model, fast enough for demo)
model = YOLO('yolov8n.pt')

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    image = Image.open(file.stream)
    
    # Run inference
    results = model(image, conf=0.25)
    
    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            # mapping some classes to higher level categories
            class_name = result.names[int(box.cls[0])]
            category = 'other'
            weapons = ['knife', 'gun', 'pistol', 'rifle', 'weapon', 'sword', 'axe', 'hammer']
            people = ['person']
            vehicles = ['car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'bicycle']
            objects = ['backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'cell phone', 'bottle']

            if class_name in weapons:
                category = 'weapons'
            elif class_name in people:
                category = 'people'
            elif class_name in vehicles:
                category = 'vehicles'
            elif class_name in objects:
                category = 'objects'

            detections.append({
                'class': class_name,
                'category': category,
                'confidence': round(float(box.conf[0]), 3),
                'bbox': {
                    'x': round(x1),
                    'y': round(y1),
                    'w': round(x2 - x1),
                    'h': round(y2 - y1)
                }
            })
    
    return jsonify({
        'detections': detections,
        'imageWidth': image.width,
        'imageHeight': image.height
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'yolov8n'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
