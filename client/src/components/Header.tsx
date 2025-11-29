import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Settings, Clock, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HeaderProps {
  isMonitoring: boolean;
  sessionStartTime: number | null;
}

export function Header({ isMonitoring, sessionStartTime }: HeaderProps) {
  const [sessionDuration, setSessionDuration] = useState("0:00");

  useEffect(() => {
    if (!sessionStartTime || !isMonitoring) {
      setSessionDuration("0:00");
      return;
    }

    const updateDuration = () => {
      const seconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        setSessionDuration(
          `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        );
      } else {
        setSessionDuration(`${minutes}:${secs.toString().padStart(2, "0")}`);
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime, isMonitoring]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Moon className="h-8 w-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gradient-primary">MoodLens</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI Wellness Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMonitoring && (
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 gap-2"
            >
              <Clock className="h-3 w-3" />
              <span className="font-mono" data-testid="text-header-session-time">
                {sessionDuration}
              </span>
            </Badge>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-about">
                <Info className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-card-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" />
                  About MoodLens
                </DialogTitle>
                <DialogDescription className="space-y-4 pt-4">
                  <p>
                    MoodLens is an AI-based mental wellness monitoring system that detects early
                    signs of stress, fatigue, and low mood using real-time facial expression
                    analysis.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">How it works:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Real-time emotion detection using your webcam</li>
                      <li>AI-powered wellness recommendations</li>
                      <li>Interactive breathing exercises for stress relief</li>
                      <li>Mood history tracking and visualization</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Privacy:</h4>
                    <p className="text-sm">
                      All facial analysis is performed locally in your browser. No video or
                      images are stored or transmitted.
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-settings">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-card-border">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Detection Sensitivity</p>
                        <p className="text-sm text-muted-foreground">
                          Higher sensitivity may detect subtle expressions
                        </p>
                      </div>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Privacy Mode</p>
                        <p className="text-sm text-muted-foreground">
                          All processing happens locally
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-300">
                        Enabled
                      </Badge>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
