function calculateThreatScore(detections, geminiAnalysis) {
  let score = 0;

  // Factor 1: Weapon presence (heaviest weight)
  const weaponClasses = ['knife', 'gun', 'pistol', 'rifle', 'weapon', 'sword', 'axe', 'hammer'];
  const weaponDetections = detections.filter(d => 
    weaponClasses.some(w => d.class.toLowerCase().includes(w))
  );
  score += weaponDetections.length * 25;
  score += weaponDetections.reduce((sum, d) => sum + d.confidence * 15, 0);

  // Factor 2: Suspicious objects
  const suspiciousClasses = ['blood', 'fire', 'smoke', 'mask', 'crowbar'];
  const suspiciousDetections = detections.filter(d =>
    suspiciousClasses.some(s => d.class.toLowerCase().includes(s))
  );
  score += suspiciousDetections.length * 15;

  // Factor 3: Gemini threat assessment
  if (geminiAnalysis && geminiAnalysis.threatAssessment) {
    const geminiScore = geminiAnalysis.threatAssessment.score || 0;
    score = (score * 0.4) + (geminiScore * 0.6); // Weight Gemini higher for scene reasoning
  }

  // Factor 4: Anomaly count
  const anomalyCount = (geminiAnalysis && geminiAnalysis.anomalyAnalysis) ? geminiAnalysis.anomalyAnalysis.length : 0;
  score += anomalyCount * 3;

  // Cap at 100
  score = Math.min(Math.round(score), 100);

  // Determine level
  let level;
  if (score >= 80) level = 'CRITICAL';
  else if (score >= 60) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';
  else if (score >= 20) level = 'LOW';
  else level = 'MINIMAL';

  return { score, level };
}

module.exports = { calculateThreatScore };
