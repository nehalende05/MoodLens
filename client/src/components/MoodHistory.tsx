import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, TrendingUp, Clock } from "lucide-react";
import type { EmotionEntry, EmotionType } from "@shared/schema";

interface MoodHistoryProps {
  emotions: EmotionEntry[];
}

const emotionIcons: Record<EmotionType, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  fearful: "😨",
  surprised: "😲",
  disgusted: "🤢",
};

const emotionColors: Record<EmotionType, string> = {
  happy: "bg-yellow-500",
  sad: "bg-blue-500",
  angry: "bg-red-500",
  neutral: "bg-slate-500",
  fearful: "bg-purple-500",
  surprised: "bg-orange-500",
  disgusted: "bg-green-500",
};

interface TimelineEntry {
  id: string;
  startTime: number;
  endTime: number;
  emotion: EmotionType;
  count: number;
  avgConfidence: number;
}

export function MoodHistory({ emotions }: MoodHistoryProps) {
  const timelineEntries = useMemo(() => {
    if (emotions.length === 0) return [];

    const entries: TimelineEntry[] = [];
    let currentEntry: TimelineEntry | null = null;

    const sortedEmotions = [...emotions].sort((a, b) => a.timestamp - b.timestamp);

    sortedEmotions.forEach((emotion) => {
      if (
        !currentEntry ||
        currentEntry.emotion !== emotion.emotion ||
        emotion.timestamp - currentEntry.endTime > 5000
      ) {
        if (currentEntry) {
          entries.push(currentEntry);
        }
        currentEntry = {
          id: emotion.id,
          startTime: emotion.timestamp,
          endTime: emotion.timestamp,
          emotion: emotion.emotion,
          count: 1,
          avgConfidence: emotion.confidence,
        };
      } else {
        currentEntry.endTime = emotion.timestamp;
        currentEntry.count++;
        currentEntry.avgConfidence =
          (currentEntry.avgConfidence * (currentEntry.count - 1) + emotion.confidence) /
          currentEntry.count;
      }
    });

    if (currentEntry) {
      entries.push(currentEntry);
    }

    return entries.reverse();
  }, [emotions]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: number, end: number) => {
    const seconds = Math.floor((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const emotionFlow = useMemo(() => {
    if (emotions.length < 2) return null;

    const recentEmotions = emotions.slice(-50);
    const uniqueEmotions = [...new Set(recentEmotions.map((e) => e.emotion))];

    return uniqueEmotions.slice(0, 5);
  }, [emotions]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-purple-400" />
          Mood History
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {emotionFlow && emotionFlow.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Emotion Flow</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {emotionFlow.map((emotion, index) => (
                <div key={`${emotion}-${index}`} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${emotionColors[emotion]}/20`}
                  >
                    <span className="text-sm">{emotionIcons[emotion]}</span>
                  </div>
                  {index < emotionFlow.length - 1 && (
                    <div className="w-4 h-0.5 bg-muted-foreground/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {timelineEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No mood history yet</p>
            <p className="text-xs mt-1">Start monitoring to track your emotions</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3 pr-4">
              {timelineEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative flex items-start gap-3 pl-6"
                  data-testid={`mood-history-entry-${index}`}
                >
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-primary/50" />
                  {index < timelineEntries.length - 1 && (
                    <div className="absolute left-[5px] top-5 w-0.5 h-full bg-muted/50" />
                  )}

                  <div className="flex-1 bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{emotionIcons[entry.emotion]}</span>
                        <span className="font-medium capitalize">{entry.emotion}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(entry.avgConfidence * 100)}% confidence
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatTime(entry.startTime)}</span>
                      <span>Duration: {formatDuration(entry.startTime, entry.endTime)}</span>
                      <span>{entry.count} detections</span>
                    </div>

                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${emotionColors[entry.emotion]} rounded-full`}
                        style={{ width: `${entry.avgConfidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
