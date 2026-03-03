Project Detail Page Redesign Documentation

Overview

This redesign improves the Project Detail page for both crowdfunding projects and hackathon submissions.
The objective is to create a simpler, clearer, and more professional experience by improving layout structure, visual hierarchy, and interaction flow. The redesign focuses on clarity of primary actions (Vote / Back), improved content readability, and consistent behavior across desktop and mobile.

---

Design Principles

- Clear primary action above the fold
- Strong visual hierarchy
- Reduced visual noise
- Consistent spacing and typography
- Intentional use of the green accent
- Professional and trustworthy product feel

---

Layout Structure

Desktop
Left: Sticky summary sidebar

- Project logo
- Title
- Status and short description
- Progress (votes/funding where applicable)
- Primary CTA (Vote or Back)
- Secondary actions (Share)
- Creator info and external links

Right: Main content area

- Horizontal tab navigation
- Dynamic tab content
- Optimized reading width for long-form content

> The sidebar remains visible while scrolling to maintain action visibility and improve engagement.

Mobile

- Sidebar collapses into a condensed header block
- Horizontal scrollable tab navigation
- Single-column content layout
- Primary CTA positioned prominently without overwhelming the interface

> No feature loss between desktop and mobile.

---

Component Redesign

1. Loading State
   A simplified skeleton layout that mirrors final structure:

- Sidebar placeholder block
- Tab row skeleton
- Content block placeholders
- Reduced visual motion for a clean, professional feel

> The loading state communicates layout structure without clutter.

---

2. Sidebar (Desktop) / Header Block (Mobile)
   Improvements:

- Strong title hierarchy
- Short description positioned clearly under title
- Simplified progress visualization
- One clearly emphasized primary action
- Secondary actions styled with lower visual weight
- Creator avatar and name placed below primary CTA
- External links grouped and visually subtle

> The goal is clarity and action focus.

---

3. Tab Bar
   Tabs: Details, Team, Milestones, Voters (optional), Backers (optional), Comments
   Improvements:

- Clear selected state
- Subtle hover state
- Consistent spacing and typography
- Scrollable on mobile
- Optional tabs hidden gracefully when not applicable

> The tab system is visually lightweight but structurally strong.

---

Tab-Level Redesign
Details Tab

- Controlled reading width for markdown content
- Clear heading hierarchy
- Improved paragraph spacing
- Links styled consistently
- Optional media block positioned after introduction
- Improved vertical rhythm

> Focus: readability and professional presentation.

Team Tab

- Grid layout on desktop
- Vertical list on mobile
- Avatar, name, and role hierarchy clearly defined
- Clean spacing between members

Empty State Example:

> No team members yet. This project is currently solo.

Milestones Tab

- Vertical timeline layout
- Status indicators (Upcoming, Active, Completed)
- Clean separation between stages
- Optional filter alignment

Empty State Example:

> No milestones have been added yet.

Voters Tab

- Clean list layout
- Vote indicators clearly distinguished
- Sorting control aligned with header

Empty State Example:

> No votes yet. Be the first to support this project.

Backers Tab

- Supporter card or structured list layout
- Clear contribution display
- Encouraging but subtle empty state

Empty State Example:

> Be the first to back this project.

Comments Tab

- Structured threaded layout
- Controlled indentation depth
- Clear reply visibility
- Sorting dropdown aligned to section header
- Clean comment input field with clear submit action

Empty State Example:

> No comments yet. Start the discussion.

---

Empty State Strategy
Each tab includes a purposeful empty state to avoid dead screens:

- Encourage action
- Maintain tone consistency
- Support engagement goals

---

Error State Strategy
Each tab and interactive component must handle failures gracefully to maintain clarity, trust, and engagement.

General Principles

- Display a clear, concise error message in context
- Offer a retry action when appropriate
- Maintain the same layout structure as loading and empty states
- Keep messaging professional and consistent with tone

Tab-Level Examples
Details / Team / Milestones / Voters / Backers / Comments Tabs

- Error message: “Something went wrong while loading this content.”
- Retry CTA: “Try again” button positioned centrally within the tab content area
- Maintain spacing and typography consistency with other states

Comment Submission Failure

- Inline error: “Your comment could not be submitted.”
- Preserve typed input so users don’t lose their content
- Include a retry button adjacent to the input field

Vote / Back Action Failure

- Inline or toast notification: “Your vote could not be recorded.”
- Provide immediate retry option
- Ensure visual distinction from primary actions to avoid confusion

Deliverables for Implementation

- Error-state mockups for all tabs and key actions
- Retry interaction designs and user flow diagrams
- Copy for all error messages and notifications

---

UX Improvements

- Single primary CTA above the fold
- Sticky action area improves conversion
- Stronger reading experience
- Consistent spacing system
- Clear separation of primary vs secondary actions
- Reduced cognitive load

---

Visual System Adjustments

- Reduced shadow usage
- Controlled border radius for consistency
- Green accent reserved primarily for key actions and highlights
- Improved typography hierarchy
- Balanced whitespace for clarity

> The page now feels lighter, more modern, and more trustworthy.

---

Responsiveness Strategy

- Sidebar collapses into header on smaller screens
- Horizontal tab scroll
- Content reflows naturally
- No feature disparity between device sizes

---

Deliverables

- Desktop full-page mockups (all tabs)
- Mobile full-page mockups (all tabs)
- Component-level breakdown
- Loading, empty, and error state designs
- Retry interaction and UX flow documentation
- UX recommendations

Figma link:
https://www.figma.com/design/EMNGAQl1SGObXcsoa24krt/Boundless_Project-Details?node-id=0-1&t=TAP62qLgaqjB5B1K-1
