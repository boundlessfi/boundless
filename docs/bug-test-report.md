# Bug Test Report: Organization & Onboarding Flow

**Project:** BoundlessFi  
**Date:** March 7, 2026  
**Environment:** Frontend (Local) / Backend (Staging API)  
**Status:** Issue #448 Verification Complete

---

## 1. Executive Summary

Overall, core organization features (creation, search, and navigation) are stable. However, critical blockers exist within the **Invitation Lifecycle** and **Hackathon Publishing** flows. Additionally, UX refinements are needed for mobile navigation and input validation.

---

## 2. Issue #448 Verification Status [COMPLETED]

All items specified in Issue #448 have been verified for production readiness:

| Feature                  | Status | Notes                                                |
| :----------------------- | :----- | :--------------------------------------------------- |
| **Public Profile Route** | Pass   | `/org/[slug]` functions correctly end-to-end.        |
| **OG Metadata**          | Pass   | Title, description, and images validated.            |
| **Settings Tabs**        | Pass   | Profile, Links, Members, and Transfer verified.      |
| **Sidebar Actions**      | Pass   | Host Hackathon and Grants (disabled state) verified. |
| **Search/Sort**          | Pass   | Search and sort keys behave as expected.             |
| **Deep-linking**         | Pass   | Direct URL loading for organizations is functional.  |
| **Header Search**        | Pass   | `⌘K` navigation is bug-free.                         |
| **Profile Validation**   | Pass   | Slug/Profile validation logic is functional.         |
| **Mobile Responsive**    | Pass   | Hamburger menu is functional on settings pages.      |

---

## 3. High-Priority Bugs

### BUG-001: Invite Link Routing Mismatch (404)

- **Issue:** Generated invite links point to `/signup` instead of the active `/auth` route.
- **Example Link:** `https://staging.boundlessfi.xyz/signup?invitationId=...`
- **Impact:** Users cannot join organizations via email.
- **Recommended Fix:** Update `getInvitationUrl` in the backend/auth-config to target `/auth`.

### BUG-002: Invite Acceptance Logic Failure

- **Issue:** Manually correcting the URL to `/auth` allows sign-up, but the user is not associated with the organization.
- **Actual Behavior:** User is redirected to home; status remains "Pending"; member list is not updated.
- **Expected Behavior:** User should automatically join the organization and redirect to the org dashboard.

### BUG-003: Hackathon Publish Endpoint (404)

- **Action:** Click **Publish** in the Preview tab for a draft hackathon.
- **Observed Error:** `PUT .../api/organizations/{orgId}/hackathons/draft/{hackathonId}/publish` returns **404 Not Found**.
- **Likely Root Cause:** Wallet balance is insufficient for publish-related on-chain or fee-dependent operations.
- **UX Gap:** The UI does not tell users that the publish failure is caused by **insufficient wallet funds**.
- **Impact:** Users cannot move hackathons from "Draft" to "Live" and do not know how to resolve it.
- **Suggestion:** Show a clear inline/toast error such as: `Insufficient wallet funds to publish. Please fund your wallet and try again.`

**Suggested User Guidance (Fund Wallet Steps)**

1. Open wallet settings from the profile/wallet menu.
2. Copy your connected wallet address.
3. Add funds to that wallet on the required network (via exchange transfer, bridge, or faucet for test/staging).
4. Wait for transaction confirmation and refresh the app.
5. Return to the hackathon draft and click **Publish** again.

### BUG-004: Delete/Archive Organization Non-Functional

- **Issue:** Actions to delete or archive an organization fail.

**What I tested**

- Opened `/organizations`.
- Selected an organization.
- Clicked the **Archive** button and completed the confirmation prompt.
- Clicked the **Delete** button and completed the confirmation prompt.

**Observed Result**

- Both actions failed.
- The organization was not archived and not deleted.

**Expected Result**

- Archive should move the organization to archived state.
- Delete should remove the organization.

**Scope**

- Test type: Manual UI test.
- Environment: Frontend local + staging backend.
- Role: Owner.
- Organizations tested: 1 organization in this pass.

## 4. UI/UX Improvements

### UX-001: Mobile Navigation Tabs (Host Hackathon)

- **Observation:** Sub-navigation tabs (e.g., Participation, Edit) are difficult to access/truncated on mobile screens.
- **Suggestion:** Implement **horizontal scrollable tabs** for sub-nav menus to improve mobile accessibility.

### UX-002: Slug Availability Feedback

- **Issue:** The UI displays "Slug available" even for taken slugs, only failing upon final form submission.
- **Suggestion:** Real-time validation should return "Slug already taken" before the user attempts to submit.

### UX-003: Password Strength Feedback

- **Issue:** Form submission is blocked for weak passwords without explaining why.
- **Suggestion:** Add a helper text: _"Password must be at least 8 characters and include a number."_

---

## 5. Technical Edge Cases

### Route Guarding: Invalid Organization IDs

- **Issue:** Manually entering an invalid ID (e.g., `/organizations/random123/settings`) still renders the settings UI shell.
- **Recommendation:** Implement a check to return a 404 page if the Organization ID does not exist in the database.

---

**Reported by:** QA Team  
**Branch:** `Test/Test-the-organization-flow---manual-QA-checklist`
