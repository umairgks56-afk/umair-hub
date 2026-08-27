# UMAIR HUB — Product Roadmap

## North star

UMAIR HUB is a personal AI workspace for students. A student uploads source material once and can use the same knowledge base for learning, revision, practice, exams, assignments and presentations.

## Core navigation

- Home / Overview
- My Courses
- My Library
- AI Tutor
- Notes
- Quizzes & MCQs
- Exams & Papers
- Presentations
- Flashcards
- Mistakes
- Study Planner
- Calendar
- Progress & Analytics
- Assignments
- Research & Citations
- Viva / Presentation Practice
- Settings

## Source pipeline

Upload → extract → normalize → chunk → index → retrieve → generate → verify → cite.

Source-based outputs must prefer the user's selected material and clearly indicate when information cannot be verified from it.

## AI provider abstraction

The application must not couple product features directly to one model provider. Use a provider interface so OpenAI, Gemini, local/open-source models, or other compatible providers can be swapped through configuration.

## Phase 1 — Foundation

- Premium responsive application shell
- UMAIR HUB visual identity
- Dashboard cards and quick actions
- Course/library data model
- AI provider interface
- Environment configuration
- Error/loading/empty states
- Accessible component system

## Phase 2 — Material intelligence

- PDF/PPT/DOC/image ingestion
- OCR for scanned material
- Course knowledge bases
- Source search
- Ask My Material
- Page/source citations

## Phase 3 — Study engine

- Quick/detailed/exam notes
- Summaries
- Definitions and key points
- Flashcards
- Mind maps
- Study packs
- AI Tutor
- Socratic mode

## Phase 4 — Assessment engine

- MCQ generation
- Large question banks
- Difficulty controls
- Multiple question types
- Random/adaptive tests
- Full exam simulator
- Paper generator
- Answer keys and marking schemes
- Mistake book

## Phase 5 — Presentation engine

- Source-to-outline generation
- Slide generation
- Visual selection
- Charts/diagrams
- Slide editor
- AI slide refinement
- Speaker notes
- Presentation Q&A
- PPTX/PDF export

## Phase 6 — Personal intelligence

- Syllabus mapping
- Weak-topic detection
- Mastery model
- Exam readiness
- AI study planner
- Smart reminders
- "What should I study now?"
- Exam Emergency Mode
- GPA/marks tools

## Phase 7 — Advanced modes

- Viva simulator
- Audio study mode
- Explainer video workflows
- Assignment assistance
- Research/citations
- Past-paper analysis
- Teacher mode
- Sharing/collaboration

## Quality bar

Every feature should be mobile-friendly, fast, accessible, visually polished, and resilient to failed/partial AI generations. Never expose API keys in client code. Keep generated content traceable to its source when source grounding is requested.
