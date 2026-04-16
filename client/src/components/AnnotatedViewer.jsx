import React, { useRef, useEffect, useState } from 'react';

const AnnotatedViewer = ({ imageUrl, detections }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [hoveredBox, setHoveredBox] = useState(null);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'weapons': return '#ef4444'; // Red (--threat-critical)
      case 'people': return '#06b6d4'; // Cyan (--accent-cyan) or Blue
      case 'vehicles': return '#22c55e'; // Green (--threat-low)
      case 'objects': return '#eab308'; // Yellow (--threat-medium)
      default: return '#a0a0b8'; // Gray (--text-muted)
    }
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Set canvas dimensions to match image natural size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detections) return;

    detections.forEach((det, i) => {
      const { x, y, w, h } = det.bbox;
      const color = getCategoryColor(det.category);
      
      const isHovered = hoveredBox === i;
      
      // Draw Box
      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 6 : 3;
      ctx.strokeRect(x, y, w, h);
      
      // Draw Label Background
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 30, ctx.measureText(`${det.class} ${Math.round(det.confidence * 100)}%`).width + 20, 30);
      
      // Draw Label Text
      ctx.fillStyle = '#fff';
      ctx.font = '16px "JetBrains Mono"';
      ctx.fillText(`${det.class.toUpperCase()} ${Math.round(det.confidence * 100)}%`, x + 5, y - 10);
      
      if (isHovered) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1.0;
      }
    });
  };

  useEffect(() => {
    if (imageRef.current?.complete) {
      drawAnnotations();
    }
  }, [detections, hoveredBox]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scaling ratios
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Mouse relative to canvas internal coordinates
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Find if hovering over a box
    let found = null;
    if (detections) {
      for (let i = 0; i < detections.length; i++) {
        const { x, y, w, h } = detections[i].bbox;
        if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
          found = i;
          break; // Stop at first match (topmost if we sorted, but we take first)
        }
      }
    }
    
    if (hoveredBox !== found) {
      setHoveredBox(found);
    }
  };

  return (
    <div className="glass-card" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <img 
        ref={imageRef}
        src={imageUrl} 
        alt="Analyzed scene" 
        style={{ width: '100%', display: 'block' }}
        onLoad={drawAnnotations}
        crossOrigin="anonymous"
      />
      <canvas 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredBox(null)}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          cursor: hoveredBox !== null ? 'pointer' : 'default'
        }} 
      />
    </div>
  );
};

export default AnnotatedViewer;
