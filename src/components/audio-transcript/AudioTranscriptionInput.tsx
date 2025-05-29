
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, FileAudio, Loader2, Check, X, AlertCircle, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioTranscriptionInputProps {
  onTranscriptionComplete: (transcript: string) => void;
  onInformationExtracted: (extractedData: Record<string, any>) => void;
}

const AudioTranscriptionInput: React.FC<AudioTranscriptionInputProps> = ({
  onTranscriptionComplete,
  onInformationExtracted
}) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingSegmentsRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

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

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Reset segments and chunks for new recording
      recordingSegmentsRef.current = [];
      audioChunksRef.current = [];
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from current chunks and add to segments
        if (audioChunksRef.current.length > 0) {
          const segmentBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
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

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.stop();
      setIsPaused(true);
      
      // Stop the timer when pausing
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      console.log('Recording paused at', recordingTime, 'seconds');
    }
  };
  
  // Resume recording
  const resumeRecording = async () => {
    if (streamRef.current && isPaused) {
      try {
        // Create new media recorder for the resumed segment
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        // Set up event handlers
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          // Create blob from current chunks and add to segments
          if (audioChunksRef.current.length > 0) {
            const segmentBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            recordingSegmentsRef.current.push(segmentBlob);
            audioChunksRef.current = [];
          }
        };
        
        // Start the new segment
        mediaRecorder.start();
        setIsPaused(false);
        
        // Restart the timer from current time
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

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      if (!isPaused) {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      // Clear the recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Wait a moment for the final segment to be processed, then merge
      setTimeout(() => {
        mergeSegments();
      }, 100);
      
      toast({
        title: "Recording stopped",
        description: `Recorded ${formatTime(recordingTime)}`,
      });
    }
  };
  
  // Merge all recording segments into single blob
  const mergeSegments = () => {
    if (recordingSegmentsRef.current.length > 0) {
      const mergedBlob = new Blob(recordingSegmentsRef.current, { type: 'audio/wav' });
      const audioFile = new File([mergedBlob], "recording.wav", { type: 'audio/wav' });
      setAudioFile(audioFile);
      console.log('Merged', recordingSegmentsRef.current.length, 'segments into final audio blob');
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Audio file must be less than 25MB",
          variant: "destructive",
        });
        return;
      }
      
      setAudioFile(file);
      setUploadError(null);
      toast({
        title: "File uploaded",
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Transcribe audio file
  const transcribeAudio = async () => {
    if (!audioFile) {
      toast({
        title: "No audio file",
        description: "Please record or upload an audio file first",
        variant: "destructive",
      });
      return;
    }
    
    setIsTranscribing(true);
    setTranscriptionProgress(0);
    setUploadError(null);
    
    try {
      // First upload the file to Supabase storage
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      // Convert file to base64
      const base64Data = await fileToBase64(audioFile);
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      setIsUploading(false);
      
      // Simulate progress updates for transcription
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);
      
      // Call the transcribe-audio edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audioBase64: base64Data }
      });
      
      clearInterval(progressInterval);
      
      if (error) {
        throw new Error(error.message || "Transcription failed");
      }
      
      if (!data || !data.text) {
        throw new Error("No transcription returned");
      }
      
      setTranscriptionProgress(100);
      setTranscript(data.text);
      onTranscriptionComplete(data.text);
      
      toast({
        title: "Transcription complete",
        description: "Your audio has been transcribed successfully",
      });
      
      // Automatically start information extraction
      extractInformation(data.text);
    } catch (error) {
      console.error("Transcription error:", error);
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred");
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "An error occurred during transcription",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      setIsUploading(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Extract information from transcript
  const extractInformation = async (text: string) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);
      
      // Call the extract-information edge function
      const { data, error } = await supabase.functions.invoke('extract-information', {
        body: { transcript: text }
      });
      
      clearInterval(progressInterval);
      
      if (error) {
        throw new Error(error.message || "Information extraction failed");
      }
      
      if (!data) {
        throw new Error("No information extracted");
      }
      
      setExtractionProgress(100);
      
      // Call the callback with the extracted information
      onInformationExtracted(data);
      
      toast({
        title: "Information extracted",
        description: "Job details have been extracted from your transcript",
      });
    } catch (error) {
      console.error("Information extraction error:", error);
      toast({
        title: "Information extraction failed",
        description: error instanceof Error ? error.message : "An error occurred during information extraction",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle manual transcript submission
  const handleManualTranscriptSubmit = () => {
    if (!transcript.trim()) {
      toast({
        title: "Empty transcript",
        description: "Please enter a transcript first",
        variant: "destructive",
      });
      return;
    }
    
    extractInformation(transcript);
  };

  // Clear all data
  const handleClear = () => {
    setAudioFile(null);
    setTranscript("");
    setTranscriptionProgress(0);
    setExtractionProgress(0);
    setUploadProgress(0);
    setUploadError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    toast({
      title: "Cleared",
      description: "All audio and transcript data has been cleared",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audio Transcription</CardTitle>
        <CardDescription>
          Record or upload audio to automatically extract job details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Audio</TabsTrigger>
            <TabsTrigger value="record">Record Audio</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 py-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center ${isUploading ? 'bg-muted/30' : 'hover:bg-muted/50'} cursor-pointer transition-colors`}
              onClick={!isUploading ? triggerFileInput : undefined}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              ) : (
                <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium mb-2">
                {isUploading ? "Uploading Audio File..." : "Upload Audio File"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isUploading 
                  ? `${Math.round(uploadProgress)}% complete` 
                  : "Drag and drop an audio file or click to browse"}
              </p>
              {!isUploading && (
                <Button variant="outline">Select Audio File</Button>
              )}
            </div>
            
            {uploadError && (
              <div className="bg-destructive/10 p-4 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Upload Error</p>
                  <p className="text-sm text-destructive/90">{uploadError}</p>
                </div>
              </div>
            )}
            
            {audioFile && !isUploading && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileAudio className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">{audioFile.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="record" className="space-y-4 py-4">
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
                    onClick={startRecording}
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
                    <span className="font-medium">Recording.wav</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      {formatTime(recordingTime)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleClear}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 py-4">
            <div className="space-y-2">
              <Textarea 
                placeholder="Paste or type your transcript here..."
                className="min-h-[200px]"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter the transcript of your conversation with the client or job site walkthrough
              </p>
            </div>
            
            {transcript && (
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClear}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Upload Progress */}
        {(isUploading || uploadProgress > 0 && uploadProgress < 100) && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Uploading Audio</span>
              <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        {/* Transcription Progress */}
        {(isTranscribing || transcriptionProgress > 0 && transcriptionProgress < 100) && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Transcribing Audio</span>
              <span className="text-sm text-muted-foreground">{Math.round(transcriptionProgress)}%</span>
            </div>
            <Progress value={transcriptionProgress} className="h-2" />
          </div>
        )}
        
        {/* Extraction Progress */}
        {(isExtracting || extractionProgress > 0 && extractionProgress < 100) && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Extracting Information</span>
              <span className="text-sm text-muted-foreground">{Math.round(extractionProgress)}%</span>
            </div>
            <Progress value={extractionProgress} className="h-2" />
          </div>
        )}
        
        {/* Transcript Preview */}
        {transcript && !isTranscribing && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Transcript</h3>
              {transcriptionProgress === 100 && (
                <div className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  <span className="text-xs">Transcription complete</span>
                </div>
              )}
            </div>
            <div className="bg-muted/30 p-4 rounded-lg max-h-[200px] overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{transcript}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between space-x-2">
        <Button 
          variant="outline" 
          onClick={handleClear}
          disabled={(!audioFile && !transcript) || isTranscribing || isExtracting || isUploading}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
        
        {activeTab === "manual" && transcript ? (
          <Button 
            onClick={handleManualTranscriptSubmit}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              "Extract Information"
            )}
          </Button>
        ) : (
          (audioFile && !isTranscribing && transcriptionProgress === 0) && (
            <Button 
              onClick={transcribeAudio}
              disabled={isTranscribing || isUploading}
            >
              {isTranscribing || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Transcribing..."}
                </>
              ) : (
                "Transcribe Audio"
              )}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default AudioTranscriptionInput;
