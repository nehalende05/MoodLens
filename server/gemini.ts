import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EmotionType, WellnessRecommendation } from "@shared/schema";

// Only create Gemini client if API key is available
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const fallbackRecommendations: Record<EmotionType, WellnessRecommendation[]> = {
  happy: [
    {
      id: "1",
      type: "affirmation",
      title: "Embrace the Joy",
      description: "Take a moment to appreciate what's making you happy right now.",
      priority: 1,
    },
    {
      id: "2",
      type: "stretch",
      title: "Energizing Stretch",
      description: "Channel your positive energy with a quick stretch routine.",
      duration: 5,
      priority: 2,
    },
  ],
  sad: [
    {
      id: "3",
      type: "breathing",
      title: "Calming Breaths",
      description: "Deep breathing can help ease sadness and bring clarity.",
      duration: 4,
      priority: 1,
    },
    {
      id: "4",
      type: "affirmation",
      title: "Self-Compassion",
      description: "Remember: It's okay to feel this way. You are doing your best.",
      priority: 2,
    },
  ],
  angry: [
    {
      id: "5",
      type: "breathing",
      title: "Cool Down Breaths",
      description: "Slow, deep breaths can help release tension and anger.",
      duration: 5,
      priority: 1,
    },
    {
      id: "6",
      type: "break",
      title: "Take a Break",
      description: "Step away for a moment. A short walk can help clear your mind.",
      duration: 10,
      priority: 2,
    },
  ],
  neutral: [
    {
      id: "7",
      type: "meditation",
      title: "Mindful Moment",
      description: "Use this calm state for a brief mindfulness practice.",
      duration: 5,
      priority: 1,
    },
    {
      id: "8",
      type: "stretch",
      title: "Gentle Movement",
      description: "Light stretching can help maintain your balanced state.",
      duration: 3,
      priority: 2,
    },
  ],
  fearful: [
    {
      id: "9",
      type: "breathing",
      title: "Grounding Breaths",
      description: "Focus on your breath to feel more grounded and secure.",
      duration: 5,
      priority: 1,
    },
    {
      id: "10",
      type: "affirmation",
      title: "You Are Safe",
      description: "Remind yourself: You are safe in this moment. This feeling will pass.",
      priority: 2,
    },
  ],
  surprised: [
    {
      id: "11",
      type: "breathing",
      title: "Centering Breaths",
      description: "Take a moment to center yourself after the surprise.",
      duration: 3,
      priority: 1,
    },
    {
      id: "12",
      type: "break",
      title: "Process the Moment",
      description: "Give yourself time to process what just happened.",
      duration: 5,
      priority: 2,
    },
  ],
  disgusted: [
    {
      id: "13",
      type: "breathing",
      title: "Fresh Start",
      description: "Clear your mind with calming breaths.",
      duration: 4,
      priority: 1,
    },
    {
      id: "14",
      type: "break",
      title: "Change of Scenery",
      description: "A brief change of environment can help shift your mood.",
      duration: 5,
      priority: 2,
    },
  ],
};

export async function getWellnessRecommendations(
  currentEmotion: EmotionType,
  recentEmotions: EmotionType[],
  sessionDuration: number
): Promise<WellnessRecommendation[]> {
  if (!genAI) {
    console.log("Gemini API key not configured, using fallback recommendations");
    return fallbackRecommendations[currentEmotion] || fallbackRecommendations.neutral;
  }

  try {
    const emotionPattern = recentEmotions.join(", ");
    const durationMinutes = Math.floor(sessionDuration / 60000);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a mental wellness AI assistant. Based on the user's emotional state, provide 2-3 personalized wellness recommendations. Each recommendation should be actionable, calming, and appropriate for the detected emotion.

Current emotion: ${currentEmotion}
Recent emotion pattern: ${emotionPattern}
Session duration: ${durationMinutes} minutes

Please provide personalized wellness recommendations in the following JSON format:
{
  "recommendations": [
    {
      "type": "breathing" | "meditation" | "break" | "affirmation" | "stretch",
      "title": "Short, engaging title",
      "description": "Brief, supportive description (max 100 chars)",
      "duration": number (optional, in minutes),
      "priority": 1-5
    }
  ]
}

Return only valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error("No content in response");
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    
    const parsed = JSON.parse(jsonContent);
    const recommendations: WellnessRecommendation[] = parsed.recommendations.map(
      (rec: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        duration: rec.duration,
        priority: rec.priority || index + 1,
      })
    );

    return recommendations;
  } catch (error) {
    console.error("Gemini API error:", error);
    return fallbackRecommendations[currentEmotion] || fallbackRecommendations.neutral;
  }
}

export async function getCompanionMessage(emotionDescription: string): Promise<string> {
  if (!genAI) {
    return (
      "Your AI companion is currently sleeping because no Gemini API key is configured. " +
      "Add an API key to unlock personalized emotional support."
    );
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a kind emotional wellness coach. Respond in a warm, friendly tone in 1-2 sentences, offering empathy and a simple, gentle action like breathing, walking, listening to music, journaling, or calling a friend. Avoid medical advice and keep it light and supportive.

The user describes their current emotional state as: "${emotionDescription}".

Please provide a supportive, empathetic response in 1-2 sentences.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error("No content in AI response");
    }
    return content.trim();
  } catch (error) {
    console.error("Gemini companion error:", error);
    return "I'm having a little trouble thinking right now, but remember: slowing down, breathing deeply, and being kind to yourself is always a good next step. 💖";
  }
}

