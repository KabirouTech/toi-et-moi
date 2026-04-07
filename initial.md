You are a senior full-stack engineer and product designer.

Build a production-ready MVP for a web application called “Toi-et-Moi”.

Tech Stack:
- Framework: Next.js (App Router, latest version)
- Language: TypeScript
- UI: shadcn/ui + Tailwind CSS
- Backend: Supabase (Auth, Database, Storage, Realtime)

Goal:
Toi-et-Moi is a private digital space for couples to connect, track their journey, and store shared memories.

Core Requirements:

1. Authentication & Onboarding
- Use Supabase Auth
- One user creates an account
- After signup, user creates a “Couple Space”
- Generate a unique invite link
- Second user joins via invite link
- Both users now share the same space (same data)

2. Database Design (Supabase)
Design schema with relationships:

Tables:
- users (handled by Supabase)
- couples
  - id
  - name (optional, e.g. “John & Sarah”)
  - created_at

- couple_members
  - id
  - couple_id
  - user_id
  - role (owner / partner)

- memories
  - id
  - couple_id
  - title
  - description
  - date
  - created_by
  - created_at

- memory_photos
  - id
  - memory_id
  - image_url

- events (calendar)
  - id
  - couple_id
  - title
  - date
  - type (date, anniversary, other)
  - created_by

- questions_progress
  - id
  - couple_id
  - question_index
  - completed_at

3. Pages / App Structure

- / (Landing page)
  - Elegant, romantic, minimal design
  - CTA: “Create your space”

- /dashboard
  - Couple name
  - “Days together” counter (based on anniversary date)
  - “Question of the day”
  - Navigation cards:
    - Questions
    - Memories
    - Calendar

- /questions
  - 36 Questions experience
  - Card-based UI (swipe or next)
  - Save progress to Supabase

- /memories
  - Gallery view
  - Add memory modal:
    - title
    - description
    - date
    - upload images (Supabase storage)

- /calendar
  - Simple calendar UI
  - Add events (date nights, anniversaries)

- /invite
  - Generate + copy invite link

4. UI/UX Design Requirements

- Use shadcn/ui components
- Aesthetic:
  - Dark mode default
  - “Celestial / romantic” theme
  - Soft gradients, subtle animations
- Typography:
  - Elegant serif feel (approximate with Tailwind + Google Fonts)
- Components to use:
  - Card
  - Dialog (modals)
  - Button
  - Input
  - Calendar component
  - Tabs / Navigation

5. State Management
- Use React hooks + server components where appropriate
- Use Supabase client for all data fetching
- Realtime sync for shared data (optional but preferred)

6. File Structure

- app/
  - layout.tsx
  - page.tsx (landing)
  - dashboard/
  - questions/
  - memories/
  - calendar/
  - invite/

- components/
  - ui/ (shadcn)
  - custom components (MemoryCard, QuestionCard, etc.)

- lib/
  - supabaseClient.ts
  - helpers (date utils, etc.)

7. Features to Implement First (Priority)

1. Auth + Couple creation + Invite system
2. Dashboard
3. Memories (with image upload)
4. Questions (basic version)
5. Calendar (basic version)

8. Additional Requirements

- Clean, modular code
- Reusable components
- Proper loading states and error handling
- Environment variables for Supabase keys
- Mobile-first responsive design

9. Deliverables

- Full Next.js project structure
- Supabase schema SQL
- Instructions to run locally
- Example .env file

10. Optional Enhancements (if time permits)

- Background music toggle
- Smooth page transitions (framer-motion)
- “Love note of the day”
- Push notifications (future-ready)

Important:
Focus on clarity, simplicity, and a premium feel. Avoid overengineering. The product should feel intimate and calm, not busy.
