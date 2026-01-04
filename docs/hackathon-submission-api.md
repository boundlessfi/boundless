# Hackathon Submission API Usage Guide

## Overview

The hackathon submission system allows participants to submit projects to hackathons. Projects may be selected from existing ones or auto-created during submission.

## Authentication

All submission endpoints require authentication. Include the auth token in your requests:

```
Authorization: Bearer <token>
```

## API Endpoints

### 1) Create Submission

POST /hackathons/submissions

Creates a new hackathon submission. If `projectId` is not provided, a base project will be automatically created.

Request body (JSON):

```json
{
  "hackathonId": "string (required)",
  "organizationId": "string (required)",
  "projectId": "string (optional)",
  "participationType": "INDIVIDUAL|TEAM (required)",
  "teamId": "string (optional)",
  "teamName": "string (required for TEAM)",
  "teamMembers": [
    {
      "userId": "string",
      "name": "string",
      "username": "string (optional)",
      "role": "string",
      "avatar": "string (optional)"
    }
  ],
  "projectName": "string (required, min 3, max 100 chars)",
  "category": "string (required)",
  "description": "string (required, min 50, max 5000 chars)",
  "logo": "string (url, optional)",
  "videoUrl": "string (url, optional)",
  "introduction": "string (optional, max 500 chars)",
  "links": [{ "type": "github|demo|video|other", "url": "string (url)" }],
  "socialLinks": {
    "github": "string (url, optional)",
    "telegram": "string (optional)",
    "twitter": "string (url, optional)",
    "email": "string (optional)"
  }
}
```

Response (201):

```json
{
  "id": "string",
  "hackathonId": "string",
  "projectId": "string",
  "participantId": "string",
  "organizationId": "string",
  "participationType": "INDIVIDUAL|TEAM",
  "teamName": "string?",
  "teamMembers": [],
  "projectName": "string",
  "category": "string",
  "description": "string",
  "logo": "string?",
  "videoUrl": "string?",
  "introduction": "string?",
  "links": [],
  "socialLinks": {},
  "status": "PENDING|APPROVED|REJECTED",
  "submittedAt": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "project": { "id": "", "title": "", "banner": "?", "logo": "?" },
  "participant": { "id": "", "name": "", "username": "?", "image": "?" }
}
```

Example (existing project):

```js
const response = await fetch('/hackathons/submissions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    /* see request body above */
  }),
});
```

Example (auto-create project): omit `projectId` in the request body.

---

### 2) Get My Submission

GET /hackathons/:hackathonId/my-submission

Retrieves the current user's submission for a specific hackathon. Returns 404 if none exists.

Response: same shape as create response.

---

### 3) Update Submission

PATCH /hackathons/submissions/:submissionId

Only the submission owner can update. All fields are optional; provide only fields to change.

Example body:

```json
{
  "description": "Updated description",
  "videoUrl": "https://...",
  "links": [{ "type": "github", "url": "https://github.com/..." }]
}
```

---

### 4) Delete Submission (Withdraw)

DELETE /hackathons/submissions/:submissionId

Only the submission owner can delete/withdraw before deadline.

Response:

```json
{ "message": "Submission withdrawn successfully" }
```

---

### 5) Get Submission by ID

GET /hackathons/submissions/:submissionId

Accessible to the submission owner or hackathon organizers.

---

### 6) List All Submissions (Organizers Only)

GET /hackathons/:hackathonId/submissions

Query parameters:

- `status` (optional): `PENDING|APPROVED|REJECTED`
- `page` (default 1)
- `limit` (default 20)

Response:

```json
{
  "submissions": [
    /* submissions */
  ],
  "pagination": { "page": 1, "limit": 20, "hasNext": false, "hasPrev": false }
}
```

## Validation Rules

- User must join the hackathon before submitting.
- Check submission deadline: cannot submit after `submissionDeadline`.
- One submission per participant per hackathon.
- For `participationType = TEAM`:
  - `teamName` is required.
  - `teamMembers` is required (min 1).
  - Team size must be within hackathon's `teamMin` and `teamMax`.

Required fields can depend on hackathon settings. Example:

```js
const hackathon = await fetch('/api/hackathons/hack_123').then(r => r.json());

if (hackathon.requireGithub) {
  // links array must include a github type
}

if (hackathon.requireDemoVideo) {
  // videoUrl is required
}
```

## Error Handling

Common responses:

- 400 Bad Request — validation errors
- 403 Forbidden — permission denied
- 404 Not Found — resource not found

Example error body:

```json
{
  "statusCode": 400,
  "message": "Submission deadline has passed",
  "error": "Bad Request"
}
```

Client-side example handling:

```js
try {
  const response = await fetch('/api/hackathons/submissions', {
    /*...*/
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  const submission = await response.json();
} catch (err) {
  console.error('Submission failed:', err.message);
  if (err.message.includes('deadline')) {
    alert('Submission deadline has passed');
  }
}
```

## Frontend Integration Examples

React hook example:

```js
import { useState } from 'react';

export function useHackathonSubmission(hackathonId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSubmission = async data => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hackathons/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMySubmission = async () => {
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/my-submission`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch submission');
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return { createSubmission, getMySubmission, loading, error };
}
```

Usage in a component: call `createSubmission` with the form data, handle `loading` and `error`.

## Status Flow

Submissions start as `PENDING`. Organizers review and can mark them `APPROVED` or `REJECTED`.

- Participants see only their own submission status.
- Organizers can view and manage all submissions.

---

## Notes & Best Practices

- Always validate hackathon-specific requirements before attempting submission.
- Provide helpful error messages to users when validation fails (e.g., deadline, join requirement, missing GitHub link).
- For team submissions, validate team size against hackathon limits on the client where possible to improve UX.

File: docs/hackathon-submission-api.md
