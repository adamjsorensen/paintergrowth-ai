import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface RecorderProps {
  onComplete: (blob: Blob) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const MAX_RECORDING_TIME = 120; // 2 minutes in seconds
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start recording
  const startRecording = async () => {
    try {
      setRecordingError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop if we reach the maximum recording time
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setRecordingError('Microphone access denied. Please allow microphone access to record audio.');
      } else {
        setRecordingError(`Could not start recording: ${error.message}`);
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = (recordingTime / MAX_RECORDING_TIME) * 100;
  
  // Continue to next step
  const handleContinue = () => {
    if (audioBlob) {
      onComplete(audioBlob);
    }
  };

  return (
    <div className="space-y-6">
      {permissionDenied && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            Microphone access is required for voice recording. Please allow microphone access in your browser settings and reload the page.
          </AlertDescription>
        </Alert>
      )}
      
      {recordingError && !permissionDenied && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recording Error</AlertTitle>
          <AlertDescription>{recordingError}</AlertDescription>
        </Alert>
      )}
      
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center">
          <div className={`relative w-40 h-40 rounded-full flex items-center justify-center mb-6 ${
            isRecording 
              ? 'bg-red-100 animate-pulse' 
              : audioBlob 
                ? 'bg-green-100' 
                : 'bg-blue-100'
          }`}>
            <div className={`absolute inset-0 rounded-full ${
              isRecording ? 'animate-ping bg-red-400 opacity-25' : 'opacity-0'
            }`}></div>
            
            <Button 
              className={`w-32 h-32 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : audioBlob 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={permissionDenied || !!audioBlob}
            >
              {isRecording ? (
                <Square className="h-12 w-12" />
              ) : audioBlob ? (
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </Button>
          </div>
          
          {isRecording && (
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-2">{formatTime(recordingTime)}</div>
              <p className="text-sm text-gray-500">Recording in progress...</p>
              
              <div className="w-full mt-4">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
                </p>
              </div>
              
              <Button 
                variant="destructive" 
                className="mt-4"
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            </div>
          )}
          
          {!isRecording && !audioBlob && (
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Record Audio</h3>
              <p className="text-gray-500 mb-4">
                Click the microphone button to start recording your project description
              </p>
              
              {/* Additional standalone button for better clickability */}
              <Button 
                size="lg" 
                onClick={startRecording}
                disabled={permissionDenied}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-medium"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            </div>
          )}
          
          {!isRecording && audioBlob && (
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Recording Complete</h3>
              <p className="text-gray-500 mb-4">
                {formatTime(recordingTime)} of audio recorded
              </p>
              
              <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={() => {
                  setAudioBlob(null);
                  setRecordingTime(0);
                }}>
                  Record Again
                </Button>
                <Button onClick={handleContinue}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500">
        <p>Tips for best results:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Speak clearly and at a normal pace</li>
          <li>Mention room names, surfaces to be painted, and any special requirements</li>
          <li>Include approximate square footage if known</li>
          <li>Describe the current condition of the surfaces</li>
        </ul>
      </div>
    </div>
  );
};

export default Recorder;