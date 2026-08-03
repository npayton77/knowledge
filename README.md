# Knowledge

Personal knowledge base powered by Astro, deployed on AWS Amplify. Content is posted directly from ChatGPT and Claude via the GitHub API.

## Architecture

```
You (in ChatGPT/Claude)
  → GitHub API (commit markdown file)
    → AWS Amplify (auto-deploy on push)
      → Static site with Google OAuth gate
```

## Quick Start (Local Dev)

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321`. Auth is disabled locally (no env vars set).

## Setup Guide

### 1. Push to GitHub

```bash
git add .
git commit -m "initial: knowledge base site"
git push -u origin main
```

### 2. Create AWS Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your GitHub repo (`npayton77/knowledge`)
4. Amplify will auto-detect the `amplify.yml` build settings
5. Deploy

### 3. Set Up Google OAuth (Optional - for private access)

#### Create a Cognito User Pool:
1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Create a new User Pool
3. Under "Sign-in experience" → Add Google as a federated identity provider
4. Set up a Google OAuth client at [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create OAuth 2.0 Client ID
   - Authorized redirect URI: `https://YOUR-COGNITO-DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse`
5. Back in Cognito, configure:
   - App client with hosted UI
   - Callback URL: your Amplify domain
   - Sign-out URL: your Amplify domain

#### Add environment variables in Amplify:
Go to Amplify → App settings → Environment variables:

| Variable | Value |
|----------|-------|
| `PUBLIC_COGNITO_USER_POOL_ID` | `us-east-1_XXXXXXXXX` |
| `PUBLIC_COGNITO_CLIENT_ID` | Your app client ID |
| `PUBLIC_COGNITO_DOMAIN` | `your-domain.auth.us-east-1.amazoncognito.com` |
| `PUBLIC_REDIRECT_SIGN_IN` | `https://your-app.amplifyapp.com/` |
| `PUBLIC_REDIRECT_SIGN_OUT` | `https://your-app.amplifyapp.com/` |

### 4. Set Up GitHub PAT (for AI posting)

1. Go to https://github.com/settings/tokens
2. Generate new token (classic) with `repo` scope
3. For Claude/Cursor: Run `gh auth login` (the Cursor skill uses `gh` CLI)
4. For ChatGPT: Add the token as the API Key in your Custom GPT Action config

### 5. Configure ChatGPT Custom GPT

See [docs/chatgpt/README.md](docs/chatgpt/README.md) for full setup instructions.

### 6. Configure Cursor Skill

The skill is installed at `~/.cursor/skills/post-to-knowledge/SKILL.md`.
Just say "post this to knowledge" in any Cursor conversation and it will handle the rest.

## Content Structure

Posts live in `src/content/posts/` as markdown files with YAML frontmatter:

```markdown
---
title: "Post Title"
date: "2026-08-02"
category: "aws"
tags: ["vpc", "networking"]
source: "claude"
summary: "Brief one-liner."
---

# Your content here
```

### Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Post title |
| `date` | string | yes | ISO date (YYYY-MM-DD) |
| `category` | string | yes | Single category (kebab-case) |
| `tags` | string[] | no | Array of tags |
| `source` | enum | no | `chatgpt`, `claude`, or `manual` |
| `summary` | string | no | One-line summary for post lists |

## Tech Stack

- **Astro 5** — Static site generator with content collections
- **AWS Amplify** — Hosting + CI/CD
- **AWS Cognito** — Google OAuth (optional)
- **GitHub API** — Content delivery from AI platforms
- **Shiki** — Syntax highlighting (github-dark theme)
