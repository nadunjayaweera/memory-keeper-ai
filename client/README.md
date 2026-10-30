# 🕯️ Memory Keeper AI

### Every memory deserves to live forever.

**A privacy-first, AI-powered digital memory preservation application built with React, Express.js, Gemma, and Ollama.**

Created for **Hacktoberfest 2026 — Ghost in the Machine**, inspired by the spirit of remembrance, Día de los Muertos, and the stories that connect our past with our present.

![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2026-orange)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933)
![Express](https://img.shields.io/badge/Express.js-REST_API-000000)
![Ollama](https://img.shields.io/badge/Ollama-Local_AI-222222)
![Gemma](https://img.shields.io/badge/Gemma_3-1B_Model-8E75B2)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌸 The Story Behind Memory Keeper

We capture thousands of photographs, write messages, and share special moments throughout our lives. But over time, the little stories behind those memories can fade away.

A photograph might remind us of a moment, but what about the laughter, the conversations, and the feelings associated with it?

**Memory Keeper AI was created to help preserve those stories.**

Inspired by the Hacktoberfest theme _Ghost in the Machine_, Memory Keeper explores how artificial intelligence can help us honor the past without pretending to recreate the people we have lost.

Instead of building another general-purpose chatbot, Memory Keeper uses locally running AI to transform personal recollections into thoughtful narratives.

The goal is simple:

**Preserve memories. Celebrate connections. Keep stories alive.**

---

## ✨ Features

### 📝 Create Personal Memories

Write about meaningful moments, childhood experiences, family traditions, or loved ones.

Users can provide:

- Memory title
- Original memory description
- Person associated with the memory
- Preferred storytelling tone

### 🤖 AI-Powered Memory Storytelling

Memory Keeper uses **Gemma 3 1B**, running locally through **Ollama**, to turn personal memories into meaningful narratives.

The AI is instructed to preserve the original facts rather than inventing events, names, or conversations.

### ❤️ Emotional Storytelling Tones

Choose how a memory should be expressed:

| Tone          | Description                    |
| ------------- | ------------------------------ |
| Warm & Loving | Gentle, heartfelt storytelling |
| Reflective    | Thoughtful and nostalgic       |
| Celebratory   | Joyful and uplifting           |

### 📚 Digital Memory Collection

Save AI-generated memories and revisit them whenever you wish.

Users can:

- Browse their memory collection
- View original memories and generated stories
- Search saved memories
- Filter preserved memories and drafts
- Delete unwanted memories

### 🔐 Local AI and Storage

Memories are processed using Ollama on the user's computer.

The application uses local JSON files for storage instead of a cloud database.

The core AI functionality does not require third-party AI API services.

### 🌙 Responsive User Interface

A nostalgic interface inspired by handwritten letters, personal journals, and treasured memories.

Includes:

- Memory dashboard
- Memory creation form
- AI-generated story preview
- Story reading experience
- Light and dark modes
- Responsive desktop and mobile layouts

---

## 🛠️ Technology Stack

| Layer         | Technology   | Purpose                           |
| ------------- | ------------ | --------------------------------- |
| Frontend      | React.js     | Interactive user interface        |
| Build Tool    | Vite         | Frontend development              |
| Styling       | CSS          | Responsive styling and animations |
| Icons         | Lucide React | UI icons                          |
| Backend       | Node.js      | Server-side runtime               |
| API Framework | Express.js   | REST API                          |
| AI Model      | Gemma 3 1B   | Memory storytelling               |
| AI Runtime    | Ollama       | Local model inference             |
| Database      | JSON Files   | Local memory persistence          |

---

## 🏗️ System Architecture

```text
               MEMORY KEEPER AI
                       |
                       v
              +------------------+
              |  React Frontend  |
              |   Vite + CSS     |
              +------------------+
                       |
                       | REST API
                       v
              +------------------+
              | Express Backend  |
              |     Node.js      |
              +------------------+
                  |           |
                  v           v
          +-------------+  +---------------+
          |   Ollama    |  | JSON Storage  |
          | Gemma 3 1B  |  | memories.json |
          +-------------+  +---------------+
                  |
                  v
          AI-Generated Stories
```

### How It Works

1. The user enters a personal memory through the React frontend.
2. React sends the memory to the Express backend.
3. Express prepares a structured prompt for Gemma.
4. Ollama runs Gemma locally and returns the generated response.
5. Express processes the response and stores the generated memory as a draft.
6. The user reviews the AI-generated story.
7. The user can preserve the story in their memory collection.
8. Saved memories remain available in local JSON storage.

---

## 📁 Project Structure

```text
memory-keeper-ai/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── data/
│   │   └── memories.json
│   ├── index.js
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

The `memories.json` file is created locally and should not be committed to GitHub.

---

## 🚀 Getting Started

### Prerequisites

Before starting, install:

- Node.js 20 or newer
- npm
- Git
- Ollama
- Gemma 3 1B model

**Node.js:** https://nodejs.org/

**Ollama:** https://ollama.com/download

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/memory-keeper-ai.git

cd memory-keeper-ai
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 2 — Install Ollama and Gemma

After installing Ollama, open a terminal and run:

```bash
ollama pull gemma3:1b
```

Verify the installed model:

```bash
ollama list
```

Test Gemma:

```bash
ollama run gemma3:1b
```

Ollama should be running locally at:

```text
http://localhost:11434
```

### Step 3 — Start the Backend

Open a terminal:

```bash
cd server

npm install

npm run dev
```

Expected output:

```text
Memory Keeper AI running at http://127.0.0.1:5000
AI Model: gemma3:1b
```

### Step 4 — Start the Frontend

Open another terminal from the project root:

```bash
cd client

npm install

npm run dev
```

Open the application in your browser:

```text
http://localhost:5173
```

The React application will communicate with the Express backend using the configured Vite proxy.

---

## 📡 API Endpoints

Base URL:

```text
http://localhost:5000
```

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | `/api/health`                | Check backend status         |
| POST   | `/api/generate-memory-story` | Generate a story using Gemma |
| GET    | `/api/memories`              | Retrieve all memories        |
| GET    | `/api/memories/:id`          | Retrieve a specific memory   |
| PATCH  | `/api/memories/:id/save`     | Preserve a generated memory  |
| DELETE | `/api/memories/:id`          | Delete a memory              |

### Example: Generate a Memory Story

**POST** `/api/generate-memory-story`

Request:

```json
{
  "title": "A Summer with Grandmother",
  "memory": "Every evening, my grandmother and I sat under the mango tree and watched the sunset together. She shared stories about her childhood.",
  "person": "Grandmother",
  "tone": "warm"
}
```

Response structure:

```json
{
  "success": true,
  "memory": {
    "id": "generated-uuid",
    "title": "A Summer with Grandmother",
    "original_memory": "Every evening, my grandmother and I sat under the mango tree and watched the sunset together. She shared stories about her childhood.",
    "person": "Grandmother",
    "tone": "warm",
    "story_title": "Evenings Under the Mango Tree",
    "story": "AI-generated narrative...",
    "closing_note": "AI-generated closing reflection...",
    "status": "DRAFT",
    "created_at": "2026-10-30T12:00:00.000Z",
    "saved_at": null
  }
}
```

The generated story varies depending on the memory and model response.

---

## 🧠 Why Open-Source AI?

One of the most important decisions behind Memory Keeper was choosing **local open-weight AI instead of a cloud-based proprietary AI API**.

Personal memories can contain sensitive stories, names, and emotional experiences.

Sending this information to external AI services should not be a requirement for preserving it.

### Privacy First

Gemma runs locally using Ollama.

Memory content is sent from the local frontend to the local Express backend and then to the local Ollama runtime.

There is no external AI inference service involved in this process.

### Offline AI Processing

Once the required software and model are downloaded, core memory generation can work without an internet connection.

The current frontend loads Google Fonts externally, so those fonts should be bundled locally or replaced with system fonts for a completely offline presentation.

### No Cloud AI API Charges

There are no per-request cloud inference charges.

The application uses the user's own computing resources to run the model.

### Open Innovation

Ollama provides a flexible runtime for experimenting with local models.

Developers can modify prompts, explore different models, and customize the application without depending on a proprietary AI API.

### Data Ownership

Saved memories remain in local JSON files.

Users are not required to create a cloud account or subscribe to an external AI service.

---

## 👻 Hacktoberfest 2026 — Ghost in the Machine

Memory Keeper AI was built for the final Hacktoberfest 2026 Open-Source AI Challenge.

**Theme:** Ghost in the Machine

The project interprets the theme through memory, storytelling, and the relationship between technology and the past.

Rather than simulating conversations with deceased people, Memory Keeper focuses on preserving the authentic memories people share about them.

The AI becomes a writing companion that helps give existing memories a lasting form.

This approach also reflects the spirit of **Día de los Muertos**, a tradition of remembrance and celebrating the lives of loved ones.

---

## 🔒 Privacy and Security

Memory Keeper is currently a local, single-user prototype.

- The Express server runs on `127.0.0.1`.
- Personal memory records are stored locally.
- JSON memory files should be excluded from Git commits.
- No authentication system is implemented.
- The application should not be exposed directly to the public internet.
- Users should avoid entering sensitive information on shared computers.

**Note:** AI-generated narratives should be reviewed before being preserved. Even with fact-preserving instructions, language models may occasionally introduce inaccurate details.

---

## 📸 Screenshots

Add screenshots from your working application here.

### Dashboard

_Screenshot coming soon._

### Create a Memory

_Screenshot coming soon._

### AI-Generated Story

_Screenshot coming soon._

### Memory Collection

_Screenshot coming soon._

---

## 🎥 Demo

A demonstration video of the application will be linked here.

The demo will show how to create a memory, generate a story using local Gemma inference, and preserve it in the memory collection.

---

## 🔮 Future Improvements

Potential future enhancements include:

- Digital time capsules for special dates
- Memory timelines
- Photo attachments
- Export memories as PDF documents
- Private memory collections for family members
- Multilingual storytelling
- Audio memory recording and local transcription
- Encrypted local memory storage

These are future ideas and are not part of the current implementation.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit your changes.
5. Open a pull request.

Please avoid including real personal memories or private information in example data and test files.

---

## 📜 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

Gemma model weights are governed by their own applicable license and terms.

---

## ❤️ Final Thoughts

Technology is often about creating something new.

But sometimes its greatest purpose is helping us remember what came before.

**Memory Keeper AI is a small experiment in using open-weight AI to preserve meaningful human experiences.**

Because stories matter.

Because memories matter.

And because some moments deserve to live forever.

---

**Built with ❤️ using React, Node.js, Express, Ollama, and Gemma.**

**Hacktoberfest 2026 — Ghost in the Machine**
