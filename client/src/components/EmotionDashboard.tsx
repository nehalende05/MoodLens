import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, TrendingUp, Brain } from "lucide-react";
import type { EmotionEntry, EmotionType } from "@shared/schema";

interface EmotionDashboardProps {
  emotions: EmotionEntry[];
  sessionStartTime: number | null;
}

const emotionColors: Record<EmotionType, { bg: string; text: string; glow: string }> = {
  happy: { bg: "bg-yellow-500/20", text: "text-yellow-300", glow: "shadow-yellow-500/30" },
  sad: { bg: "bg-blue-500/20", text: "text-blue-300", glow: "shadow-blue-500/30" },
  angry: { bg: "bg-red-500/20", text: "text-red-300", glow: "shadow-red-500/30" },
  neutral: { bg: "bg-slate-500/20", text: "text-slate-300", glow: "shadow-slate-500/30" },
  fearful: { bg: "bg-purple-500/20", text: "text-purple-300", glow: "shadow-purple-500/30" },
  surprised: { bg: "bg-orange-500/20", text: "text-orange-300", glow: "shadow-orange-500/30" },
  disgusted: { bg: "bg-green-500/20", text: "text-green-300", glow: "shadow-green-500/30" },
};

const emotionIcons: Record<EmotionType, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  fearful: "😨",
  surprised: "😲",
  disgusted: "🤢",
};

export function EmotionDashboard({ emotions, sessionStartTime }: EmotionDashboardProps) {
  const stats = useMemo(() => {
    if (emotions.length === 0) {
      return {
        dominantEmotion: null,
        emotionCounts: {} as Record<EmotionType, number>,
        averageConfidence: 0,
        recentEmotions: [] as EmotionEntry[],
        totalDetections: 0,
      };
    }

    const emotionCounts: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      neutral: 0,
      fearful: 0,
      surprised: 0,
      disgusted: 0,
    };

    let totalConfidence = 0;

    emotions.forEach((entry) => {
      emotionCounts[entry.emotion]++;
      totalConfidence += entry.confidence;
    });

    const dominantEmotion = Object.entries(emotionCounts).reduce(
      (max, [emotion, count]) =>
        count > (emotionCounts[max as EmotionType] || 0) ? (emotion as EmotionType) : max,
      "neutral" as EmotionType
    );

    const recentEmotions = emotions.slice(-10).reverse();

    return {
      dominantEmotion,
      emotionCounts,
      averageConfidence: totalConfidence / emotions.length,
      recentEmotions,
      totalDetections: emotions.length,
    };
  }, [emotions]);

  const sessionDuration = useMemo(() => {
    if (!sessionStartTime) return "0:00";
    const seconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, [sessionStartTime]);

  const maxCount = Math.max(...Object.values(stats.emotionCounts), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card/80 backdrop-blur-sm border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dominant Mood</p>
                {stats.dominantEmotion ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emotionIcons[stats.dominantEmotion]}</span>
                    <span className="font-medium capitalize" data-testid="text-dominant-emotion">
                      {stats.dominantEmotion}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">--</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Session Time</p>
                <span className="font-medium font-mono" data-testid="text-session-duration">
                  {sessionDuration}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
                <span className="font-medium" data-testid="text-avg-confidence">
                  {stats.averageConfidence > 0
                    ? `${Math.round(stats.averageConfidence * 100)}%`
                    : "--"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Detections</p>
                <span className="font-medium" data-testid="text-total-detections">
                  {stats.totalDetections}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Emotion Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.entries(emotionIcons) as [EmotionType, string][]).map(([emotion, icon]) => {
            const count = stats.emotionCounts[emotion] || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={emotion} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="capitalize text-muted-foreground">{emotion}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${emotionColors[emotion].bg}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {stats.recentEmotions.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.recentEmotions.map((entry, index) => (
                <Badge
                  key={entry.id}
                  variant="outline"
                  className={`${emotionColors[entry.emotion].bg} ${emotionColors[entry.emotion].text} transition-all`}
                  style={{ opacity: 1 - index * 0.08 }}
                  data-testid={`badge-recent-emotion-${index}`}
                >
                  {emotionIcons[entry.emotion]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
