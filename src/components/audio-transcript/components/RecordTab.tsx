
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, FileAudio, Pause, Play, X } from "lucide-react";
import { formatTime } from "../utils/audioRecordingUtils";

interface RecordTabProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioFile: File | null;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
  onClear: () => void;
}

const RecordTab: React.FC<RecordTabProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  audioFile,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onClear
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
          isRecording && !isPaused
            ? 'bg-red-100 animate-pulse' 
            : isPaused
              ? 'bg-yellow-100'
              : 'bg-muted'
        }`}>
          <Mic className={`w-12 h-12 ${
            isRecording && !isPaused
              ? 'text-red-500' 
              : isPaused
                ? 'text-yellow-500'
                : 'text-muted-foreground'
          }`} />
        </div>
        
        {(isRecording || isPaused) ? (
          <div className="text-center mb-4">
            <div className="text-2xl font-bold">{formatTime(recordingTime)}</div>
            <p className="text-sm text-muted-foreground">
              {isPaused ? 'Recording paused...' : 'Recording in progress...'}
            </p>
            
            <div className="flex gap-3 mt-4">
              {!isPaused ? (
                <Button 
                  variant="outline"
                  onClick={onPauseRecording}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={onResumeRecording}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                onClick={onStopRecording}
              >
                Stop Recording
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Record Audio</h3>
            <Button 
              variant="default"
              size="lg"
              className="w-full max-w-xs"
              onClick={onStartRecording}
            >
              Start Recording
            </Button>
          </div>
        )}
      </div>
      
      {audioFile && !isRecording && !isPaused && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileAudio className="w-5 h-5 mr-2 text-primary" />
              <span className="font-medium">{audioFile.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                {formatTime(recordingTime)} - {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordTab;
