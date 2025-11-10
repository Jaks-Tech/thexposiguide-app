---
title: "Perfect 👏 You now have a complete full-stack Next.js 16 app structure"
description: "Complete project documentation for XPosiGuide - a full-stack Next.js 16 application with admin portal, AI integration, and markdown-based learning modules"
date: 2025-11-06
author: ""
tags: ["Next.js", "Full-Stack", "Documentation", "Project Structure"]
---

Perfect 👏

You now have a complete full-stack Next.js 16 app structure, and from your screenshot it looks excellent — very organized and production-ready.

Let's go over the final, complete project documentation for your actual folder structure (based exactly on that screenshot).

This will describe every directory, what each file does, how the system fits together, and how to keep it working smoothly both locally and on Vercel.

---

## 🧭 The XPosiGuide – Full Project Documentation (Based on Your Current Codebase)

### ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Data Storage | public/xposilearn + JSON files |
| Authentication | Client-side password with LocalStorage |
| Markdown Parsing | Server-side rendering via modules |
| AI Integration | /api/ask-ai endpoint |

---

## 🏗 Folder-by-Folder Breakdown

### Root Directory (/)

Contains core configuration and metadata.

| File | Purpose |
|------|---------|
| .env.local | Stores sensitive environment variables such as ADMIN_PASSWORD. |
| .gitignore | Ignores build and secret files from version control. |
| README.md | Your main documentation file (you can copy this full explanation into it). |
| package.json / package-lock.json | Project dependencies and build scripts. |
| next.config.ts | Next.js configuration (TypeScript-compatible). |
| tailwind.config.js | Tailwind setup (colors, theme, extensions). |
| tsconfig.json | TypeScript compiler setup. |
| postcss.config.mjs | Enables Tailwind and PostCSS for styling. |
| eslint.config.mjs | ESLint rules for linting your project. |

---

### 🖼 /public Folder

Holds static, publicly accessible assets that are served as-is.

