
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, AlertTriangle, Pause, Play } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface RecorderProps {
  onComplete: (blob: Blob) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [supportedMimeType, setSupportedMimeType] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingSegmentsRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const MAX_RECORDING_TIME = 120; // 2 minutes in seconds

  // Detect supported audio format
  useEffect(() => {
    const detectSupportedFormat = () => {
      const formats = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/wav'
      ];
      
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(format)) {
          console.log('Detected supported audio format:', format);
          setSupportedMimeType(format);
          return;
        }
      }
      
      // Fallback
      console.warn('No explicitly supported format found, using default');
      setSupportedMimeType('audio/webm');
    };
    
    detectSupportedFormat();
  }, []);
  
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
      
      // Reset segments and chunks for new recording
      recordingSegmentsRef.current = [];
      audioChunksRef.current = [];
      
      // Create media recorder with detected format
      const options = supportedMimeType ? { mimeType: supportedMimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      console.log('MediaRecorder created with mimeType:', mediaRecorder.mimeType);
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk received, size:', event.data.size);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from current chunks and add to segments
        if (audioChunksRef.current.length > 0) {
          const actualMimeType = mediaRecorder.mimeType || supportedMimeType || 'audio/webm';
          const segmentBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
          console.log('Created segment blob, size:', segmentBlob.size, 'type:', actualMimeType);
          recordingSegmentsRef.current.push(segmentBlob);
          audioChunksRef.current = [];
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
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
  
  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.stop();
      setIsPaused(true);
      
      // Keep timer running but pause recording
      console.log('Recording paused at', recordingTime, 'seconds');
    }
  };
  
  // Resume recording
  const resumeRecording = async () => {
    if (streamRef.current && isPaused) {
      try {
        // Create new media recorder for the resumed segment
        const options = supportedMimeType ? { mimeType: supportedMimeType } : {};
        const mediaRecorder = new MediaRecorder(streamRef.current, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        // Set up event handlers
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log('Audio chunk received on resume, size:', event.data.size);
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          // Create blob from current chunks and add to segments
          if (audioChunksRef.current.length > 0) {
            const actualMimeType = mediaRecorder.mimeType || supportedMimeType || 'audio/webm';
            const segmentBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
            console.log('Created resumed segment blob, size:', segmentBlob.size, 'type:', actualMimeType);
            recordingSegmentsRef.current.push(segmentBlob);
            audioChunksRef.current = [];
          }
        };
        
        // Start the new segment
        mediaRecorder.start();
        setIsPaused(false);
        
        console.log('Recording resumed at', recordingTime, 'seconds');
        
      } catch (error) {
        console.error('Error resuming recording:', error);
        setRecordingError(`Could not resume recording: ${error.message}`);
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      if (!isPaused) {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Wait longer for mobile devices to process segments
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const timeout = isMobile ? 500 : 100;
      
      setTimeout(() => {
        mergeSegments();
      }, timeout);
    }
  };
  
  // Merge all recording segments into single blob
  const mergeSegments = () => {
    console.log('Merging', recordingSegmentsRef.current.length, 'segments');
    
    if (recordingSegmentsRef.current.length === 0) {
      console.error('No segments to merge');
      setRecordingError('No audio data recorded. Please try again.');
      return;
    }
    
    // Validate that segments have data
    const validSegments = recordingSegmentsRef.current.filter(segment => segment.size > 0);
    if (validSegments.length === 0) {
      console.error('All segments are empty');
      setRecordingError('No valid audio data recorded. Please try again.');
      return;
    }
    
    console.log('Valid segments:', validSegments.length, 'Total size:', validSegments.reduce((sum, s) => sum + s.size, 0));
    
    // Use the MIME type from the first valid segment or fallback
    const firstSegment = validSegments[0];
    const mimeType = firstSegment.type || supportedMimeType || 'audio/webm';
    
    // Merge all valid segments
    const mergedBlob = new Blob(validSegments, { type: mimeType });
    console.log('Merged blob created, size:', mergedBlob.size, 'type:', mimeType);
    
    if (mergedBlob.size === 0) {
      console.error('Merged blob is empty');
      setRecordingError('Failed to create audio file. Please try again.');
      return;
    }
    
    setAudioBlob(mergedBlob);
    console.log('Final audio blob created, size:', mergedBlob.size, 'type:', mergedBlob.type);
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
            isRecording && !isPaused
              ? 'bg-red-100 animate-pulse' 
              : isPaused
                ? 'bg-yellow-100'
                : audioBlob 
                  ? 'bg-green-100' 
                  : 'bg-blue-100'
          }`}>
            <div className={`absolute inset-0 rounded-full ${
              isRecording && !isPaused ? 'animate-ping bg-red-400 opacity-25' : 'opacity-0'
            }`}></div>
            
            <Button 
              className={`w-32 h-32 rounded-full ${
                isRecording && !isPaused
                  ? 'bg-red-500 hover:bg-red-600' 
                  : isPaused
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : audioBlob 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={
                !isRecording && !audioBlob 
                  ? startRecording 
                  : isPaused 
                    ? resumeRecording
                    : isRecording
                      ? pauseRecording
                      : undefined
              }
              disabled={permissionDenied || !!audioBlob}
            >
              {!isRecording && !audioBlob ? (
                <Mic className="h-12 w-12" />
              ) : isPaused ? (
                <Play className="h-12 w-12" />
              ) : isRecording ? (
                <Pause className="h-12 w-12" />
              ) : audioBlob ? (
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : null}
            </Button>
          </div>
          
          {(isRecording || isPaused) && (
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-2">{formatTime(recordingTime)}</div>
              <p className="text-sm text-gray-500">
                {isPaused ? 'Recording paused...' : 'Recording in progress...'}
              </p>
              
              <div className="w-full mt-4">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
                </p>
              </div>
              
              <div className="flex gap-3 mt-4">
                {!isPaused ? (
                  <Button 
                    variant="outline"
                    onClick={pauseRecording}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={resumeRecording}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  onClick={stopRecording}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              </div>
            </div>
          )}
          
          {!isRecording && !isPaused && !audioBlob && (
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
          
          {!isRecording && !isPaused && audioBlob && (
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Recording Complete</h3>
              <p className="text-gray-500 mb-4">
                {formatTime(recordingTime)} of audio recorded ({(audioBlob.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
              
              <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={() => {
                  setAudioBlob(null);
                  setRecordingTime(0);
                  recordingSegmentsRef.current = [];
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
          <li>Use pause/resume if you need to think or check details</li>
        </ul>
      </div>
    </div>
  );
};

export default Recorder;
