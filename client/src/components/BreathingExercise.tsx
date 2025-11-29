import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wind, Play, Pause, RotateCcw, Sparkles } from "lucide-react";

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

interface BreathingExerciseProps {
  onComplete?: () => void;
}

const phaseConfig = {
  inhale: { duration: 4000, text: "Breathe In", color: "text-blue-400" },
  hold: { duration: 4000, text: "Hold", color: "text-purple-400" },
  exhale: { duration: 4000, text: "Breathe Out", color: "text-cyan-400" },
  rest: { duration: 2000, text: "Rest", color: "text-slate-400" },
};

const phaseSequence: BreathPhase[] = ["inhale", "hold", "exhale", "rest"];

export function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>("rest");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalCycles] = useState(4);

  const resetExercise = useCallback(() => {
    setIsActive(false);
    setCurrentPhase("rest");
    setPhaseProgress(0);
    setCycleCount(0);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const phaseDuration = phaseConfig[currentPhase].duration;
    const startTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / phaseDuration, 1);
      setPhaseProgress(progress);

      if (progress >= 1) {
        const currentIndex = phaseSequence.indexOf(currentPhase);
        const nextIndex = (currentIndex + 1) % phaseSequence.length;
        const nextPhase = phaseSequence[nextIndex];

        if (nextIndex === 0) {
          const newCycleCount = cycleCount + 1;
          if (newCycleCount >= totalCycles) {
            resetExercise();
            onComplete?.();
            return;
          }
          setCycleCount(newCycleCount);
        }

        setCurrentPhase(nextPhase);
        setPhaseProgress(0);
      } else {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, currentPhase, cycleCount, totalCycles, resetExercise, onComplete]);

  const getOrbScale = () => {
    if (!isActive) return 1;

    switch (currentPhase) {
      case "inhale":
        return 1 + phaseProgress * 0.5;
      case "hold":
        return 1.5;
      case "exhale":
        return 1.5 - phaseProgress * 0.5;
      case "rest":
        return 1;
      default:
        return 1;
    }
  };

  const getOrbOpacity = () => {
    if (!isActive) return 0.4;

    switch (currentPhase) {
      case "inhale":
        return 0.4 + phaseProgress * 0.4;
      case "hold":
        return 0.8;
      case "exhale":
        return 0.8 - phaseProgress * 0.4;
      case "rest":
        return 0.4;
      default:
        return 0.4;
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-card-border overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wind className="h-5 w-5 text-cyan-400" />
            Breathing Exercise
          </CardTitle>
          {isActive && (
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              {cycleCount + 1} / {totalCycles} cycles
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative flex items-center justify-center h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-32 h-32 rounded-full border border-primary/20"
                style={{
                  transform: `scale(${getOrbScale() * (1 + i * 0.3)})`,
                  opacity: getOrbOpacity() * (0.3 - i * 0.1),
                  transition: "transform 100ms linear, opacity 100ms linear",
                }}
              />
            ))}
          </div>

          <div
            className="relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-100"
            style={{
              transform: `scale(${getOrbScale()})`,
              background: `radial-gradient(circle, hsl(var(--primary) / ${getOrbOpacity()}) 0%, hsl(var(--accent) / ${getOrbOpacity() * 0.5}) 100%)`,
              boxShadow: `0 0 40px hsl(var(--primary) / ${getOrbOpacity() * 0.5}), 0 0 80px hsl(var(--accent) / ${getOrbOpacity() * 0.3})`,
            }}
            data-testid="breathing-orb"
          >
            <div className="text-center">
              {isActive ? (
                <>
                  <Sparkles className="h-6 w-6 mx-auto mb-1 text-white/80" />
                  <span className={`text-sm font-medium ${phaseConfig[currentPhase].color}`}>
                    {phaseConfig[currentPhase].text}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Ready</span>
              )}
            </div>
          </div>
        </div>

        {isActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Phase Progress</span>
              <span>{Math.round(phaseProgress * 100)}%</span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100"
                style={{ width: `${phaseProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setIsActive(!isActive)}
            variant={isActive ? "secondary" : "default"}
            className="gap-2"
            data-testid="button-toggle-breathing"
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </Button>
          {(isActive || cycleCount > 0) && (
            <Button
              onClick={resetExercise}
              variant="outline"
              className="gap-2"
              data-testid="button-reset-breathing"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Follow the orb: breathe in as it expands, hold, then breathe out as it contracts.
        </p>
      </CardContent>
    </Card>
  );
}
