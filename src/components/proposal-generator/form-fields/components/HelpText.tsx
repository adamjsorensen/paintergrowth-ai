
import React from "react";

interface HelpTextProps {
  children: React.ReactNode;
}

export const HelpText: React.FC<HelpTextProps> = ({ children }) => {
  return (
    <p className="text-sm text-muted-foreground mt-1">{children}</p>
  );
};
