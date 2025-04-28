
/**
 * Processes and formats style preferences for proposal generation
 */

// Processes and formats style preferences into template-friendly instructions
export function processStylePreferences(stylePreferences: any) {
  if (!stylePreferences) {
    return {
      lengthInstruction: "Use a standard length with balanced detail.",
      toneInstruction: "Use a professional tone.",
      additionalInstructions: ""
    };
  }

  // Process length preference
  let lengthInstruction = "";
  switch(stylePreferences.length) {
    case 0:
      lengthInstruction = "Make the proposal very concise and focused only on essential points. Minimize paragraph length and eliminate all non-essential details.";
      break;
    case 25:
      lengthInstruction = "Keep the proposal brief, including only key details and main points. Use short paragraphs and concise language.";
      break;
    case 50:
      lengthInstruction = "Use a standard length with balanced detail. Include enough information to be thorough but avoid being overly verbose.";
      break;
    case 75:
      lengthInstruction = "Create a detailed proposal with thorough explanations. Expand on important sections and provide more context where valuable.";
      break;
    case 100:
      lengthInstruction = "Develop a comprehensive proposal with extensive detail and context. Elaborate thoroughly on all sections and provide detailed explanations throughout.";
      break;
    default:
      lengthInstruction = "Use a standard length with balanced detail.";
  }

  // Process tone preference
  let toneInstruction = "";
  switch(stylePreferences.tone) {
    case "friendly":
      toneInstruction = "Use a friendly, approachable tone that builds rapport with the reader. Be conversational while maintaining professionalism.";
      break;
    case "professional":
      toneInstruction = "Use a formal, business-oriented tone throughout the proposal. Maintain professional language and structure.";
      break;
    case "bold":
      toneInstruction = "Use a confident, assertive tone that conveys expertise and certainty. Be direct and emphasize value propositions strongly.";
      break;
    case "chill":
      toneInstruction = "Use a relaxed, casual approach while still being professional. Adopt a conversational style that feels approachable and low-pressure.";
      break;
    default:
      toneInstruction = "Use a professional tone appropriate for business proposals.";
  }

  // Process additional options
  let additionalInstructions = "";
  if (stylePreferences.addUpsells) {
    additionalInstructions += " Include suggestions for value-added services or premium options that could enhance the project.";
  }

  return {
    lengthInstruction,
    toneInstruction,
    additionalInstructions
  };
}
