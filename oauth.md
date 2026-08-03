---
title: "OAuth Fundamentals and OBO Chaining Risk"
date: "2026-08-02"
category: "security"
tags: ["oauth", "identity", "obo", "agentic-security", "authorization"]
source: "claude"
summary: "A working reference on OAuth 2.0 mechanics and where delegated On-Behalf-Of flows tend to accumulate confused-deputy risk in agentic chains."
---
# OAuth Fundamentals and OBO Chaining Risk

OAuth 2.0 is an authorization framework, not an authentication protocol. It answers "what can this app do on my behalf?" — not "who is this person?" That second question belongs to OpenID Connect, which layers identity on top of OAuth 2.0. Conflating the two is one of the most common architectural mistakes in the space.

## Core Model

A resource owner (the user) lets a client app obtain a scoped, time-limited token from an authorization server, which the client then presents to a resource server. The client never touches the user's credentials directly.

**Four roles:**
- **Resource Owner** — the user
- **Client** — the requesting app
- **Authorization Server** — issues tokens (Okta, Auth0, Entra ID, etc.)
- **Resource Server** — the API holding protected data

## Grant Types

- **Authorization Code + PKCE** — the standard flow for browser and mobile clients. PKCE is now mandatory best practice even for confidential clients per the OAuth 2.0 Security BCP.
- **Client Credentials** — machine-to-machine, no user in the loop.
- **Refresh Token** — mints new access tokens without re-prompting the user.
- **Implicit** and **Resource Owner Password Credentials** — both deprecated. Implicit leaked tokens via URL fragments; ROPC defeats the purpose of OAuth by having the client handle raw credentials.
- **On-Behalf-Of (OBO)** — Microsoft identity platform extension for delegated token exchange across service-to-service chains, common across Azure/Entra environments.

## Tokens

- **Access token** — short-lived, presented to the resource server. Often a JWT but not required to be — can be opaque and validated via introspection.
- **Refresh token** — long-lived, used only against the authorization server.
- **ID token** (OIDC) — a JWT that actually asserts identity.

## Where It Breaks in Practice

- Treating an access token as identity proof — the classic OAuth-for-authentication anti-pattern.
- Redirect URI validation gaps enabling authorization code theft via open redirect.
- Overly broad scopes granting more privilege than the workflow needs.
- Public clients (SPAs, mobile) needing PKCE because they can't hold a secret.
- **Confused deputy in multi-hop OBO chains** — a downstream service ends up acting with more authority than the original caller should have.

## The OBO Chaining Problem

That last point is the one that matters most for agentic architectures built on delegated human credentials. Each hop in an agent-to-agent or service-to-service OBO chain is an opportunity for scope to quietly accumulate beyond what the original human actually delegated. A token minted for a narrow purpose at hop one can end up broader by hop three if intermediate services aren't enforcing a permission ceiling — each one just re-requesting and re-granting rather than constraining.

This is structurally the same confused-deputy shape as classic OAuth misconfigurations (an over-privileged client acting on a user's behalf), just relocated from a single browser redirect into a distributed chain of autonomous service calls. The fix isn't different in kind — it's scope minimization and explicit ceiling enforcement — but it's harder to audit because the chain is dynamic and the "deputy" at each hop is itself making authorization decisions rather than just forwarding a token.
