# 🎙️ AI Interview Preparation Platform

An AI and NLP-powered web application designed to help students practice technical interviews through **resume-based and subject-based mock interviews** with NLP-based resume analysis, voice interaction, AI-generated questions, answer evaluation, feedback, and performance tracking.

---

## 🚀 Features

### 📄 Resume-Based Interview

- Upload PDF or DOCX resume
- Automatic resume text extraction
- NLP-based resume analysis
- Text normalization and tokenization
- Stop-word removal
- Keyword frequency analysis
- Technical skill extraction
- AI-generated personalized questions based on resume content
- Technical and non-technical interview questions
- Voice-based question and answer interaction
- AI evaluation of candidate answers
- Score, feedback, mistakes, and improvement suggestions

### 🧠 NLP-Based Resume Analysis

The platform applies Natural Language Processing techniques to analyze the extracted resume text.

The NLP pipeline includes:

- Text cleaning and normalization
- Tokenization
- Stop-word removal
- Keyword frequency analysis
- Technical skill extraction
- Resume information processing

Example skills that can be identified include:

- Java
- Python
- JavaScript
- HTML
- CSS
- React
- Spring
- MySQL
- MongoDB
- SQL
- TensorFlow
- Keras
- Git
- GitHub

The extracted NLP information is used along with the resume content to provide better context for personalized interview-question generation.

---

### 📚 Subject-Based Interview

Users can practice interviews for Computer Engineering subjects such as:

- DBMS
- Computer Networks
- Operating Systems
- Object-Oriented Programming
- Data Structures and Algorithms
- Other technical subjects

Users can select the subject and number of interview questions.

The selected information is sent to the AI question-generation module, which dynamically generates interview questions.

---

### 🎤 Voice Interview

- AI-generated questions are spoken using Text-to-Speech
- Browser-based Web Speech API is used for question playback
- Candidate answers using a microphone
- Candidate audio is processed for transcription
- Speech-to-text transcription is performed using Groq Whisper
- Transcribed answers are sent for AI evaluation
- Provides an interactive interview-like experience

---

### 🤖 AI Question Generation

The system uses the **Groq API** to access the **GPT-OSS model**.

For resume-based interviews:

```text
Resume
   ↓
Text Extraction
   ↓
NLP Processing
   ↓
Skills + Keywords + Resume Context
   ↓
Groq API
   ↓
GPT-OSS
   ↓
Personalized Interview Questions
```

For subject-based interviews:

```text
Selected Subject
      ↓
Question Count
      ↓
Groq API
      ↓
GPT-OSS
      ↓
Subject-Based Questions
```

---

### 🤖 AI Answer Evaluation

After the candidate's spoken response is converted into text, the system evaluates the answer using AI.

The evaluation provides:

- Answer score
- Relevance analysis
- Technical correctness
- Completeness
- Clarity
- Feedback
- Identified mistakes
- Areas for improvement
- Improvement suggestions
- Overall interview performance

---

### 📊 Performance Tracking

Users can view their previous interview performance and scores.

The system stores interview information in the database and allows users to monitor their progress over multiple interview sessions.

Performance information includes:

- Previous interviews
- Question-wise evaluation
- Interview scores
- Feedback
- Mistakes
- Suggestions
- Overall performance

---

### 🔐 Authentication

- User Registration
- Login
- Logout
- Session-based authentication
- Secure password hashing
- Forgot Password
- Password reset through email
- User-specific resume and interview data

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

### Natural Language Processing

- Custom NLP processing service
- Text normalization
- Tokenization
- Stop-word removal
- Keyword frequency analysis
- Rule-based / dictionary-based technical skill extraction

### Database

- MySQL for local development
- TiDB Cloud for production database
- MySQL2 Node.js driver
- MySQL connection pooling

### Artificial Intelligence

- Groq API
- GPT-OSS model for interview question generation
- GPT-OSS model for answer evaluation
- Groq Whisper for speech-to-text transcription

### Resume Processing

- pdf-parse for PDF text extraction
- Mammoth for DOCX text extraction

### Voice Processing

- Web Speech API
- SpeechSynthesisUtterance for Text-to-Speech
- Browser microphone/audio recording
- Groq Whisper for Speech-to-Text

### Authentication and Security

