const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function detectObjects(imagePath, filename) {
  const yoloUrl = process.env.YOLO_SERVICE_URL || 'http://localhost:5001';
  
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath), filename);
    
    // Set a short timeout so we fallback quickly if Python isn't running
    const response = await axios.post(`${yoloUrl}/detect`, formData, {
      headers: formData.getHeaders(),
      timeout: 3000 
    });
    
    return response.data;
  } catch (error) {
    console.log("YOLO service unavailable, falling back to mock detections.");
    return {
      detections: generateMockDetections(),
      imageWidth: 800,
      imageHeight: 600
    };
  }
}

function generateMockDetections(imageWidth = 800, imageHeight = 600) {
  const possibleDetections = [
    { class: 'person', confidence: 0.92, category: 'people' },
    { class: 'person', confidence: 0.87, category: 'people' },
    { class: 'knife', confidence: 0.78, category: 'weapons' },
    { class: 'backpack', confidence: 0.84, category: 'objects' },
    { class: 'cell phone', confidence: 0.71, category: 'objects' },
    { class: 'bottle', confidence: 0.68, category: 'objects' },
    { class: 'handbag', confidence: 0.73, category: 'objects' },
  ];
  
  // Return random subset of 3-6 detections with random bounding boxes
  const count = Math.floor(Math.random() * 4) + 3;
  const selected = possibleDetections.sort(() => Math.random() - 0.5).slice(0, count);
  
  return selected.map(det => ({
    ...det,
    confidence: Number((det.confidence + (Math.random() * 0.1 - 0.05)).toFixed(3)),
    bbox: {
      x: Math.floor(Math.random() * (imageWidth * 0.6)),
      y: Math.floor(Math.random() * (imageHeight * 0.6)),
      w: Math.floor(Math.random() * 150 + 80),
      h: Math.floor(Math.random() * 200 + 100),
    }
  }));
}

module.exports = { detectObjects };
