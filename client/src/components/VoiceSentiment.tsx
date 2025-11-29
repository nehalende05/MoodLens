import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Mic, MicOff, Sparkles } from "lucide-react";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function VoiceSentiment() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setIsRecording(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setError(
        event.error === "not-allowed"
          ? "Microphone access was blocked. Please allow microphone permissions in your browser."
          : "Could not recognize voice. Please try again in a quiet environment."
      );
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition as SpeechRecognition;

    return () => {
      recognition.stop?.();
      recognitionRef.current = null;
    };
  }, []);

  const handleToggleRecording = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    setError(null);

    if (!isRecording) {
      setTranscript(null);
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, isSupported]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Voice Sentiment (Optional)
          </CardTitle>
          {isSupported && (
            <Badge
              variant="outline"
              className={`text-xs ${
                isRecording
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-muted/50 text-muted-foreground border-border/60"
              }`}
            >
              {isRecording ? "Listening..." : "Ready"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported && isSupported !== null && (
          <div className="flex items-start gap-2 rounded-md border border-dashed border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-[2px] text-destructive" />
            <p>
              Voice recognition is not supported in this browser. Try Chrome or Edge on desktop to
              use this feature.
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Record a short voice note about your day. We&apos;ll transcribe what you say so you can
          reflect on your tone and feelings.
        </p>

        <Button
          type="button"
          onClick={handleToggleRecording}
          disabled={!isSupported || !recognitionRef.current}
          className="w-full"
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Record Voice Sample
            </>
          )}
        </Button>

        {transcript && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
            <p className="text-xs font-medium text-muted-foreground mb-1">You said:</p>
            <p className="text-foreground leading-relaxed">&ldquo;{transcript}&rdquo;</p>
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



