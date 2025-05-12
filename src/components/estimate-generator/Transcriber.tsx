import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface TranscriberProps {
  audioBlob: Blob | null;
  onComplete: (transcript: string, summary: string) => void;
}

const Transcriber: React.FC<TranscriberProps> = ({ audioBlob, onComplete }) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [summarizationProgress, setSummarizationProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');

  // Start transcription automatically if audio blob is available
  useEffect(() => {
    if (audioBlob && !transcript && !isTranscribing) {
      transcribeAudio();
    }
  }, [audioBlob]);

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Transcribe audio using Supabase Edge Function
  const transcribeAudio = async () => {
    if (!audioBlob) {
      setError('No audio recording found');
      return;
    }

    setIsTranscribing(true);
    setTranscriptionProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);

      // Convert audio to base64
      const base64Data = await blobToBase64(audioBlob);

      // Call the transcribe-audio edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audioBase64: base64Data }
      });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message || 'Transcription failed');
      }

      if (!data || !data.text) {
        throw new Error('No transcription returned');
      }

      setTranscriptionProgress(100);
      setTranscript(data.text);
      setEditedTranscript(data.text);

      // Now generate a summary
      await generateSummary(data.text);
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Generate a summary of the transcript
  const generateSummary = async (text: string) => {
    setIsSummarizing(true);
    setSummarizationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSummarizationProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);

      // In a real implementation, you would call an AI service to generate a summary
      // For now, we'll simulate a delay and create a simple summary
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple summary by extracting key sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const shortSummary = sentences.slice(0, 3).join('. ') + '.';
      
      clearInterval(progressInterval);
      setSummarizationProgress(100);
      setSummary(shortSummary);
    } catch (error) {
      console.error('Summary generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Handle manual edit of transcript
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setTranscript(editedTranscript);
      generateSummary(editedTranscript);
    }
    setIsEditing(!isEditing);
  };

  // Handle continue button click
  const handleContinue = () => {
    onComplete(transcript, summary);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Audio Transcription</h3>
              {transcript && !isTranscribing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditToggle}
                >
                  {isEditing ? 'Save Changes' : 'Edit Transcript'}
                </Button>
              )}
            </div>

            {/* Transcription Progress */}
            {isTranscribing && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Transcribing Audio</span>
                  <span className="text-sm text-muted-foreground">{Math.round(transcriptionProgress)}%</span>
                </div>
                <Progress value={transcriptionProgress} className="h-2" />
                <div className="flex items-center justify-center mt-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
            )}

            {/* Transcript Display/Edit */}
            {transcript && !isTranscribing && (
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span>Transcription complete</span>
                </div>
                
                {isEditing ? (
                  <Textarea
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                ) : (
                  <div className="bg-muted/30 p-4 rounded-lg max-h-[200px] overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{transcript}</p>
                  </div>
                )}
              </div>
            )}

            {/* Summarization Progress */}
            {isSummarizing && (
              <div className="space-y-2 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Generating Summary</span>
                  <span className="text-sm text-muted-foreground">{Math.round(summarizationProgress)}%</span>
                </div>
                <Progress value={summarizationProgress} className="h-2" />
              </div>
            )}

            {/* Summary Display */}
            {summary && !isSummarizing && (
              <div className="space-y-2 mt-6">
                <h3 className="text-md font-medium">Summary</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">{summary}</p>
                </div>
              </div>
            )}

            {/* Continue Button */}
            {transcript && summary && !isTranscribing && !isSummarizing && (
              <div className="flex justify-end mt-4">
                <Button onClick={handleContinue}>
                  Continue
                </Button>
              </div>
            )}

            {/* Retry Button */}
            {error && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={transcribeAudio}>
                  <FileText className="mr-2 h-4 w-4" />
                  Retry Transcription
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transcriber;