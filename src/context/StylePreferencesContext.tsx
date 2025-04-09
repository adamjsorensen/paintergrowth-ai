
import { createContext, useContext, useState, ReactNode } from "react";

export type StylePreference = {
  tone: "friendly" | "professional" | "bold" | "chill" | null;
  length: number;
  formality: "casual" | "formal" | null;
  visualFlair: {
    mentionColors: boolean;
    includePricing: boolean;
    bulletPoints: boolean;
  };
  relationship: "new" | "repeat" | "referred" | "cold" | null;
  addUpsells: boolean;
  addPersonality: boolean;
};

const defaultPreferences: StylePreference = {
  tone: null,
  length: 50, // Default middle value for slider (0-100)
  formality: null,
  visualFlair: {
    mentionColors: false,
    includePricing: false,
    bulletPoints: false,
  },
  relationship: null,
  addUpsells: false,
  addPersonality: false,
};

type StylePreferencesContextType = {
  preferences: StylePreference;
  setPreferences: React.Dispatch<React.SetStateAction<StylePreference>>;
  hasSetPreferences: boolean;
  setHasSetPreferences: React.Dispatch<React.SetStateAction<boolean>>;
  resetPreferences: () => void;
};

const StylePreferencesContext = createContext<StylePreferencesContextType | undefined>(undefined);

export const StylePreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<StylePreference>(defaultPreferences);
  const [hasSetPreferences, setHasSetPreferences] = useState<boolean>(false);

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    setHasSetPreferences(false);
  };

  return (
    <StylePreferencesContext.Provider value={{ 
      preferences, 
      setPreferences, 
      hasSetPreferences, 
      setHasSetPreferences,
      resetPreferences
    }}>
      {children}
    </StylePreferencesContext.Provider>
  );
};

export const useStylePreferences = () => {
  const context = useContext(StylePreferencesContext);
  if (context === undefined) {
    throw new Error("useStylePreferences must be used within a StylePreferencesProvider");
  }
  return context;
};
