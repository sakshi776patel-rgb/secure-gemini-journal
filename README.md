# Secure Gemini Journal

An AI-powered personal journaling platform built for the Google Cloud Run AI Challenge. The application delivers an empathetic, multi-turn conversational journaling experience while enforcing strict user privacy and enterprise-grade backend security.

> **Deployment Tag / Label:** `dev-tutorial=cloud-run-ai-challenge`

---
## ✨ Unique App Features

* **Roast or Boost Mode:** Dynamic AI personas that adapt to your emotional state—choose to get gently motivated (Boost) or receive a humorous, tough-love reality check (Roast).
* **Chat With Your Past:** Seamlessly retrieve, reflect on, and converse with your previous journal entries using contextual AI memory.
* **AI Mood Tracker & Smart Auto-Tagging:** Automatically analyzes your daily sentiment and intelligently tags journal entries for effortless filtering.

## Key Architecture & Features

* **User Authentication via Firebase:** Secure identity management supporting federated authentication (Google Sign-In) to establish isolated user sessions.
* **Multi-Turn Gemini API Interaction:** Real-time conversational reflections powered by Google's Gemini models, maintaining conversational context across dialogue turns.
* **User-Isolated Firestore Storage:** Data layer secured by granular Cloud Firestore Security Rules, ensuring users can only create, query, and modify their own private journal entries.
* **Google Cloud Secret Manager:** Zero client-side credential exposure. API keys and configuration secrets are managed and injected strictly at runtime via GCP Secret Manager.
* **Containerized Architecture:** Dockerized full-stack service configured for scalable container runtimes like Google Cloud Run with label `dev-tutorial=cloud-run-ai-challenge`.

---

## Tech Stack

* **Frontend & Backend:** Node.js / Express / Modern Web UI
* **AI & Machine Learning:** Google Gemini API
* **Database & Auth:** Firebase Authentication, Cloud Firestore
* **Security & Cloud:** Google Cloud Secret Manager, Cloud Run, Docker

---

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/sakshi776patel-rgb/secure-gemini-journal.git](https://github.com/sakshi776patel-rgb/secure-gemini-journal.git)
   cd secure-gemini-journal