| Path | Description |
|------|-------------|
| /public/assets | General static files (logo, icons). |
| /public/illustrations | Images used in markdown cards for modules (upper, lower, pelvic). |
| /public/images | Miscellaneous images, placeholders. |
| /public/xposilearn/modules | The main markdown content folders. Each module folder (upper, lower, pelvic) contains .md files uploaded by admin. |
| /public/xposilearn/notes | Notes uploaded for student reference. |
| /public/xposilearn/papers | Past paper uploads. |
| /public/xposilearn/useful-links.json | Stores external learning resources (added via admin panel). |
| /public/*.svg | Various icons used throughout the site. |

> 🧠 **Tip:** In Vercel production, this folder is read-only. You'll need external storage (Supabase or Firebase) if you want to persist uploads online.

---

### 📁 /src Folder

This is the heart of your Next.js app. It contains your pages, API routes, React components, utilities, and styling.

#### 1️⃣ /src/app — Main Application Logic

| Subfolder / File | Purpose |
|-----------------|---------|
| layout.tsx | Root layout that wraps every page in `<html>` and `<body>`. Includes `<Header />` and `<Footer />`. |
| page.tsx | Home page of the site (/). Introduces XPosiGuide. |
| globals.css | Tailwind + global styles. |
| theme.css | Custom theme overrides (colors, gradients, animations). |

#### 📂 /src/app/admin

The administrative area for uploads, links, and content management.

| File | Description |
|------|-------------|
| /admin/login/page.tsx | Password-protected login screen. Saves admin-auth in localStorage. |
| /admin/page.tsx | Admin Dashboard: allows uploads, deletions, and useful link management. |
| /admin/change-password/page.tsx | (Optional future use) Allows admin password changes by verifying old credentials. |
| /admin/upload/page.tsx | Dedicated upload UI (if separated from dashboard). |

**🧠 Flow:**
- When visiting /admin, the system checks localStorage["admin-auth"].
- If not found, user is redirected to /admin/login.
- The /api/verify-admin route validates password input using ADMIN_PASSWORD.

#### 📂 /src/app/api — Serverless API Endpoints

Each folder = 1 API endpoint.

| API Route | File | Purpose |
|-----------|------|---------|
| /api/upload | upload/route.ts | Handles uploading .md and image files to correct subfolders. |
| /api/delete | delete/route.ts | Deletes selected file from public/xposilearn/modules/.... |
| /api/list-files | list-files/route.ts | Returns list of files for dropdown menus in admin dashboard. |
| /api/add-link | add-link/route.ts | Appends new link entry to useful-links.json. |
| /api/delete-link | delete-link/route.ts | Removes link entry from useful-links.json. |
| /api/get-links | get-links/route.ts | Returns all links for admin dropdown and frontend rendering. |
| /api/verify-admin | verify-admin/route.ts | Validates entered password against env variable. |
| /api/admin-pass | admin-pass/route.ts | (Optional) Allows password change (if implemented). |
| /api/ask-ai | ask-ai/route.ts | Connects to OpenAI API for AI-based radiography Q&A or positioning support. |
| /api/test-env | test-env/route.ts | Debugging endpoint for checking if environment variables load correctly. |

#### 📂 /src/app/upper-extremities, /lower-extremities, /pelvic-girdle

Each folder represents one learning module section.

| File | Description |
|------|-------------|
| page.tsx | Renders module overview (cards with markdown previews). |
| [slug]/page.tsx | Dynamic route that loads and displays the full markdown content (e.g., /upper-extremities/ap-wrist-projection). |

These pages fetch .md files from public/xposilearn/modules/{module} and display them beautifully with related illustration images.

#### 📂 /src/app/xposi-ai

| File | Description |
|------|-------------|
| page.tsx | The AI interface page where users can ask positioning questions. |
| XPosiAIClient.tsx | The main chat component connecting frontend ↔ /api/ask-ai backend. |

#### 📂 /src/app/xposilearn

| File | Description |
|------|-------------|
| page.tsx | Main learning hub. Lists resources, modules, and reads from useful-links.json. |
| /papers/ | Displays uploaded past papers. |
| /notes/ | Displays uploaded study notes. |

#### 2️⃣ /src/components — Reusable UI Components

| File | Description |
|------|-------------|
| Header.tsx | Global top navigation bar with sidebar dropdown and animated running text. |
| Sidebar.tsx | Optional offcanvas sidebar (used on mobile or admin). |
| Footer.tsx | Site footer with copyright info. |
| GalleryImage.tsx | Displays illustrations dynamically in module pages. |
| EntryCard.tsx | Renders markdown entries as cards on module index pages. |
| ResourceCard.tsx | Displays external links and learning resources. |
| AIAnswerBox.tsx | Styled output box for the AI's response in XPosi AI. |
| ReadAloud.tsx | Adds text-to-speech accessibility on markdown pages. |

All components are styled using Tailwind utility classes and some custom animations from theme.css.

#### 3️⃣ /src/lib — Helper Functions

| File | Description |
|------|-------------|
| images.ts | Function resolveImageUrl() — finds matching illustration image for a given markdown slug or title. |
| md.ts | Handles markdown parsing and formatting logic (reading .md files, extracting frontmatter). |

#### 4️⃣ /src/styles — Styling

| File | Description |
|------|-------------|
| globals.css | Tailwind CSS import + general global styles. |
| theme.css | Custom color palette, gradients, and animations. |

---

## 🔐 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| ADMIN_PASSWORD | Password for admin login | mypassword123 |
| OPENAI_API_KEY | For /api/ask-ai | Provided by OpenAI |

💡 Stored locally in .env.local and in Vercel Dashboard → Settings → Environment Variables for Production.

---

## 🧠 Authentication Flow Summary

1. Admin visits /admin
2. useEffect checks if localStorage.getItem("admin-auth") exists
3. If missing → redirect to /admin/login
4. Login page posts to /api/verify-admin
5. If password correct → set localStorage.setItem("admin-auth", "true") and redirect to /admin
6. Admin can now upload, delete, and manage files/links

---

## ☁️ Vercel Deployment Notes

- Static pages (page.tsx) are pre-rendered.
- All /api/ routes are serverless functions.
- public/ is read-only on Vercel → local file uploads won't persist.
- ✅ **Recommended:** integrate Firebase Storage or Supabase Storage for real persistence.

**To redeploy:**


Vercel rebuilds automatically.

---

## 💡 Development Commands

| Command | Purpose |
|---------|---------|
| npm run dev | Run local development server. |
| npm run build | Create production build. |
| npm start | Run production server locally. |
| vercel dev | Test serverless functions locally via Vercel CLI. |
| vercel env ls | Check configured environment variables. |

---

## ✅ Summary of Functional Features

| Feature | Description |
|---------|-------------|
| 📚 Module Content | Markdown-based lessons organized by region (upper, lower, pelvic). |
| 🧠 XPosi AI | Chat interface powered by OpenAI. |
| 🔐 Admin Portal | Upload/delete/manage markdowns and links. |
| 🌐 Useful Links | JSON-based list of educational resources. |
| 🧱 Fully Responsive | Optimized layout for desktop and mobile. |
| 💬 Accessibility | Includes text-to-speech reading on markdowns. |
| 📦 Easy Deploy | Works locally + on Vercel (with cloud upload upgrade). |

---

Would you like me to now generate this entire description as a README.md file, fully formatted with headings, emoji, and proper markdown syntax so you can drop it into your repo root?

That will make your GitHub project look professional and self-documented.
