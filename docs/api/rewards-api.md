# Rewards API Documentation

This document describes the API endpoints required for the hackathon rewards page functionality.

## Overview

The rewards page allows organizers to:

- View all judged submissions with their scores
- Assign ranks to submissions
- Create milestones in the escrow for winners
- Announce winners

## Base URL

All endpoints are relative to:

```
/api/organizations/:organizationId/hackathons/:hackathonId
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get Judged Submissions

Retrieves all shortlisted submissions that have been judged, including their scores and average scores.

**Endpoint:** `GET /judging/submissions`

**Query Parameters:**

- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "participant": {
        "_id": "participant_id",
        "userId": "user_id",
        "hackathonId": "hackathon_id",
        "organizationId": "org_id",
        "user": {
          "_id": "user_id",
          "profile": {
            "firstName": "John",
            "lastName": "Doe",
            "username": "johndoe",
            "avatar": "https://example.com/avatar.jpg"
          },
          "email": "john@example.com"
        },
        "participationType": "individual",
        "teamId": null,
        "teamName": null
      },
      "submission": {
        "_id": "submission_id",
        "projectName": "My Awesome Project",
        "category": "Web3",
        "description": "Project description",
        "logo": "https://example.com/logo.jpg",
        "videoUrl": "https://example.com/video.mp4",
        "introduction": "Project introduction",
        "links": [
          {
            "type": "github",
            "url": "https://github.com/example"
          }
        ],
        "submissionDate": "2024-01-15T10:00:00Z",
        "status": "shortlisted"
      },
      "criteria": [
        {
          "title": "Innovation",
          "weight": 30,
          "description": "How innovative is the solution?"
        },
        {
          "title": "Technical Quality",
          "weight": 40,
          "description": "Technical implementation quality"
        },
        {
          "title": "Impact",
          "weight": 30,
          "description": "Potential impact of the solution"
        }
      ],
      "scores": [
        {
          "_id": "score_id",
          "judge": {
            "_id": "judge_id",
            "profile": {
              "firstName": "Judge",
              "lastName": "Name",
              "username": "judgename",
              "avatar": "https://example.com/judge.jpg"
            },
            "email": "judge@example.com"
          },
          "scores": [
            {
              "criterionTitle": "Innovation",
              "score": 85
            },
            {
              "criterionTitle": "Technical Quality",
              "score": 90
            },
            {
              "criterionTitle": "Impact",
              "score": 80
            }
          ],
          "weightedScore": 85.5,
          "notes": "Great project!",
          "judgedAt": "2024-01-20T10:00:00Z",
          "updatedAt": "2024-01-20T10:00:00Z"
        }
      ],
      "averageScore": 85.5,
      "judgeCount": 3
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Submissions retrieved successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Failed to retrieve submissions",
  "error": "Error details"
}
```

---

### 2. Assign Ranks to Submissions

Assigns or updates ranks for submissions. This endpoint handles rank assignment and ensures ranks are unique.

**Endpoint:** `POST /rewards/ranks`

**Request Body:**

```json
{
  "ranks": [
    {
      "participantId": "participant_id_1",
      "rank": 1
    },
    {
      "participantId": "participant_id_2",
      "rank": 2
    },
    {
      "participantId": "participant_id_3",
      "rank": 3
    }
  ]
}
```

**Request Body Schema:**

- `ranks` (array, required): Array of rank assignments
  - `participantId` (string, required): The participant ID
  - `rank` (number, required): The rank (1, 2, 3, etc.)

**Response:**

```json
{
  "success": true,
  "message": "Ranks assigned successfully",
  "data": {
    "updated": 3
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Failed to assign ranks",
  "error": "Error details"
}
```

**Validation Rules:**

- Ranks must be unique (no duplicate ranks)
- Participant IDs must exist
- Ranks must be positive integers
- If a rank is already assigned to another participant, it should be unassigned from that participant

---

### 3. Create Winner Milestones

Creates milestones in the escrow for winners. This endpoint should:

1. Validate that the escrow exists and can be updated
2. Create milestones for each winner
3. Update the escrow with the new milestones

**Endpoint:** `POST /rewards/milestones`

**Request Body:**

```json
{
  "winners": [
    {
      "participantId": "participant_id_1",
      "rank": 1,
      "walletAddress": "GABCDEFGHIJKLMNOPQRSTUVWXYZ2345678901234567890123456789"
    },
    {
      "participantId": "participant_id_2",
      "rank": 2,
      "walletAddress": "GBCDEFGHIJKLMNOPQRSTUVWXYZ23456789012345678901234567890"
    },
    {
      "participantId": "participant_id_3",
      "rank": 3,
      "walletAddress": "GCDEFGHIJKLMNOPQRSTUVWXYZ234567890123456789012345678901"
    }
  ]
}
```

