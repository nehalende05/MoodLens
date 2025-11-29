import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, CameraOff, Loader2, AlertCircle, Sparkles } from "lucide-react";
import type { EmotionType, EmotionEntry } from "@shared/schema";

interface EmotionMonitorProps {
  onEmotionDetected: (emotion: EmotionEntry) => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

const emotionColors: Record<EmotionType, string> = {
  happy: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  sad: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  angry: "bg-red-500/20 text-red-300 border-red-500/30",
  neutral: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  fearful: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  surprised: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  disgusted: "bg-green-500/20 text-green-300 border-green-500/30",
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

export function EmotionMonitor({
  onEmotionDetected,
  isMonitoring,
  onToggleMonitoring,
}: EmotionMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>(null);
  const [confidence, setConfidence] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load face detection models:", err);
      setError("Failed to load face detection models. Please refresh the page.");
      setIsLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please grant permission and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const detectEmotions = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== 4) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceExpressions();

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        if (ctx) {
          const box = resizedDetections.detection.box;
          ctx.strokeStyle = "hsl(265, 85%, 60%)";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          const landmarks = resizedDetections.landmarks;
          const positions = landmarks.positions;
          ctx.fillStyle = "hsl(200, 80%, 60%)";
          positions.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        const expressions = detections.expressions;
        const emotionMap: Record<string, EmotionType> = {
          happy: "happy",
          sad: "sad",
          angry: "angry",
          neutral: "neutral",
          fearful: "fearful",
          surprised: "surprised",
          disgusted: "disgusted",
        };

        let maxEmotion: EmotionType = "neutral";
        let maxConfidence = 0;

        Object.entries(expressions).forEach(([emotion, conf]) => {
          if (conf > maxConfidence && emotionMap[emotion]) {
            maxConfidence = conf;
            maxEmotion = emotionMap[emotion];
          }
        });

        setCurrentEmotion(maxEmotion);
        setConfidence(maxConfidence);

        if (maxConfidence > 0.3) {
          const emotionEntry: EmotionEntry = {
            id: crypto.randomUUID(),
            emotion: maxEmotion,
            confidence: maxConfidence,
            timestamp: Date.now(),
          };
          onEmotionDetected(emotionEntry);
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  }, [modelsLoaded, onEmotionDetected]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (isMonitoring && modelsLoaded) {
      startCamera();
      detectionIntervalRef.current = setInterval(detectEmotions, 500);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (!isMonitoring) {
        stopCamera();
        setCurrentEmotion(null);
        setConfidence(0);
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isMonitoring, modelsLoaded, startCamera, stopCamera, detectEmotions]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [stopCamera]);

  return (
    <Card className="relative overflow-visible bg-card/80 backdrop-blur-sm border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Emotion Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            {isMonitoring && (
              <Badge
                variant="outline"
                className="animate-pulse bg-green-500/20 text-green-300 border-green-500/30"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                Live
              </Badge>
            )}
            <Button
              size="sm"
              variant={isMonitoring ? "destructive" : "default"}
              onClick={onToggleMonitoring}
              disabled={isLoading}
              data-testid="button-toggle-monitoring"
            >
              {isMonitoring ? (
                <>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-background/50 border border-border">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading face detection models...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center space-y-3 p-4">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-sm text-destructive">{error}</p>
                <Button size="sm" onClick={loadModels} data-testid="button-retry-loading">
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!isMonitoring && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
              <div className="text-center space-y-3">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Click "Start" to begin emotion monitoring
                </p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            data-testid="video-webcam"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            data-testid="canvas-detection"
          />

          {currentEmotion && isMonitoring && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emotionIcons[currentEmotion]}</span>
                <Badge
                  variant="outline"
                  className={emotionColors[currentEmotion]}
                  data-testid="badge-current-emotion"
                >
                  {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-32">
                <Progress value={confidence * 100} className="h-2" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {currentEmotion && isMonitoring && (
          <div className="grid grid-cols-7 gap-1">
            {(Object.keys(emotionIcons) as EmotionType[]).map((emotion) => (
              <div
                key={emotion}
                className={`text-center p-2 rounded-md transition-all ${
                  emotion === currentEmotion
                    ? "bg-primary/20 scale-105"
                    : "bg-muted/30 opacity-50"
                }`}
              >
                <span className="text-lg">{emotionIcons[emotion]}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
