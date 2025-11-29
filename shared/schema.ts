import { z } from "zod";

export const emotionTypes = ["happy", "sad", "angry", "neutral", "fearful", "surprised", "disgusted"] as const;
export type EmotionType = typeof emotionTypes[number];

export const emotionEntrySchema = z.object({
  id: z.string(),
  emotion: z.enum(emotionTypes),
  confidence: z.number().min(0).max(1),
  timestamp: z.number(),
});

export type EmotionEntry = z.infer<typeof emotionEntrySchema>;

export const insertEmotionSchema = emotionEntrySchema.omit({ id: true });
export type InsertEmotion = z.infer<typeof insertEmotionSchema>;

export const moodSessionSchema = z.object({
  id: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  emotions: z.array(emotionEntrySchema),
  dominantEmotion: z.enum(emotionTypes).optional(),
  averageConfidence: z.number().min(0).max(1).optional(),
});

export type MoodSession = z.infer<typeof moodSessionSchema>;

export const wellnessRecommendationSchema = z.object({
  id: z.string(),
  type: z.enum(["breathing", "meditation", "break", "affirmation", "stretch"]),
  title: z.string(),
  description: z.string(),
  duration: z.number().optional(),
  priority: z.number().min(1).max(5),
});

export type WellnessRecommendation = z.infer<typeof wellnessRecommendationSchema>;

export const aiRecommendationRequestSchema = z.object({
  currentEmotion: z.enum(emotionTypes),
  recentEmotions: z.array(z.enum(emotionTypes)),
  sessionDuration: z.number(),
});

export type AIRecommendationRequest = z.infer<typeof aiRecommendationRequestSchema>;

export const users = {
  id: "",
  username: "",
  password: "",
};

export type User = typeof users;
export type InsertUser = Omit<User, "id">;
