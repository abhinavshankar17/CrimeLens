const CriminalRecord = require('../models/CriminalRecord');

/**
 * Match suspects against an analysis result.
 * Returns top 5 suspects ranked by composite match score.
 */
async function matchSuspects(analysis) {
  const allCriminals = await CriminalRecord.find({
    status: { $in: ['wanted', 'released', 'under_surveillance'] }
  });

  if (!allCriminals.length) return [];

  const crimeType = (analysis.forensicReport?.crimeType || '').toLowerCase();
  const forensicText = [
    analysis.forensicReport?.sceneOverview || '',
    analysis.forensicReport?.forensicInterpretation || '',
    ...(analysis.forensicReport?.anomalyAnalysis || []),
    ...(analysis.forensicReport?.detectedElements || [])
  ].join(' ').toLowerCase();

  const detectedClasses = (analysis.detections || []).map(d => d.class.toLowerCase());
  const detectedWeapons = (analysis.detections || [])
    .filter(d => d.category === 'weapons')
    .map(d => d.class.toLowerCase());

  const analysisCoords = analysis.location?.coordinates || [0, 0];

  const scoredSuspects = allCriminals.map(criminal => {
    let score = 0;
    const matchReasons = [];

    // 1. Crime Type Match (max 35 points)
    const crimeTypeMatches = criminal.knownCrimes.filter(kc => {
      const kcType = (kc.crimeType || '').toLowerCase();
      return crimeType && (
        kcType.includes(crimeType) || 
        crimeType.includes(kcType) ||
        getCrimeAliases(crimeType).some(alias => kcType.includes(alias)) ||
        getCrimeAliases(kcType).some(alias => crimeType.includes(alias))
      );
    });

    if (crimeTypeMatches.length > 0) {
      score += Math.min(35, 20 + crimeTypeMatches.length * 5);
      matchReasons.push({
        factor: 'Crime Type',
        detail: `${crimeTypeMatches.length} prior ${crimeType} offense(s)`,
        weight: Math.min(35, 20 + crimeTypeMatches.length * 5)
      });
    }

    // 2. Weapon Match (max 25 points)
    if (detectedWeapons.length > 0) {
      const weaponMatches = criminal.associatedWeapons.filter(w =>
        detectedWeapons.some(dw => 
          dw.includes(w.toLowerCase()) || w.toLowerCase().includes(dw)
        )
      );
      if (weaponMatches.length > 0) {
        const weaponScore = Math.min(25, weaponMatches.length * 15);
        score += weaponScore;
        matchReasons.push({
          factor: 'Weapon Match',
          detail: `Known to use: ${weaponMatches.join(', ')}`,
          weight: weaponScore
        });
      }
    }

    // 3. MO Pattern Match (max 20 points)
    const moMatches = criminal.modusOperandi.filter(mo => {
      const moLower = mo.toLowerCase();
      return forensicText.includes(moLower) || 
        moLower.split(' ').filter(w => w.length > 3).some(word => forensicText.includes(word));
    });
    if (moMatches.length > 0) {
      const moScore = Math.min(20, moMatches.length * 8);
      score += moScore;
      matchReasons.push({
        factor: 'MO Pattern',
        detail: moMatches.join('; '),
        weight: moScore
      });
    }

    // 4. Geographic Proximity (max 15 points)
    const criminalCoords = criminal.lastKnownLocation?.coordinates || [0, 0];
    if (criminalCoords[0] !== 0 || criminalCoords[1] !== 0) {
      const distKm = haversineDistance(
        analysisCoords[1], analysisCoords[0],
        criminalCoords[1], criminalCoords[0]
      );
      if (distKm <= 10) {
        const proximityScore = Math.round(15 * (1 - distKm / 10));
        if (proximityScore > 0) {
          score += proximityScore;
          matchReasons.push({
            factor: 'Proximity',
            detail: `Last seen ${distKm.toFixed(1)}km from crime scene`,
            weight: proximityScore
          });
        }
      }
    }

    // 5. Status Priority Bonus (max 5 points)
    const statusBonus = { wanted: 5, released: 3, under_surveillance: 4 };
    const sBonus = statusBonus[criminal.status] || 0;
    if (sBonus > 0 && score > 0) {
      score += sBonus;
      matchReasons.push({
        factor: 'Status',
        detail: `Currently ${criminal.status.replace('_', ' ')}`,
        weight: sBonus
      });
    }

    return {
      criminal: {
        _id: criminal._id,
        name: criminal.name,
        alias: criminal.alias,
        age: criminal.age,
        gender: criminal.gender,
        photo: criminal.photo,
        status: criminal.status,
        dangerLevel: criminal.dangerLevel,
        knownCrimes: criminal.knownCrimes,
        modusOperandi: criminal.modusOperandi,
        associatedWeapons: criminal.associatedWeapons,
        physicalDescription: criminal.physicalDescription
      },
      matchScore: Math.min(score, 100),
      matchReasons
    };
  });

  // Filter out zero-score and sort by match score descending, return top 5
  return scoredSuspects
    .filter(s => s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

/**
 * Map common crime types to related aliases for fuzzy matching.
 */
function getCrimeAliases(crimeType) {
  const aliases = {
    'assault': ['attack', 'battery', 'violence', 'altercation', 'fight'],
    'attack': ['assault', 'battery', 'violence', 'altercation'],
    'homicide': ['murder', 'killing', 'manslaughter', 'fatality'],
    'murder': ['homicide', 'killing', 'manslaughter', 'fatality'],
    'burglary': ['break-in', 'robbery', 'theft', 'larceny', 'breaking and entering'],
    'robbery': ['theft', 'burglary', 'larceny', 'mugging', 'holdup'],
    'theft': ['robbery', 'larceny', 'burglary', 'stealing', 'mugging'],
    'arson': ['fire', 'incendiary', 'burning'],
    'suspicious activity': ['suspicious', 'surveillance', 'loitering', 'trespassing'],
    'weapons': ['armed', 'firearm', 'gun', 'knife', 'weapon'],
    'vandalism': ['destruction', 'damage', 'defacement', 'graffiti']
  };
  return aliases[crimeType] || [];
}

/**
 * Haversine formula — distance between two lat/lng pairs in km.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * Math.PI / 180;
}

module.exports = { matchSuspects };
