
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { detectSupportedAudioFormat, getFileExtension } from "../utils/audioRecordingUtils";

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [supportedMimeType, setSupportedMimeType] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingSegmentsRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  // Detect supported audio format
  useEffect(() => {
    const detectedFormat = detectSupportedAudioFormat();
    setSupportedMimeType(detectedFormat);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      recordingSegmentsRef.current = [];
      audioChunksRef.current = [];
      
      const options = supportedMimeType ? { mimeType: supportedMimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      console.log('MediaRecorder created with mimeType:', mediaRecorder.mimeType);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk received, size:', event.data.size);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const actualMimeType = mediaRecorder.mimeType || supportedMimeType || 'audio/webm';
          const segmentBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
          console.log('Created segment blob, size:', segmentBlob.size, 'type:', actualMimeType);
          recordingSegmentsRef.current.push(segmentBlob);
          audioChunksRef.current = [];
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.stop();
      setIsPaused(true);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      console.log('Recording paused at', recordingTime, 'seconds');
    }
  };
  
  const resumeRecording = async () => {
    if (streamRef.current && isPaused) {
      try {
        const options = supportedMimeType ? { mimeType: supportedMimeType } : {};
        const mediaRecorder = new MediaRecorder(streamRef.current, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log('Audio chunk received on resume, size:', event.data.size);
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const actualMimeType = mediaRecorder.mimeType || supportedMimeType || 'audio/webm';
            const segmentBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
            console.log('Created resumed segment blob, size:', segmentBlob.size, 'type:', actualMimeType);
            recordingSegmentsRef.current.push(segmentBlob);
            audioChunksRef.current = [];
          }
        };
        
        mediaRecorder.start();
        setIsPaused(false);
        
        recordingTimerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        console.log('Recording resumed at', recordingTime, 'seconds');
        
      } catch (error) {
        console.error('Error resuming recording:', error);
        toast({
          title: "Resume failed",
          description: "Could not resume recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      if (!isPaused) {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const timeout = isMobile ? 500 : 100;
      
      setTimeout(() => {
        mergeSegments();
      }, timeout);
      
      toast({
        title: "Recording stopped",
        description: `Recorded ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
      });
    }
  };
  
  const mergeSegments = () => {
    console.log('Merging', recordingSegmentsRef.current.length, 'segments');
    
    if (recordingSegmentsRef.current.length === 0) {
      console.error('No segments to merge');
      toast({
        title: "Recording error",
        description: "No audio data recorded. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const validSegments = recordingSegmentsRef.current.filter(segment => segment.size > 0);
    if (validSegments.length === 0) {
      console.error('All segments are empty');
      toast({
        title: "Recording error", 
        description: "No valid audio data recorded. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Valid segments:', validSegments.length, 'Total size:', validSegments.reduce((sum, s) => sum + s.size, 0));
    
    const firstSegment = validSegments[0];
    const mimeType = firstSegment.type || supportedMimeType || 'audio/webm';
    const extension = getFileExtension(mimeType);
    
    const mergedBlob = new Blob(validSegments, { type: mimeType });
    console.log('Merged blob created, size:', mergedBlob.size, 'type:', mimeType);
    
    if (mergedBlob.size === 0) {
      console.error('Merged blob is empty');
      toast({
        title: "Recording error",
        description: "Failed to create audio file. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const audioFile = new File([mergedBlob], `recording${extension}`, { type: mimeType });
    setAudioFile(audioFile);
    console.log('Final audio file created:', audioFile.name, 'size:', audioFile.size, 'type:', audioFile.type);
  };

  const clearRecording = () => {
    setAudioFile(null);
    setRecordingTime(0);
    recordingSegmentsRef.current = [];
  };

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioFile,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    setAudioFile
  };
};
