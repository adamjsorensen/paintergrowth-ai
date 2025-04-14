
import { useState } from "react";
import { parseFile } from "@/utils/fileParser";
import { useToast } from "@/hooks/use-toast";

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedContent, setParsedContent] = useState<string>("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsingFile(true);
    setParseError(null);
    setParsedContent("");
    
    try {
      const result = await parseFile(selectedFile);
      
      if (result.error) {
        setParseError(result.error);
        setParsedContent("");
        toast({
          title: "File parsing error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setParsedContent(result.content);
        toast({
          title: "File uploaded successfully",
          description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`,
        });
      }
    } catch (error) {
      console.error("Error handling file:", error);
      setParseError(error instanceof Error ? error.message : "Unknown error occurred");
      setParsedContent("");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  const resetFileUpload = () => {
    setFile(null);
    setParsedContent("");
    setIsParsingFile(false);
    setParseError(null);
  };

  return {
    file,
    parsedContent,
    isParsingFile,
    parseError,
    handleFileSelect,
    resetFileUpload
  };
};
