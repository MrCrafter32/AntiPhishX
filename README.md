
# AntiphishX – Email Phishing Detection Tool

AntiphishX is a comprehensive phishing detection system that uses **Natural Language Processing (NLP)** on the backend and a modern **Next.js** interface on the frontend to analyze and visualize email threats. Designed for both technical users and cybersecurity teams, AntiphishX helps identify potentially malicious emails with accuracy and clarity.

---

## Features

### NLP-Powered Backend

- Identifies emails as either phishing or legitimate using natural language processing models.
- Includes preprocessing steps like:
  - Text normalization
  - Tokenization
  - TF-IDF or word embedding generation
- Trained with realistic phishing datasets.
- Provides API endpoints for phishing prediction.

### Modern Next.js Frontend

- User-friendly interface for entering email content.
- Displays prediction results with confidence levels.
- Visual indicators and performance summaries.

### Model Capabilities

- Supports BERT Model
- Backend powered by Flask.
- Easily upgradeable for future enhancements.

---

## Tech Stack

| Layer        | Technology                             |
| ------------ | ---------------------------------------- |
| Frontend     | Next.js, React, Tailwind CSS            |
| Backend      | Python, Scikit-learn, NLTK, Flask       |
| ML/NLP       | TF-IDF, Scikit-learn                    |
| Dev Tools    | Docker (optional), Git, VSCode          |

---

## Setup Instructions

### Prerequisites

- Node.js v18 or newer
- Python 3.8 or newer
- pip, pipenv, or poetry
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/antiphishx.git
cd antiphishx
```

---

### 2. Run the Backend (Python)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend server will start at `http://localhost:5000` (or `8000` with FastAPI).

---

### 3. Run the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

You can now access the frontend at `http://localhost:3000`.

---

### Alternative: Use Docker Compose

To simplify setup, you can run the entire application stack using Docker Compose:

```bash
docker-compose up --build
```

This launches both the frontend and backend services together:

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:5000`

Ensure Docker is installed and running before using this option.

---

## How to Use

- First Create a account on the antiphishx page
- Enter your IMAP Email Details.
- Open a mail from the inbox dynamically fetch from your imap mail server
- Click the "Analyze" button.
- Review the model's prediction and confidence score.

---

## Datasets Used

- https://phishtank.org/
- https://www.cs.cmu.edu/~enron/
- Additional labeled examples from online sources

---

## Planned Enhancements

- Secure login and user management
- Integration with Gmail or Outlook APIs
- Support for explainable AI (XAI) features
- Browser plugin for real-time phishing detection

---

## Contributing

Interested in contributing? We'd love your help!

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes and commit (`git commit -m 'Add feature'`)
4. Push your branch (`git push origin feature/your-feature`)
5. Submit a pull request

---

## Author

**Jagadeesh Chandra Duggirala**  
Cybersecurity and Full-Stack Developer  
[LinkedIn](https://www.linkedin.com/in/jagadeesh-chandra-8aa715251) • [GitHub](https://github.com/yourusername)

---

## License

This project is open-sourced under the MIT License. See the `LICENSE` file for more details.

---

## Acknowledgments

- Scikit-learn and NLTK for machine learning support
- Open phishing dataset providers
- The Next.js and React development communities