- bcrypt
- express-session
- Environment variables
- Password reset tokens

### Email Service

- Brevo Email API

### Deployment

- Render
- TiDB Cloud
- GitHub

---

## 🧠 NLP Processing

The project contains a dedicated NLP processing module for resume analysis.

### NLP Pipeline

```text
Uploaded Resume
      ↓
PDF / DOCX Text Extraction
      ↓
Text Cleaning
      ↓
Text Normalization
      ↓
Tokenization
      ↓
Stop-word Removal
      ↓
Keyword Frequency Analysis
      ↓
Technical Skill Extraction
      ↓
Processed Resume Information
      ↓
AI Question Generation
```

### NLP Techniques Used

#### 1. Text Normalization

The extracted resume text is converted into a consistent format to simplify further processing.

#### 2. Tokenization

Resume text is divided into individual words or tokens.

Example:

```text
"I have experience in Java and Python"

↓

["i", "have", "experience", "in", "java", "and", "python"]
```

#### 3. Stop-word Removal

Common words that provide little useful information are removed.

Example:

```text
["i", "have", "experience", "in", "java", "and", "python"]

↓

["experience", "java", "python"]
```

#### 4. Keyword Frequency Analysis

The system counts meaningful words and identifies frequently occurring keywords from the resume.

Example:

```text
java       → 4
python     → 3
database   → 3
engineering → 5
```

#### 5. Technical Skill Extraction

A rule-based / dictionary-based approach is used to identify known technical skills from the resume.

Example:

```text
Java
Python
MySQL
React
Spring
TensorFlow
Git
GitHub
```

---

## 🧠 Algorithms / Techniques Used

The project does not depend on traditional machine-learning algorithms such as Random Forest, Decision Tree, SVM, or Naive Bayes.

Instead, it uses:

### Frequency-Based Keyword Extraction

The occurrence of meaningful words is counted and ranked to identify important resume keywords.

### Rule-Based Skill Extraction

Technical skills are detected by matching resume content against a predefined technical-skill vocabulary.

### Large Language Model

GPT-OSS is accessed through the Groq API for:

- Dynamic interview-question generation
- Context-based question generation
- Candidate answer evaluation
- Feedback generation
- Mistake identification
- Improvement suggestions

---

## 🧩 NLP vs Generative AI

The system uses both traditional NLP techniques and Generative AI.

```text
Natural Language Processing
        ↓
Processes Resume Text
        ↓
Tokens + Keywords + Skills
        ↓
Generative AI
        ↓
Personalized Questions
```

NLP is responsible for extracting structured and meaningful information from the resume, while the LLM performs higher-level language generation and answer evaluation.

---

## 🔄 Complete System Workflow

```text
User Registration / Login
          ↓
       Dashboard
          ↓
Interview Mode Selection
       /       \
      /         \
Resume-Based   Subject-Based
Interview      Interview
     ↓             ↓
Upload Resume   Select Subject
     ↓             ↓
Text Extraction   Question Count
     ↓             ↓
NLP Processing    ↓
     ↓             ↓
Skills + Keywords ↓
      \           /
       \         /
        Groq API
           ↓
        GPT-OSS
           ↓
AI Generates Interview Questions
           ↓
Question Displayed to Candidate
           ↓
Web Speech API
           ↓
Question Spoken to Candidate
           ↓
Candidate Answers Using Microphone
           ↓
Audio Recording
           ↓
Groq Whisper
           ↓
Speech Converted to Text
           ↓
AI Answer Evaluation
           ↓
Score + Feedback
           ↓
Mistakes + Suggestions
           ↓
Results Stored in Database
           ↓
Performance Tracking
           ↓
Final Interview Performance
```

---

## 📁 Project Structure

