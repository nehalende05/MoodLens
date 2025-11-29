import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { StarryBackground } from "@/components/StarryBackground";
import { EmotionMonitor } from "@/components/EmotionMonitor";
import { EmotionDashboard } from "@/components/EmotionDashboard";
import { BreathingExercise } from "@/components/BreathingExercise";
import { MoodHistory } from "@/components/MoodHistory";
import { WellnessRecommendations } from "@/components/WellnessRecommendations";
import { VoiceSentiment } from "@/components/VoiceSentiment";
import { MoodCompanion } from "@/components/MoodCompanion";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EmotionEntry, EmotionType } from "@shared/schema";

export default function Dashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>(null);
  const breathingRef = useRef<HTMLDivElement>(null);

  const handleEmotionDetected = useCallback((emotion: EmotionEntry) => {
    setEmotions((prev) => [...prev, emotion]);
    setCurrentEmotion(emotion.emotion);
  }, []);

  const handleToggleMonitoring = useCallback(() => {
    setIsMonitoring((prev) => {
      if (!prev) {
        setSessionStartTime(Date.now());
        setEmotions([]);
        setCurrentEmotion(null);
      } else {
        setSessionStartTime(null);
      }
      return !prev;
    });
  }, []);

  const handleStartBreathing = useCallback(() => {
    breathingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const recentEmotions = emotions.slice(-20).map((e) => e.emotion);

  useEffect(() => {
    if (emotions.length > 0 && sessionStartTime) {
      const timer = setTimeout(async () => {
        try {
          await fetch("/api/emotions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              emotions: emotions.slice(-5),
              sessionId: sessionStartTime.toString(),
            }),
          });
        } catch (error) {
          console.error("Failed to sync emotions:", error);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [emotions, sessionStartTime]);

  return (
    <div className="min-h-screen relative">
      <StarryBackground />

      <Header isMonitoring={isMonitoring} sessionStartTime={sessionStartTime} />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <EmotionMonitor
              onEmotionDetected={handleEmotionDetected}
              isMonitoring={isMonitoring}
              onToggleMonitoring={handleToggleMonitoring}
            />

            <VoiceSentiment />

            <div ref={breathingRef}>
              <BreathingExercise />
            </div>
          </div>

          <ScrollArea className="lg:h-[calc(100vh-8rem)]">
            <div className="space-y-6 pr-4">
              <EmotionDashboard
                emotions={emotions}
                sessionStartTime={sessionStartTime}
              />

              <WellnessRecommendations
                currentEmotion={currentEmotion}
                recentEmotions={recentEmotions}
                onStartBreathing={handleStartBreathing}
              />

              <MoodCompanion currentEmotion={currentEmotion} />

              <MoodHistory emotions={emotions} />
            </div>
          </ScrollArea>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-center text-muted-foreground">
            MoodLens - AI-Powered Mental Wellness Monitor | All processing happens locally in
            your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
