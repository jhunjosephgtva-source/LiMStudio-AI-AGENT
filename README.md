# LiMStudios Process Assistant

A NotebookLM-style internal tool: browse and chat with an AI about LiMStudios's documented processes (podcast production, Pixieset delivery, GHL/CRM workflows, video editing, etc.), and add/edit/remove/upload new processes as the company's workflows change.

The database is already set up and seeded with 27 processes pulled from the training transcripts. You just need to deploy the app and connect a couple of environment variables.

---

## 1. Push this code to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial commit: LiMStudios Process Assistant"
git branch -M main
git remote add origin https://github.com/<your-username>/limstudios-process-assistant.git
git push -u origin main
```

(Create the empty repo on GitHub first — github.com → New repository — then run the commands above.)

## 2. Connect it to Vercel

1. Go to vercel.com → **Add New… → Project**.
2. Import the GitHub repo you just pushed.
3. Vercel will auto-detect Next.js — leave the build settings as default.
4. Before clicking Deploy, add the environment variables below (or add them right after the first deploy, under **Project → Settings → Environment Variables**, then redeploy).

## 3. Environment variables to set in Vercel

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://rdurvmvkuyiscgqiqwfd.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdXJ2bXZrdXlpc2NncWlxd2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjU3NTYsImV4cCI6MjA5OTYwMTc1Nn0.VXIF7m9jDOZh4ZM6YgxJadvpM3-oxrgLi0Fr0hDD5vo` |
| `ANTHROPIC_API_KEY` | *(you provide this — get one at console.anthropic.com/settings/keys)* |
| `ANTHROPIC_MODEL` | `claude-sonnet-5` (optional — this is the default) |
| `ADMIN_PASSWORD` | *(you choose this — this is what unlocks add/edit/delete/upload in the app)* |

The Supabase project (`limstudios-process-assistant`) and its `processes` table are already live and pre-seeded — you don't need to touch Supabase at all unless you want to look at the data directly.

Once the env vars are set, redeploy (Vercel does this automatically on the next git push, or you can trigger a redeploy manually from the dashboard).

## 4. Using the app

### Asking questions
Just type in the chat box. The assistant only answers using the processes you've selected (checkboxes) in the left sidebar — if none are checked, it uses all of them. Every answer shows which process(es) it pulled from as small tags underneath.

### Adding a process
1. Click **Unlock admin** (top right) and enter the `ADMIN_PASSWORD` you set.
2. Click **+ Add** in the sidebar.
3. Either type/paste the steps directly, or click **Upload transcript/doc** to pull text out of a `.txt`, `.md`, `.docx`, or `.pdf` file — the extracted text lands in the editable box so you can clean it up before saving.
4. Give it a title and (optional) category, then **Add process**.

### Editing or removing a process
While unlocked, hover over any process in the sidebar to reveal a pencil (edit) and trash (delete) icon.

### Changing the admin password
Update the `ADMIN_PASSWORD` environment variable in Vercel and redeploy. There's no in-app password reset — it's just the one shared value.

### How the chatbot decides what's "in scope"
The system prompt explicitly tells Claude to answer only from the processes you've selected in the sidebar, and to say plainly when something isn't documented yet rather than guessing or using outside knowledge. If it says "no documented process for that," that's your cue to add one.

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values above
npm run dev
```

Visit http://localhost:3000.

## Tech stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres) for storing processes
- Anthropic API for the chat responses (simple RAG: selected processes' full text is passed as context — no separate embeddings step needed at this scale)
- Deployed on Vercel
