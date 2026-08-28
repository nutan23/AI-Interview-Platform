# 🎙️ AI Interview Preparation Platform

An AI-powered web application designed to help students practice technical interviews through resume-based and subject-based mock interviews with voice interaction, AI evaluation, and performance tracking.

## 🚀 Features

### 📄 Resume-Based Interview
- Upload PDF or DOCX resume
- Automatic resume text extraction and parsing
- AI-generated questions based on resume content
- Technical and non-technical interview questions
- Voice-based question and answer interaction
- AI evaluation of candidate answers
- Score and improvement suggestions

### 📚 Subject-Based Interview
Practice interviews for Computer Engineering subjects such as:

- DBMS
- Computer Networks
- Operating Systems
- OOP
- DSA
- Other technical subjects

Users can select the subject and number of interview questions.

### 🎤 Voice Interview
- AI questions are spoken using Text-to-Speech
- Candidate answers using microphone
- Speech-to-text transcription using Groq Whisper
- Interview-like interactive experience

### 🤖 AI Evaluation
The system evaluates answers and provides:

- Score
- Feedback
- Mistakes
- Areas for improvement
- Interview performance analysis

### 📊 Performance Tracking
Users can view their previous interview performance and scores.

### 🔐 Authentication
- User Registration
- Login / Logout
- Session-based authentication
- Forgot Password
- Secure password reset through email

---

## 🛠️ Technology Stack

### Frontend
- HTML
- CSS
- JavaScript
- EJS
- Web Speech API

### Backend
- Node.js
- Express.js

### Database
- MySQL
- Aiven Cloud MySQL

### Artificial Intelligence
- Groq API
- GPT-OSS model for interview question generation and answer evaluation
- Groq Whisper for speech-to-text transcription

### Resume Processing
- pdf-parse
- Mammoth

### Email Service
- Brevo Email API

### Deployment
- Render
- Aiven Cloud
- GitHub

---

## 🧠 System Workflow

User Registration / Login  
↓  
Upload Resume OR Select Subject  
↓  
AI Generates Interview Questions  
↓  
Question is Spoken to Candidate  
↓  
Candidate Answers Using Microphone  
↓  
Speech Converted to Text  
↓  
AI Evaluates Answer  
↓  
Score + Feedback + Suggestions  
↓  
Final Interview Performance

---

## 📁 Project Structure

```text
AI-Interview-Platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── public/
│   ├── routes/
│   ├── services/
│   ├── views/
│   ├── app.js
│   ├── package.json
│   └── package-lock.json
│
├── uploads/
│
├── .gitignore
└── README.md

⚙️ Environment Variables

Create a .env file for local development.

PORT=3000

SESSION_SECRET=your_session_secret

DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

GROQ_API_KEY=your_groq_api_key

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email

APP_BASE_URL=http://localhost:3000

Never commit your .env file or API keys to GitHub.

💻 Installation

Clone the repository:

git clone YOUR_GITHUB_REPOSITORY_URL

Open the backend directory:

cd AI-Interview-Platform/backend

Install dependencies:

npm install

Create and configure your .env file.

Start the application:

npm start

For development, if configured:

npm run dev


🌐 Production Architecture
User Browser
     │
     ▼
Render
Node.js + Express
     │
     ├────► Groq AI
     │       ├─ Question Generation
     │       ├─ Answer Evaluation
     │       └─ Voice Transcription
     │
     ├────► Brevo
     │       └─ Password Reset Email
     │
     └────► Aiven MySQL
             ├─ Users
             ├─ Resume Data
             ├─ Interviews
             └─ Performance


🔒 Security
Passwords are hashed before storage
Session-based authentication
Environment variables are used for credentials and API keys
Password reset tokens have limited validity
API secrets are excluded from GitHub

🎯 Project Objective

The objective of this project is to provide students with an accessible AI-powered mock interview environment where they can practice interviews, improve communication and technical knowledge, receive immediate AI-generated feedback, and track their performance.

🔮 Future Enhancements
Multiple AI interviewer avatars
Advanced interview analytics
Job-role-specific interviews
Company-specific interview preparation
Cloud resume storage
Improved voice interaction
Interview reports
Admin dashboard


👩‍💻 Developer

Nutan Ajit Salunkhe
Computer Engineering Student