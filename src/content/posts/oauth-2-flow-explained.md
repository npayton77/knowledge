---
title: "OAuth 2.0 Flow Explained"
date: "2026-08-02"
category: "auth"
tags: ["oauth", "security", "api", "tokens"]
source: "claude"
summary: "How OAuth 2.0 authorization code flow works, step by step."
---

# OAuth 2.0 Authorization Code Flow

The authorization code flow is the most secure OAuth 2.0 grant type for server-side applications. It involves exchanging a short-lived authorization code for an access token, keeping secrets off the client.

## The Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │     │  Your App    │     │ Auth Server  │
│ (Browser)│     │  (Backend)   │     │ (Google/etc) │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘
     │                   │                    │
     │  1. Click Login   │                    │
     │──────────────────>│                    │
     │                   │                    │
     │  2. Redirect to auth server            │
     │<──────────────────│                    │
     │                   │                    │
     │  3. User authenticates + consents      │
     │───────────────────────────────────────>│
     │                   │                    │
     │  4. Redirect back with ?code=abc       │
     │<───────────────────────────────────────│
     │                   │                    │
     │  5. Forward code  │                    │
     │──────────────────>│                    │
     │                   │  6. Exchange code   │
     │                   │  + client_secret    │
     │                   │───────────────────>│
     │                   │                    │
     │                   │  7. Access token    │
     │                   │<───────────────────│
     │                   │                    │
     │  8. Logged in!    │                    │
     │<──────────────────│                    │
```

## Key Concepts

### Authorization Code
A short-lived, single-use code returned in the redirect URL. It's useless without the `client_secret`, so even if intercepted in the browser it can't be exchanged for a token.

### Access Token
The actual credential used to call APIs. Short-lived (minutes to hours). Sent as a Bearer token:

```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### Refresh Token
Long-lived token stored securely on the backend. Used to get new access tokens without re-authenticating the user:

```bash
POST /oauth/token
grant_type=refresh_token
&refresh_token=dGhpcyBpcyBhIHJlZnJlc2g...
&client_id=your-app
&client_secret=secret123
```

### PKCE (Proof Key for Code Exchange)
Required for public clients (SPAs, mobile apps) that can't securely store a `client_secret`. Adds a `code_verifier` / `code_challenge` pair to prevent authorization code interception.

```javascript
// Generate PKCE pair
const verifier = crypto.randomUUID() + crypto.randomUUID();
const challenge = btoa(
  String.fromCharCode(...new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  ))
).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
```

## Common Scopes

| Provider | Scope | Grants |
|----------|-------|--------|
| Google | `openid email profile` | Basic identity info |
| GitHub | `repo` | Full repo access |
| GitHub | `read:user` | Read user profile |
| AWS Cognito | `openid` | ID token with claims |

## When to Use Which Grant

| Grant Type | Use Case |
|------------|----------|
| Authorization Code | Server-side apps with a backend |
| Authorization Code + PKCE | SPAs, mobile apps, CLIs |
| Client Credentials | Machine-to-machine (no user) |
| Device Code | TVs, IoT, CLI tools without browser |

## Security Checklist

- Always validate the `state` parameter to prevent CSRF
- Use PKCE for any public client
- Store refresh tokens encrypted, server-side only
- Set short access token expiry (15-60 min)
- Validate token audience (`aud`) claim
- Use HTTPS everywhere, obviously
