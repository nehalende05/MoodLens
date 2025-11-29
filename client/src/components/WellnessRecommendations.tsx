import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Wind,
  Coffee,
  Sun,
  Heart,
  Zap,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import type { EmotionType, WellnessRecommendation } from "@shared/schema";

interface WellnessRecommendationsProps {
  currentEmotion: EmotionType | null;
  recentEmotions: EmotionType[];
  onStartBreathing: () => void;
}

const typeIcons: Record<WellnessRecommendation["type"], typeof Wind> = {
  breathing: Wind,
  meditation: Heart,
  break: Coffee,
  affirmation: Sun,
  stretch: Zap,
};

const typeColors: Record<WellnessRecommendation["type"], string> = {
  breathing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  meditation: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  break: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  affirmation: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  stretch: "bg-green-500/20 text-green-300 border-green-500/30",
};

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

export function WellnessRecommendations({
  currentEmotion,
  recentEmotions,
  onStartBreathing,
}: WellnessRecommendationsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: recommendations, isLoading, refetch } = useQuery<WellnessRecommendation[]>({
    queryKey: ["/api/recommendations", currentEmotion, recentEmotions.slice(-5).join(",")],
    enabled: !!currentEmotion,
    staleTime: 30000,
  });

  const displayRecommendations =
    recommendations || (currentEmotion ? fallbackRecommendations[currentEmotion] : []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAction = (recommendation: WellnessRecommendation) => {
    if (recommendation.type === "breathing") {
      onStartBreathing();
    }
  };

  if (!currentEmotion) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Wellness Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start monitoring to receive personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Wellness Guide
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh-recommendations"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          displayRecommendations.map((rec) => {
            const Icon = typeIcons[rec.type];
            return (
              <div
                key={rec.id}
                className="group p-4 rounded-lg bg-muted/30 border border-transparent hover:border-primary/20 transition-all"
                data-testid={`recommendation-${rec.id}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${typeColors[rec.type].split(" ").slice(0, 1).join(" ")}`}
                  >
                    <Icon className={`h-5 w-5 ${typeColors[rec.type].split(" ")[1]}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      {rec.duration && (
                        <Badge variant="outline" className="text-xs">
                          {rec.duration} min
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleAction(rec)}
                    data-testid={`button-start-${rec.id}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
