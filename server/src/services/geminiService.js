const Groq = require("groq-sdk");

let groq = null;

async function analyzeScene(imageBase64, mimeType, yoloDetections) {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  if (!groq) {
    console.warn("GROQ_API_KEY not set. Using mock analysis.");
    return getMockAnalysis();
  }

  try {
    const model = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

    const detectionContext = yoloDetections.length > 0
      ? `Object detection has identified the following items: ${yoloDetections.map(d => `${d.class} (${(d.confidence * 100).toFixed(1)}% confidence)`).join(', ')}.`
      : 'No automated object detections were provided.';

    const prompt = `You are CrimeLens, an expert forensic crime scene analyst and investigator. Analyze the provided image visually alongside the provided detection data.

DETECTION CONTEXT: ${detectionContext}

Generate a comprehensive forensic analysis in the following EXACT JSON format. Be thorough, professional, and specific. Reference positions, lighting, context, anomalies, and indicators of criminal activity based strictly on what you visually observe combined with the detections.

{
  "sceneOverview": "Detailed 3-5 sentence description of an apparent scene based on visuals...",
  "detectedElements": ["Array of strings describing the significance of the objects visually observed..."],
  "refinedClassNames": ["Array of corrected object names corresponding 1:1 with the provided DETECTION CONTEXT items. For example, if YOLO incorrectly detected a 'car' on a person's pants, correct it to 'pants' or 'person'. Maintain the exact same array length."],
  "anomalyAnalysis": ["Array of strings describing something unusual visually present"],
  "forensicInterpretation": "A narrative reconstruction of what likely occurred.",
  "threatAssessment": {
    "level": "STRING: MUST BE ONE OF: CRITICAL, HIGH, MEDIUM, LOW, MINIMAL",
    "score": <number 0-100 indicating confidence of threat level>,
    "factors": ["Array of key risk factors"]
  },
  "recommendedActions": ["Array of 4-6 specific investigation steps"],
  "crimeType": "Most likely category: 'Assault', 'Burglary', 'Suspicious Activity', etc.",
  "confidence": <number 0-100>
}

IMPORTANT: Respond strictly with ONLY a valid, raw JSON object, no markdown codeblocks, no extra text.`;

    const chatCompletion = await groq.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ]
        },
      ],
      temperature: 0.2,
    });

    const textResponse = chatCompletion.choices[0].message.content;
    const cleaned = textResponse.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Groq JSON Parse Error. Raw Output:", textResponse);
      throw new Error("Failed to parse the Groq LLM response as JSON");
    }

  } catch (error) {
    console.error("Groq API Error:", error);
    return getMockAnalysis();
  }
}

function getMockAnalysis() {
  return {
    "sceneOverview": "This is a mock analysis generated because the Groq API key failed. The scene appears to involve a dimly lit alleyway during nighttime.",
    "detectedElements": ["A dark sedan parked erratically on the right side.", "A discarded backpack near the left wall."],
    "refinedClassNames": [],
    "anomalyAnalysis": ["The car doors are left open, suggesting a hasty departure or confrontation."],
    "forensicInterpretation": "Given the open vehicle doors and discarded items, a sudden altercation or rapid escape likely occurred.",
    "threatAssessment": { "level": "HIGH", "score": 75, "factors": ["Abandoned vehicle in suspicious state"] },
    "recommendedActions": ["Secure the vehicle perimeter.", "Canvass the area for potential witnesses or CCTV."],
    "crimeType": "Suspicious Activity",
    "confidence": 85
  };
}

module.exports = { analyzeScene };
