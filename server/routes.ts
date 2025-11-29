import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getWellnessRecommendations, getCompanionMessage } from "./gemini";
import { insertEmotionSchema, aiRecommendationRequestSchema, emotionTypes } from "@shared/schema";
import type { EmotionType } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/emotions", async (req, res) => {
    try {
      const schema = z.object({
        emotions: z.array(insertEmotionSchema),
        sessionId: z.string(),
      });

      const { emotions, sessionId } = schema.parse(req.body);

      let session = await storage.getSession(sessionId);
      if (!session) {
        session = await storage.createSession(sessionId);
      }

      const savedEmotions = await Promise.all(
        emotions.map((emotion) => storage.createEmotionEntry(sessionId, emotion))
      );

      res.json({ success: true, count: savedEmotions.length });
    } catch (error) {
      console.error("Error saving emotions:", error);
      res.status(400).json({ error: "Invalid emotion data" });
    }
  });

  app.get("/api/emotions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const emotions = await storage.getEmotionsBySession(sessionId);
      res.json(emotions);
    } catch (error) {
      console.error("Error fetching emotions:", error);
      res.status(500).json({ error: "Failed to fetch emotions" });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      const currentEmotion = (req.query.currentEmotion as string) || "neutral";
      const recentEmotionsStr = (req.query.recentEmotions as string) || "";
      
      if (!emotionTypes.includes(currentEmotion as EmotionType)) {
        return res.status(400).json({ error: "Invalid emotion type" });
      }

      const recentEmotions = recentEmotionsStr
        .split(",")
        .filter((e) => emotionTypes.includes(e as EmotionType)) as EmotionType[];

      const sessionDuration = parseInt(req.query.sessionDuration as string) || 0;

      const recommendations = await getWellnessRecommendations(
        currentEmotion as EmotionType,
        recentEmotions,
        sessionDuration
      );

      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const emotions = await storage.getEmotionsBySession(req.params.id);
      res.json({ ...session, emotions });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: Date.now() });
  });

  app.post("/api/companion", async (req, res) => {
    try {
      const schema = z.object({
        emotion: z.string().min(1).max(200),
      });

      const { emotion } = schema.parse(req.body);
      const message = await getCompanionMessage(emotion);
      res.json({ message });
    } catch (error) {
      console.error("Error in companion endpoint:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  return httpServer;
}
