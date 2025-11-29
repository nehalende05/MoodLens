import type { EmotionEntry, InsertEmotion, MoodSession, WellnessRecommendation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createEmotionEntry(sessionId: string, emotion: InsertEmotion): Promise<EmotionEntry>;
  getEmotionsBySession(sessionId: string): Promise<EmotionEntry[]>;
  createSession(id: string): Promise<MoodSession>;
  getSession(id: string): Promise<MoodSession | undefined>;
  updateSession(id: string, updates: Partial<MoodSession>): Promise<MoodSession | undefined>;
  getAllSessions(): Promise<MoodSession[]>;
  getRecentEmotions(limit: number): Promise<EmotionEntry[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, MoodSession>;
  private emotions: Map<string, EmotionEntry[]>;

  constructor() {
    this.sessions = new Map();
    this.emotions = new Map();
  }

  async createEmotionEntry(sessionId: string, emotion: InsertEmotion): Promise<EmotionEntry> {
    const id = randomUUID();
    const entry: EmotionEntry = { ...emotion, id };

    const sessionEmotions = this.emotions.get(sessionId) || [];
    sessionEmotions.push(entry);
    this.emotions.set(sessionId, sessionEmotions);

    return entry;
  }

  async getEmotionsBySession(sessionId: string): Promise<EmotionEntry[]> {
    return this.emotions.get(sessionId) || [];
  }

  async createSession(id: string): Promise<MoodSession> {
    const session: MoodSession = {
      id,
      startTime: Date.now(),
      emotions: [],
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<MoodSession | undefined> {
    return this.sessions.get(id);
  }

  async updateSession(id: string, updates: Partial<MoodSession>): Promise<MoodSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  async getAllSessions(): Promise<MoodSession[]> {
    return Array.from(this.sessions.values());
  }

  async getRecentEmotions(limit: number): Promise<EmotionEntry[]> {
    const allEmotions: EmotionEntry[] = [];
    for (const emotions of this.emotions.values()) {
      allEmotions.push(...emotions);
    }
    return allEmotions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
