
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const paintingMessages = [
  "Mixing the paints...",
  "Prepping surfaces…",
  "Taping off the trim…",
  "Sanding rough edges...",
  "Applying primer...",
  "Working on the details...almost done!",
  "Letting the first coat dry...",
  "Adding the finishing touches...",
];

const LoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through messages every 2.5 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % paintingMessages.length);
    }, 2500);

    // Progressively increase the progress bar up to 95%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        // Non-linear progress to seem more natural
        const increment = Math.max(1, 15 - Math.floor(prev / 5));
        return prev + increment;
      });
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="container mx-auto flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-xl border-none shadow-md">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative w-32 h-32">
             <div className="absolute inset-0 rounded-full border-8 border-t-transparent border-paintergrowth-300 animate-spin duration-[1200ms]"></div>
<div className="absolute inset-4 rounded-full border-6 border-r-transparent border-paintergrowth-500 animate-spin duration-[900ms] direction-reverse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-paintergrowth-600"
                >
                  <path d="M18 3v16H6V3" />
                  <path d="M2 3h20" />
                  <path d="M14 3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2Z" />
                  <path d="m9 11 2 2 4-4" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-paintergrowth-800 animate-pulse">
              {paintingMessages[messageIndex]}
            </h2>
            
            <Progress value={progress} className="w-full h-2 bg-paintergrowth-100" />
            
            <p className="text-sm text-gray-500">
              Paintergrowth.ai is generating your proposal. This will just take a moment...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingAnimation;