```text
AI-Interview-Platform/
│
├── backend/
│   │
│   ├── config/
│   │   └── Database and application configuration
│   │
│   ├── controllers/
│   │   ├── Authentication controller
│   │   ├── Resume controller
│   │   ├── Interview controller
│   │   └── Performance controller
│   │
│   ├── middleware/
│   │   ├── Authentication middleware
│   │   └── File / audio upload middleware
│   │
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │
│   ├── routes/
│   │   ├── Authentication routes
│   │   ├── Resume routes
│   │   ├── Interview routes
│   │   └── Performance routes
│   │
│   ├── services/
│   │   ├── NLP processing
│   │   ├── Groq AI service
│   │   ├── Question generation
│   │   ├── Subject question generation
│   │   ├── Answer evaluation
│   │   ├── Whisper transcription
│   │   └── Evaluation processing
│   │
│   ├── views/
│   │   └── EJS templates
│   │
│   ├── uploads/
│   │
│   ├── app.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Architecture

The application stores user, resume, interview, question, answer, and performance information in the database.

Main database entities include:

```text
Users
  │
  ├──── Resumes
  │
  └──── Interviews
           │
           ├──── Interview Questions
           │
           └──── Interview Answers
                    │
                    ├─ Scores
                    ├─ Feedback
                    ├─ Mistakes
                    └─ Suggestions
```

### Local Development

MySQL is used during local development.

```text
Node.js Application
        ↓
     MySQL2
        ↓
Local MySQL Database
```

### Production

TiDB Cloud is used as the production database.

```text
Render
   ↓
Node.js + Express
   ↓
MySQL2 Connection Pool
   ↓
TiDB Cloud
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory for local development.

```env
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
```

Never commit the `.env` file, passwords, database credentials, or API keys to GitHub.

---

## 💻 Installation

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Backend Directory

```bash
cd AI-Interview-Platform/backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create the `.env` file inside the backend directory and add the required database, Groq, session, and Brevo credentials.

### 5. Start the Application

```bash
npm start
```

For development:

```bash
npm run dev
```

The application will normally run locally at:

```text
http://localhost:3000
```

---

## 🌐 Production Architecture

```text
                    USER BROWSER
                         │
                         ▼
                       RENDER
                 Node.js + Express
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
       GROQ AI         BREVO       TiDB CLOUD
           │             │             │
     ┌─────┼─────┐       │       ┌─────┼─────┐
     │     │     │       │       │     │     │
 Questions │ Evaluation  │     Users Resumes Interviews
           │             │                   │
        Whisper      Password               Questions
           │         Reset Email             │
     Transcription                         Answers
                                             │
                                         Performance
```

---

## 🔒 Security

The application implements multiple security practices:

- Passwords are hashed before database storage
- Session-based authentication is used
- Protected routes require authentication
- Environment variables are used for credentials and API keys
- Password-reset tokens have limited validity
- Database credentials are not hard-coded
- API secrets are excluded from GitHub
- `.env` is excluded using `.gitignore`
- User-specific resume and interview data is associated with authenticated users
- Production database connections use cloud database security/TLS

---

## 🎯 Project Objective

The objective of this project is to provide students with an accessible and intelligent mock-interview environment where they can practice technical interviews, improve communication and technical knowledge, receive immediate AI-generated feedback, and track their performance.

The project particularly demonstrates the practical application of **Natural Language Processing** by processing unstructured resume text through normalization, tokenization, stop-word removal, keyword extraction, and technical skill extraction.

By combining traditional NLP techniques with Generative AI and speech processing, the system provides a more personalized and interactive interview-preparation experience.

---

## ⭐ Key Highlights

- NLP-based resume analysis
- Frequency-based keyword extraction
- Rule-based technical skill extraction
- Personalized resume-based interviews
- Subject-based technical interviews
- Dynamic AI question generation
- Voice-based interview experience
- Speech-to-text transcription
- AI answer evaluation
- Score and feedback generation
- Mistake identification
- Improvement suggestions
- Interview history
- Performance tracking
- Cloud deployment
- Cloud database integration

---

## 🔮 Future Enhancements

- Multiple AI interviewer avatars
- Job-role-specific interviews
- Company-specific interview preparation
- Advanced NLP-based resume scoring
- Semantic resume analysis
- Job description and resume matching
- Advanced interview analytics
- Improved voice interaction
- Communication-skill analysis
- Interview report generation
- Downloadable performance reports
- Cloud resume storage
- Admin dashboard
- Multi-language interview support

---

## 👩‍💻 Developer

**Nutan Ajit Salunkhe**

Computer Engineering Student

---

## 📌 Project Summary

The AI Interview Preparation Platform combines:

**Natural Language Processing + Generative AI + Speech Processing + Web Development + Cloud Database + Cloud Deployment**

to provide an end-to-end intelligent interview preparation system for students.