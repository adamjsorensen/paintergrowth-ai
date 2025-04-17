
import { useState } from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface KeywordsSectionProps {
  initialKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

export const KeywordsSection = ({ initialKeywords, onKeywordsChange }: KeywordsSectionProps) => {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [currentKeyword, setCurrentKeyword] = useState("");

  const addKeyword = () => {
    if (currentKeyword && !keywords.includes(currentKeyword)) {
      const updatedKeywords = [...keywords, currentKeyword];
      setKeywords(updatedKeywords);
      onKeywordsChange(updatedKeywords);
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter((k) => k !== keyword);
    setKeywords(updatedKeywords);
    onKeywordsChange(updatedKeywords);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div>
      <FormLabel>Brand Keywords</FormLabel>
      <div className="flex gap-2 mb-2">
        <Input
          value={currentKeyword}
          onChange={(e) => setCurrentKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter keyword and press Enter"
          className="flex-1"
        />
        <Button type="button" onClick={addKeyword}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {keywords.map((keyword) => (
          <Badge key={keyword} className="py-1 px-3 flex items-center gap-1">
            {keyword}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => removeKeyword(keyword)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};
