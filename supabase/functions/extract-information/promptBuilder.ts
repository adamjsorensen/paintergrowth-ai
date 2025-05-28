
import { validRooms } from './roomConfig.ts';

export function buildExtractionPrompt(transcript: string): string {
  const roomsListForPrompt = validRooms.map(room => 
    `- ${room.id}: "${room.label}" (also: ${room.aliases.join(', ')})`
  ).join('\n');

  return `You are an expert at extracting information from painting project transcripts. Extract all relevant information and return it in the specified JSON format.

VALID ROOM IDS AND THEIR ALIASES:
${roomsListForPrompt}

IMPORTANT ROOM EXTRACTION RULES:
- Use ONLY the room IDs listed above (e.g., "master-bedroom", "hallway", "powder-room")
- Map common terms to the correct IDs: "primary bedroom" → "master-bedroom", "upstairs hallway" → "hallway", "half bath" → "powder-room"
- Look for context clues: "upstairs" often refers to bedrooms/hallways, "main floor" to living areas
- Include ALL rooms mentioned, even briefly
- Set surfaces based on what's explicitly mentioned for each room
- Use null for doors/windows if not specified

PROJECT SETTINGS EXTRACTION:
Look for these project details:
- Start dates, timelines, production schedules ("start July 29th", "begin work on", "schedule for")
- Trim color specifications ("white trim", "semi-gloss white", "trim color")
- Number of wall colors mentioned
- Paint coats ("one coat", "two coats", "double coat")
- Paint type/brand ("Sherwin Williams", "Benjamin Moore", "premium paint")
- Special considerations ("move furniture", "protect floors", "working around")
- Sales notes ("customer wants", "budget concerns", "preferences")
- Discount mentions ("discount", "reduced price", "%")

Extract this information from the transcript:

TRANSCRIPT: "${transcript}"

Return a JSON object with this exact structure:
{
  "fields": [
    {
      "name": "Client Name",
      "value": "extracted name or empty string",
      "confidence": 0.0-1.0,
      "formField": "clientName"
    },
    {
      "name": "Client Email", 
      "value": "extracted email or empty string",
      "confidence": 0.0-1.0,
      "formField": "clientEmail"
    },
    {
      "name": "Client Phone",
      "value": "extracted phone or empty string", 
      "confidence": 0.0-1.0,
      "formField": "clientPhone"
    },
    {
      "name": "Project Address",
      "value": "extracted address or empty string",
      "confidence": 0.0-1.0,
      "formField": "projectAddress"
    },
    {
      "name": "Job Type",
      "value": "interior or exterior",
      "confidence": 0.0-1.0,
      "formField": "jobType"
    },
    {
      "name": "Timeline",
      "value": "extracted timeline or empty string",
      "confidence": 0.0-1.0,
      "formField": "timeline"
    },
    {
      "name": "Rooms To Paint",
      "value": ["array of room names as mentioned"],
      "confidence": 0.0-1.0,
      "formField": "roomsToPaint"
    },
    {
      "name": "Surfaces to Paint",
      "value": ["walls", "ceiling", "trim", "doors", "windows", "cabinets"],
      "confidence": 0.0-1.0,
      "formField": "surfacesToPaint"
    },
    {
      "name": "Preparation Needs",
      "value": ["array of prep work needed"],
      "confidence": 0.0-1.0,
      "formField": "prepNeeds"
    },
    {
      "name": "Color Preferences",
      "value": "extracted colors or empty string",
      "confidence": 0.0-1.0,
      "formField": "colorPalette"
    },
    {
      "name": "Special Notes",
      "value": "any special requirements or notes",
      "confidence": 0.0-1.0,
      "formField": "specialNotes"
    }
  ],
  "rooms": [
    {
      "room_id": "valid-room-id-from-list-above",
      "label": "Room Name As Mentioned",
      "surfaces": {
        "walls": true/false,
        "ceiling": true/false, 
        "trim": true/false,
        "doors": number or null,
        "windows": number or null,
        "cabinets": true/false
      },
      "confidence": 0.0-1.0
    }
  ],
  "projectMetadata": {
    "trimColor": "extracted trim color or empty string",
    "wallColors": number of different wall colors mentioned or 1,
    "coats": "one" or "two" based on what's mentioned,
    "paintType": "extracted paint type/brand or 'Premium Interior Paint'",
    "specialConsiderations": "extracted special requirements or empty string",
    "salesNotes": "extracted customer preferences/notes or empty string",
    "productionDate": "extracted start date in YYYY-MM-DD format or null",
    "discountPercent": number percentage if discount mentioned or 0
  }
}`;
}
