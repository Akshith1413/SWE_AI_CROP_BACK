# Validation Flow Diagram

## Request Flow with Validation

```
┌─────────────────────────────────────────────────────────────────┐
│                      Farmer Sends Request                        │
│   { "crop": "Tomato", "disease": "Early Blight" }               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              API Endpoint: POST /api/crop-advice                 │
│                   (routes/cropAdvice.js)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Step 1: Basic Validation                       │
│              Check if crop and disease are provided               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                       ┌────┴────┐
                       │ Valid?  │
                       └────┬────┘
                            │
              ┌─────────────┴─────────────┐
              │ NO                    YES │
              ▼                           ▼
    ┌─────────────────┐       ┌─────────────────────────┐
    │  Return Error   │       │  Step 2: Crop Validation │
    │  400 Bad Req    │       │  (cropValidator.js)      │
    └─────────────────┘       └────────┬────────────────┘
                                       │
                                  ┌────┴────┐
                                  │ Valid?  │
                                  └────┬────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │ NO                    YES │
                         ▼                           ▼
              ┌──────────────────────┐     ┌─────────────────────────┐
              │   Return Error 400   │     │ Step 3: Disease         │
              │   with:              │     │ Validation              │
              │   - Error message    │     │ (cropValidator.js)      │
              │   - Valid crops list │     └────────┬────────────────┘
              │   - Suggestions      │              │
              └──────────────────────┘         ┌────┴────┐
                                               │ Valid?  │
                                               └────┬────┘
                                                    │
                                      ┌─────────────┴─────────────┐
                                      │ NO                    YES │
                                      ▼                           ▼
                           ┌──────────────────────┐    ┌─────────────────────┐
                           │   Return Error 400   │    │ Step 4: Generate AI │
                           │   with:              │    │ Advice              │
                           │   - Error message    │    │ (llmService.js)     │
                           │   - Valid diseases   │    └─────────┬───────────┘
                           │   - Suggestions      │              │
                           └──────────────────────┘              ▼
                                                      ┌─────────────────────┐
                                                      │  Return Success     │
                                                      │  200 OK             │
                                                      │  with:              │
                                                      │  - AI advice        │
                                                      │  - Warnings (if any)│
                                                      └─────────────────────┘
```

## Validation Logic Detail

### Crop Validation Process

```
Input: "tomatoe"
   │
   ▼
┌──────────────────────┐
│ Normalize Input      │ → "tomatoe" (lowercase, trimmed)
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Exact Match?         │ → Check if "tomatoe" is in VALID_CROPS
└────────┬─────────────┘
         │ NO
         ▼
┌──────────────────────┐
│ Partial Match?       │ → Check if any crop contains "tomatoe"
└────────┬─────────────┘    or "tomatoe" contains any crop
         │ YES!
         ▼
    "tomato" found
         │
         ▼
┌──────────────────────┐
│ Return Success       │
│ crop: "tomato"       │
│ warning: "Interpreted│
│  'tomatoe' as        │
│  'tomato'"           │
└──────────────────────┘
```

### Disease Validation Process

```
Input: crop="tomato", disease="early blt"
   │
   ▼
┌──────────────────────────┐
│ Get crop-specific        │ → Lookup CROP_DISEASES["tomato"]
│ diseases                 │
└────────┬─────────────────┘
         │
         ▼
   ["early blight", "late blight", ...]
         │
         ▼
┌──────────────────────────┐
│ Exact Match?             │ → "early blt" == "early blight"? NO
└────────┬─────────────────┘
         │ NO
         ▼
┌──────────────────────────┐
│ Partial Match?           │ → "early blt" contains "early"?
└────────┬─────────────────┘   "early blight" contains "early blt"? NO
         │                     "early blt" in "early blight"? NO
         │ NO                  "early blight" in "early blt"? NO
         ▼
┌──────────────────────────┐
│ Generic Match?           │ → "early blt" contains "blight"? NO
└────────┬─────────────────┘   Check GENERIC_DISEASES
         │ NO
         ▼
┌──────────────────────────┐
│ Find Suggestions         │ → Diseases starting with "earl"
└────────┬─────────────────┘
         │
         ▼
   ["early blight"]
         │
         ▼
┌──────────────────────────┐
│ Return Failure           │
│ suggestions: [           │
│   "early blight"         │
│ ]                        │
└──────────────────────────┘
```

## Error Response Examples

### Invalid Crop
```http
POST /api/crop-advice
{ "crop": "xyz", "disease": "something" }

HTTP/1.1 400 Bad Request
{
  "success": false,
  "error": "Invalid crop name: \"xyz\"",
  "message": "Please provide a valid crop name.",
  "userGuidance": "Please provide a correct crop name from the list of valid crops.",
  "validCrops": ["tomato", "potato", "pepper", ...]
}
```

### Invalid Disease
```http
POST /api/crop-advice
{ "crop": "tomato", "disease": "fake disease" }

HTTP/1.1 400 Bad Request
{
  "success": false,
  "error": "Invalid disease for tomato: \"fake disease\"",
  "message": "\"fake disease\" is not a recognized disease for tomato",
  "suggestions": ["early blight", "late blight", "leaf mold", ...],
  "userGuidance": "Please provide a correct disease name for tomato.",
  "crop": "tomato",
  "validDiseases": ["early blight", "late blight", ...]
}
```

### Success with Warning
```http
POST /api/crop-advice
{ "crop": "tomatoe", "disease": "Early Blight" }

HTTP/1.1 200 OK
{
  "success": true,
  "data": {
    "cause": "...",
    "symptoms": "...",
    ...
  },
  "warnings": ["Interpreted \"tomatoe\" as \"tomato\""]
}
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - Sends crop and disease data                              │
│  - Displays errors with suggestions                         │
│  - Shows validation warnings                                │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP Request
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes Layer                           │
│                  (routes/cropAdvice.js)                      │
│  - Receives request                                          │
│  - Calls validation utility                                  │
│  - Returns errors or passes to service layer                │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│  Validation     │ │   Service    │ │   External      │
│  Utility        │ │   Layer      │ │   API           │
│ (cropValidator) │ │ (llmService) │ │ (Gemini AI)     │
│                 │ │              │ │                 │
│ - Crop DB       │ │ - Generate   │ │ - Generate      │
│ - Disease DB    │ │   prompts    │ │   advice        │
│ - Fuzzy match   │ │ - Call API   │ │                 │
└─────────────────┘ └──────────────┘ └─────────────────┘
```

## Supported Crop Categories

```
                    ┌─────────────────────┐
                    │   VALID CROPS (40+) │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
    ┌─────────┐          ┌─────────┐          ┌──────────┐
    │Vegetables│         │ Fruits  │         │  Grains  │
    │         │         │         │         │          │
    │ tomato  │         │  apple  │         │   corn   │
    │ potato  │         │  grape  │         │   wheat  │
    │ pepper  │         │ orange  │         │   rice   │
    │ cucumber│         │  mango  │         │ soybean  │
    │   ...   │         │   ...   │         │   ...    │
    └─────────┘         └─────────┘         └──────────┘
         │                     │                     │
         │                     │                     │
         ▼                     ▼                     ▼
    ┌──────────┐         ┌──────────┐        ┌───────────┐
    │   Cash   │         │  Others  │        │           │
    │  Crops   │         │          │        │           │
    │          │         │groundnut │        │           │
    │  cotton  │         │sunflower │        │           │
    │sugarcane │         │ mustard  │        │           │
    │ tobacco  │         │   ...    │        │           │
    └──────────┘         └──────────┘        └───────────┘
```
