# 🎙️ AI Interview Preparation Platform

An intelligent web-based interview preparation platform that helps students practice **resume-based interviews** and **subject-based technical interviews** using AI, voice interaction, automated answer evaluation, performance tracking, and personalized feedback.

The platform analyzes a student's resume, generates relevant interview questions using a locally running AI model, accepts spoken answers, evaluates each answer, and generates detailed scores, mistakes, feedback, and improvement suggestions.

---

## 🚀 Key Features

### 📄 Resume-Based Interview

- Upload resume in PDF or DOCX format
- Automatically extract resume text
- Generate interview questions based on resume content
- Supports technical and non-technical questions
- User can select the number of questions
- Supports **3 to 30 questions**
- AI-generated interview questions
- Voice-based question playback
- Student can answer using voice

### 📚 Subject-Based Interview Practice

Students can practice interviews for different Computer Engineering subjects.

Available subjects include:

- Data Structures & Algorithms (DSA)
- Object-Oriented Programming (OOP)
- Database Management Systems (DBMS)
- Operating Systems (OS)
- Computer Networks (CN)
- Computer Organization & Architecture (COA)
- Software Engineering
- Web Development
- Theory of Computation (TOC)
- Compiler Design
- Artificial Intelligence & Machine Learning
- Cyber Security
- Cloud Computing
- Distributed Systems
- Big Data & NoSQL

Subject practice supports:

- Subject selection
- Difficulty selection
- Optional topic selection
- **1 to 30 questions**
- AI-generated technical questions

---

## 🎤 Voice-Based Interview

The platform provides an interactive interview experience using voice features.

- Questions can be spoken aloud
- Student answers can be captured through microphone
- Speech is converted into text
- Answer text is submitted for AI evaluation
- Interview continues while answer evaluation can be processed separately

---

## 🤖 AI Question Generation

The project uses **Ollama** for local AI processing.

Current AI model:

```text
llama3.2:1b
```

AI is used for:

- Resume-based question generation
- Subject-based question generation
- Technical answer evaluation
- Relevance checking
- Completeness checking
- Communication clarity checking
- Grammar and terminology feedback
- Improvement suggestions

---

## 📊 AI Answer Evaluation

Each submitted answer is evaluated using multiple criteria.

### Evaluation Parameters

- Relevance Score
- Technical Score
- Completeness Score
- Clarity Score
- Overall Score

The system also provides:

- Feedback
- Mistakes
- Suggestions
- Strengths
- Weaknesses
- Overall improvement suggestions

Each parameter is evaluated on a scale of **0 to 10**.

The final interview score is calculated using the evaluation results of all submitted answers.

---

## ⚡ Background Answer Evaluation

The platform supports individual answer evaluation.

When a student submits an answer:

1. The answer is stored in the database.
2. Evaluation can begin for that answer.
3. The student can continue with the next interview question.
4. Evaluation results are stored separately.
5. After all questions are completed, individual scores are combined.
6. The final interview performance is generated.

This avoids waiting for the complete interview before starting answer evaluation.

---

## 📈 Performance Tracking

The Performance section allows logged-in users to view their own interview performance.

It can display information such as:

- Previous interviews
- Interview type
- Subject
- Number of questions
- Overall score
- Individual evaluation scores
- Strengths
- Weaknesses
- Suggestions
- Interview history

Performance information is associated with the logged-in user.

---

## 🔐 Authentication System

The platform provides:

- User Registration
- User Login
- Session-based Authentication
- Logout
- Password Hashing
- Forgot Password
- Password Reset through Email

---

## 📧 Forgot Password

Users can request a password-reset link through their registered email address.

The system uses **Nodemailer** with SMTP email configuration.

For Gmail, an **App Password** should be used instead of the normal Gmail account password.

Sensitive email credentials must be stored in environment variables and must never be committed to GitHub.

---

## 🗂️ Resume Management

Supported resume formats:

```text
PDF
DOCX
```

Maximum upload size:

```text
5 MB
```

Resume text is extracted using:

- `pdf-parse`
- `mammoth`

Extracted resume information is stored in MySQL and used during interview question generation.

---

## 🛠️ Technology Stack

### Frontend

- HTML
- CSS
- JavaScript
- EJS
- Web Speech APIs / browser voice features

### Backend

- Node.js
- Express.js
- Express Session
- Multer
- Axios

### Database

- MySQL
- mysql2

### Authentication & Email

- bcrypt
- express-session
- Nodemailer

### Resume Processing

- pdf-parse
- Mammoth

### Artificial Intelligence

- Ollama
- Llama 3.2 1B

