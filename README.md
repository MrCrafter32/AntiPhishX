<div align="center">

<br/>


# AntiphishX: NLP-Powered Phishing Detection

**A full-stack cybersecurity tool that leverages Natural Language Processing (NLP) to detect email phishing threats with high accuracy. This project showcases a sophisticated backend model served via a Flask API and integrated with a modern, reactive Next.js frontend.**

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## ✨ Core Features

AntiphishX is more than just a script; it's an end-to-end system demonstrating practical application of machine learning in cybersecurity.

-   **🧠 Intelligent NLP Backend:** Utilizes a fine-tuned NLP model (supporting BERT) to analyze email content and accurately classify it as "Phishing" or "Legitimate." The backend handles complex preprocessing, including text normalization, tokenization, and vectorization (TF-IDF).
-   **🖥️ Interactive Frontend:** A sleek and responsive user interface built with Next.js allows users to paste email content for instant analysis. Results are displayed with clear visual indicators and confidence scores.
-   **📧 Dynamic Email Analysis:** Integrates directly with IMAP servers to fetch and analyze emails from a user's inbox in real-time, providing a practical, real-world use case.
-   **🚀 Scalable API:** The Flask backend exposes a robust API, making the NLP model's prediction capabilities available to any client application.
-   **📦 Containerized Deployment:** Fully configured with Docker and Docker Compose, allowing for one-command setup of the entire application stack (frontend, backend, and networking).

---

## 🛠️ Tech Stack & Architecture

This project combines a powerful Python backend with a modern JavaScript frontend.

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js, React, Tailwind CSS |
| **Backend** | Python, Flask, Scikit-learn, NLTK |
| **ML/NLP** | BERT, TF-IDF, Hugging Face Transformers |
| **DevOps** | Docker, Docker Compose, Git |

---

## 🚀 Getting Started & Self-Hosting

You can run your own instance of AntiphishX locally. Follow the Docker method for the quickest setup.

### 1. Prerequisites

-   Git
-   Node.js (v18 or later)
-   Python (3.8 or later) & Pip
-   Docker & Docker Compose (Recommended)

### 2. Clone the Repository

```bash
git clone [https://github.com/MrCrafter32/antiphishx.git](https://github.com/MrCrafter32/antiphishx.git)
cd antiphishx
```

### 3. Environment Configuration

Before running the application, you need to set up your environment variables for the frontend.

**Step 1: Create the `.env` file**

Navigate to the frontend directory (`AntiPhishNextJS`) and create a new file named `.env`.

**Step 2: Add Your Credentials**

Add the following variables to your `.env` file. These are necessary for database connections and user authentication.

```env
# Database Connection (for Prisma)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 4. Deployment Method 1: Docker (Recommended)

This is the simplest way to get the entire application running.

**Step 1: Build and Run the Containers**

From the project's root directory, execute:

```bash
docker-compose up --build
```

**Step 2: Access the Application**

-   **Frontend:** `http://localhost:3000`
-   **Backend API:** `http://localhost:5000`

### 5. Deployment Method 2: Manual Setup

**Step 1: Run the Backend Server**

```bash
cd NLP
pip install -r requirements.txt
python app.py
```
*The backend will be available at `http://localhost:5000`.*

**Step 2: Run the Frontend Application**

In a separate terminal:
```bash
cd AntiPhishNextJS
npm install
npm run dev
```
*The frontend will be available at `http://localhost:3000`.*

---

## 📖 How to Use

1.  Navigate to the AntiphishX web interface.
2.  Create an account and log in.
3.  Connect your email by providing your IMAP server details.
4.  Select any email from your dynamically fetched inbox.
5.  The system will automatically analyze the content and display a prediction: **Phishing** or **Legitimate**, along with a confidence score.

---

## 💡 Future Enhancements

This project has a clear roadmap for future development:

-   **Direct API Integration:** Add support for Outlook APIs for easier and more secure connections.
-   **Explainable AI (XAI):** Implement features to highlight which specific words or phrases in an email contributed most to the phishing classification.
-   **Browser Extension:** Develop a plugin for Chrome/Firefox to analyze emails in real-time directly within the user's webmail client.

---

<div align="center">

### 👋 Let's Connect!

**Jagadeesh Chandra Duggirala**
<br/>
Cybersecurity and Full-Stack Developer

*I'm actively seeking new opportunities and would love to discuss how my skills in AI and web development can bring value to your team. Feel free to reach out!*

[**LinkedIn**](https://www.linkedin.com/in/jagadeesh-chandra-8aa715251) | [**GitHub**](https://github.com/MrCrafter32)

</div>