**Request Body Schema:**

- `winners` (array, required): Array of winners
  - `participantId` (string, required): The participant ID
  - `rank` (number, required): The rank (1, 2, 3, etc.)
  - `walletAddress` (string, required): Stellar wallet address (56 characters, starts with 'G')

**Response:**

```json
{
  "success": true,
  "message": "Milestones created successfully",
  "data": {
    "transactionHash": "0x1234567890abcdef...",
    "milestonesCreated": 3
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Failed to create milestones",
  "error": "Error details"
}
```

**Validation Rules:**

- Escrow must exist and be funded
- Escrow must not have approved milestones (cannot update after approval)
- Wallet addresses must be valid Stellar addresses (56 characters, starts with 'G')
- Ranks must be valid (match prize tiers) - **See Prize Tier Matching Logic below**
- Prize amounts must match configured prize tiers
- Each winner must have a unique wallet address

**Prize Tier Matching Logic:**
The backend must parse prize tier `position` fields to match with winner ranks. Prize tiers may have positions in various formats:

- "1st Place", "2nd Place", "3rd Place" → Extract rank: 1, 2, 3
- "1st", "2nd", "3rd" → Extract rank: 1, 2, 3
- "1", "2", "3" → Use directly: 1, 2, 3
- "First Place", "Second Place" → Extract rank: 1, 2

**Backend Validation Function (JavaScript/TypeScript):**

```typescript
/**
 * Extract rank number from position string
 * Handles formats like "1st Place", "2nd", "3", "Third Place", etc.
 * @param position - Position string (e.g., "2nd Place", "2", "2nd")
 * @returns Rank number or null if not found
 */
function extractRankFromPosition(
  position: string | undefined | null
): number | null {
  if (!position) return null;

  // Remove "Place" and trim, convert to lowercase
  const cleaned = position.toLowerCase().replace(/place/g, '').trim();

  // Try to extract number directly (e.g., "2", "2nd", "2nd place")
  const numberMatch = cleaned.match(/^(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }

  // Handle ordinal formats: "1st", "2nd", "3rd", "4th", etc.
  const ordinalMatch = cleaned.match(/^(\d+)(st|nd|rd|th)/);
  if (ordinalMatch) {
    return parseInt(ordinalMatch[1], 10);
  }

  // Handle word formats: "first", "second", "third", etc.
  const wordMap: Record<string, number> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
  };

  for (const [word, num] of Object.entries(wordMap)) {
    if (cleaned.includes(word)) {
      return num;
    }
  }

  return null;
}

// Example usage in backend validation:
function validatePrizeTierForRank(
  prizeTiers: Array<{ position: string }>,
  rank: number
): boolean {
  return prizeTiers.some(tier => {
    const tierRank = extractRankFromPosition(tier.position);
    return tierRank === rank;
  });
}
```

**Business Logic:**

1. Fetch hackathon to get prize tiers and escrow contract ID
2. Validate escrow state (funded, can be updated)
3. Map winners to prize amounts based on ranks
4. Create milestone payload for each winner:
   - Description: "{rank}st/nd/rd/th Place Prize"
   - Amount: Prize amount from prize tier (in Stellar format with 7 decimals)
   - Receiver: Winner's wallet address
5. Call Trustless Work Update Escrow API to add milestones
6. Return transaction hash and number of milestones created

---

### 4. Get Hackathon Escrow Details

**Note:** This endpoint is optional if using Trustless Work's `useGetEscrowFromIndexerByContractIds` hook directly from the frontend. However, it can be useful for server-side validation.

**Endpoint:** `GET /escrow`

**Response:**

```json
{
  "success": true,
  "data": {
    "contractId": "contract_id",
    "escrowAddress": "contract_id",
    "balance": 1000000000,
    "milestones": [
      {
        "description": "1st Place Prize",
        "amount": 10000000000,
        "receiver": "GABCDEFGHIJKLMNOPQRSTUVWXYZ2345678901234567890123456789",
        "status": "pending",
        "evidence": ""
      }
    ],
    "isFunded": true,
    "canUpdate": true
  },
  "message": "Escrow details retrieved successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Escrow not found",
  "error": "Error details"
}
```

---

### 5. Announce Winners

Announces winners publicly with an optional announcement message.

**Endpoint:** `POST /winners/announce`

**Request Body:**