---

## 📁 Project Structure

```text
AI-Interview-Platform/
│
├── backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── uploads/
│   │   └── audio/
│   │
│   ├── views/
│   │
│   ├── .env
│   ├── app.js
│   ├── package.json
│   └── package-lock.json
│
├── uploads/
│   └── Resume files
│
├── .gitignore
└── README.md
```

> `.env`, `node_modules`, uploaded resumes, and temporary audio files should not be committed to GitHub.

---

# 💻 Requirements

Before running the project, install:

- Node.js
- npm
- MySQL / XAMPP
- Ollama
- Git
- Modern web browser such as Chrome

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd AI-Interview-Platform
```

---

## 2. Open Backend Directory

```bash
cd backend
```

---

## 3. Install Node Dependencies

```bash
npm install
```

Dependencies will automatically be installed using `package.json`.

---

# 🗄️ Database Setup

Start MySQL using XAMPP or another MySQL server.

Create the database:

```sql
CREATE DATABASE ai_interview;
```

The project uses MySQL tables for application data such as:

- Users
- Resumes
- Interviews
- Interview Questions
- Interview Answers
- Evaluation information
- Password reset information

Import the project's database schema before running the complete application.

---

# 🔧 Environment Variables

Create:

```text
backend/.env
```

Example configuration:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ai_interview

SESSION_SECRET=your_secure_session_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Additional environment variables may be required depending on the deployment configuration.

> Never upload your real `.env` file to GitHub.

---

# 🤖 Ollama Setup

Install Ollama on your system.

Pull the required model:

```bash
ollama pull llama3.2:1b
```

Check installed models:

```bash
ollama list
```

You should see:

```text
llama3.2:1b
```

If the Ollama service is not already running, start it with:

```bash
ollama serve
```

By default, Ollama is commonly available locally at:

```text
http://127.0.0.1:11434
```

---

# ▶️ Run the Application

Start MySQL first.

Make sure Ollama is running.

Then open the backend directory:

```bash
cd backend
```

For development:

```bash
npm run dev
```

Or run the production start command:

```bash
npm start
```

The application will normally be available at:

```text
http://localhost:3000
```

---

# 🔄 Application Workflow

```text
Welcome Page
      ↓
Login / Register
      ↓
Dashboard
      ↓
Choose Interview Mode
      ↓
 ┌──────────────────────┐
 │                      │
 ↓                      ↓
Resume Interview     Subject Interview
 ↓                      ↓
Upload Resume        Select Subject
 ↓                   Select Difficulty
Resume Analysis      Select Questions
 ↓                      ↓
Generate Questions   Generate Questions
 │                      │
 └──────────┬───────────┘
            ↓
       Start Interview
            ↓
       Voice Question
            ↓
       Student Answer
            ↓
       Save Answer
            ↓
       AI Evaluation
            ↓
       Final Score
            ↓
       Feedback
            ↓
       Performance
```

---

# 🔒 Security

The application uses several security practices:

- Password hashing using bcrypt
- Session-based authentication
- Protected application routes
- User-specific interview information
- Environment variables for sensitive credentials
- File-type validation for resume uploads
- Resume file-size restrictions
- Password-reset verification

Never commit:

```text
.env
Email App Password
Database Password
Session Secret
User Resume Files
node_modules
```

---

# 🌐 Deployment Notes

The production environment requires access to:

- Node.js application server
- MySQL database
- Persistent resume storage
- Email/SMTP service
- AI model service

Local Ollama addresses such as:

```text
127.0.0.1:11434
```

refer to the local machine and therefore require appropriate AI hosting/configuration when the application is deployed to a remote server.

Uploaded resume files should use persistent storage in production so they are not lost during application redeployment.

Production database and email credentials should be configured using the hosting platform's environment-variable system.

---

# 🔮 Future Enhancements

Possible future improvements include:

- Additional AI models
- Advanced speech analysis
- Communication-skill scoring
- Interview timer
- Coding interview module
- Company-specific interview preparation
- Adaptive question difficulty
- Detailed analytics dashboard
- Cloud-based file storage
- AI-generated personalized preparation plans
- Mock interview reports
- Downloadable interview scorecards

---

# 🎯 Project Objective

The objective of the AI Interview Preparation Platform is to provide students with an interactive environment where they can practice technical and resume-based interviews, receive AI-generated feedback, identify mistakes, improve communication and technical knowledge, and track their interview performance over time.

---

## 📌 Important

This project is intended for educational and interview-preparation purposes.

AI-generated evaluation should be treated as guidance for practice and improvement rather than as an official hiring assessment.