
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { fileToBase64 } from "./utils/audioRecordingUtils";
import UploadTab from "./components/UploadTab";
import RecordTab from "./components/RecordTab";
import ManualTab from "./components/ManualTab";
import ProgressIndicators from "./components/ProgressIndicators";
import TranscriptPreview from "./components/TranscriptPreview";

interface AudioTranscriptionInputProps {
  onTranscriptionComplete: (transcript: string) => void;
  onInformationExtracted: (extractedData: Record<string, any>) => void;
}

const AudioTranscriptionInput: React.FC<AudioTranscriptionInputProps> = ({
  onTranscriptionComplete,
  onInformationExtracted
}) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const {
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
  } = useAudioRecording();

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
      setIsUploading(true);
      setUploadProgress(0);
      
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      const base64Data = await fileToBase64(audioFile);
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      setIsUploading(false);
      
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);
      
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

  // Extract information from transcript
  const extractInformation = async (text: string) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);
      
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

  const handleClear = () => {
    setAudioFile(null);
    clearRecording();
    setTranscript("");
    setTranscriptionProgress(0);
    setExtractionProgress(0);
    setUploadProgress(0);
    setUploadError(null);
    
    toast({
      title: "Cleared",
      description: "All audio and transcript data has been cleared",
    });
  };

  const handleFileChange = (file: File | null) => {
    setAudioFile(file);
    setUploadError(null);
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
          
          <TabsContent value="upload">
            <UploadTab
              audioFile={audioFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
              onFileChange={handleFileChange}
              onClear={handleClear}
            />
          </TabsContent>
          
          <TabsContent value="record">
            <RecordTab
              isRecording={isRecording}
              isPaused={isPaused}
              recordingTime={recordingTime}
              audioFile={audioFile}
              onStartRecording={startRecording}
              onPauseRecording={pauseRecording}
              onResumeRecording={resumeRecording}
              onStopRecording={stopRecording}
              onClear={handleClear}
            />
          </TabsContent>
          
          <TabsContent value="manual">
            <ManualTab
              transcript={transcript}
              onTranscriptChange={setTranscript}
              onClear={handleClear}
            />
          </TabsContent>
        </Tabs>
        
        <ProgressIndicators
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          isTranscribing={isTranscribing}
          transcriptionProgress={transcriptionProgress}
          isExtracting={isExtracting}
          extractionProgress={extractionProgress}
        />
        
        <TranscriptPreview
          transcript={transcript}
          isTranscribing={isTranscribing}
          transcriptionProgress={transcriptionProgress}
        />
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