```json
{
  "winners": [
    {
      "submissionId": "submission_id_1",
      "rank": 1
    },
    {
      "submissionId": "submission_id_2",
      "rank": 2
    },
    {
      "submissionId": "submission_id_3",
      "rank": 3
    }
  ],
  "announcement": "Congratulations to all winners! We're excited to announce..."
}
```

**Request Body Schema:**

- `winners` (array, required): Array of winners
  - `submissionId` (string, required): The submission ID
  - `rank` (number, required): The rank
- `announcement` (string, optional): Public announcement message

**Response:**

```json
{
  "success": true,
  "message": "Winners announced successfully",
  "data": {
    "announcedAt": "2024-01-25T10:00:00Z"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Failed to announce winners",
  "error": "Error details"
}
```

---

## Data Models

### Participant Rank

```typescript
interface ParticipantRank {
  participantId: string;
  rank: number;
}
```

### Winner Milestone Request

```typescript
interface WinnerMilestoneRequest {
  participantId: string;
  rank: number;
  walletAddress: string; // Stellar address (56 chars, starts with 'G')
}
```

### Escrow Milestone

```typescript
interface EscrowMilestone {
  description: string;
  amount: number; // In Stellar format (7 decimals)
  receiver: string; // Stellar address
  status: 'pending' | 'approved' | 'released' | 'disputed';
  evidence?: string;
}
```

---

## Error Codes

| Status Code | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| 200         | Success                                                                 |
| 400         | Bad Request - Invalid input data                                        |
| 401         | Unauthorized - Missing or invalid token                                 |
| 403         | Forbidden - User doesn't have permission                                |
| 404         | Not Found - Resource doesn't exist                                      |
| 409         | Conflict - Escrow cannot be updated (e.g., milestones already approved) |
| 422         | Unprocessable Entity - Validation error                                 |
| 500         | Internal Server Error                                                   |

---

## Integration Notes

### Frontend Implementation

The frontend uses:

- `getJudgingSubmissions()` - To fetch judged submissions
- `assignRanks()` - To sync rank assignments with backend
- `createWinnerMilestones()` - To create milestones (calls Trustless Work API)
- Trustless Work `useGetEscrowFromIndexerByContractIds` hook - To fetch escrow data directly

### Escrow Integration

The milestone creation process:

1. Frontend validates escrow state using Trustless Work hook
2. Frontend collects winner wallet addresses
3. Frontend calls `createWinnerMilestones` API
4. Backend validates and calls Trustless Work Update Escrow API
5. Backend returns transaction hash

### Stellar Address Validation

Wallet addresses must:

- Start with 'G'
- Be exactly 56 characters long
- Match pattern: `/^G[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{55}$/`

### Amount Format

Prize amounts should be converted to Stellar format:

- USDC uses 7 decimals
- Example: 100 USDC = 1000000000 (in Stellar format)

---

## Example Workflow

1. **Fetch Submissions**

   ```
   GET /judging/submissions?page=1&limit=100
   ```

2. **Assign Ranks**

   ```
   POST /rewards/ranks
   {
     "ranks": [
       { "participantId": "id1", "rank": 1 },
       { "participantId": "id2", "rank": 2 }
     ]
   }
   ```

3. **Create Milestones**

   ```
   POST /rewards/milestones
   {
     "winners": [
       {
         "participantId": "id1",
         "rank": 1,
         "walletAddress": "G..."
       }
     ]
   }
   ```

4. **Announce Winners**
   ```
   POST /winners/announce
   {
     "winners": [
       { "submissionId": "sub1", "rank": 1 }
     ],
     "announcement": "Congratulations!"
   }
   ```

---

## Testing

### Test Data

Use the following for testing:

- Organization ID: `test_org_id`
- Hackathon ID: `test_hackathon_id`
- Participant IDs: `participant_1`, `participant_2`, `participant_3`
- Test Stellar Address: `GDY5ZF245RCA54QG4XM4R54TS76LDV3UZZ56P6R2UE72TXSVOJFRFSZ7`

### Test Scenarios

1. **Assign Ranks**
   - Assign ranks to multiple submissions
   - Verify ranks are unique
   - Test rank reassignment

2. **Create Milestones**
   - Create milestones for winners
   - Verify escrow validation
   - Test with invalid wallet addresses
   - Test with unfunded escrow

3. **Error Handling**
   - Test with missing data
   - Test with invalid formats
   - Test with unauthorized access

---

## Changelog

### Version 1.0.0

- Initial API specification
- Support for rank assignment
- Support for milestone creation
- Integration with Trustless Work escrow
