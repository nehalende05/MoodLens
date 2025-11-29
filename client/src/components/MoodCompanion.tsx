import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, HeartHandshake, Loader2, Sparkles } from "lucide-react";
import type { EmotionType } from "@shared/schema";

interface MoodCompanionProps {
  currentEmotion: EmotionType | null;
}

export function MoodCompanion({ currentEmotion }: MoodCompanionProps) {
  const [manualEmotion, setManualEmotion] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emotionPlaceholder =
    currentEmotion && !manualEmotion
      ? `Detected: ${currentEmotion}. You can override or describe it in your own words.`
      : "Describe how you feel (e.g., sad, anxious but hopeful, overwhelmed).";

  const handleSubmit = async () => {
    const emotionText = manualEmotion.trim() || currentEmotion;

    if (!emotionText) {
      setError("Please describe how you feel or start monitoring to detect an emotion.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion: emotionText }),
      });

      if (!res.ok) {
        throw new Error("Failed to get AI suggestion");
      }

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while talking to the AI companion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartHandshake className="h-5 w-5 text-primary" />
            MoodLens Companion
          </CardTitle>
          {currentEmotion && (
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 flex items-center gap-1 text-xs"
            >
              <Sparkles className="h-3 w-3" />
              Live mood linked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share how you&apos;re feeling in a few words. Your AI companion will respond in a warm,
          gentle tone with a simple wellness suggestion.
        </p>

        <Input
          value={manualEmotion}
          onChange={(e) => setManualEmotion(e.target.value)}
          placeholder={emotionPlaceholder}
          className="text-sm"
        />

        <Button type="button" className="w-full" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting your suggestion...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Suggestion
            </>
          )}
        </Button>

        {message && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm leading-relaxed">
            {message}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 mt-[2px]" />
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



