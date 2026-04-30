# Smart Receipt & Wallet Manager

A modern, enterprise-grade financial web application built with Flask, React TypeScript, and Material-UI, fully containerized with Docker for easy development and deployment. This system features a robust, fault-tolerant AI pipeline for receipt processing and secure shared wallets.

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI 5, Axios, React Router DOM, Jest & React Testing Library
- **Backend**: Python 3.10+, Flask, SQLAlchemy (PostgreSQL), PyJWT, Pytest
- **AI & Cloud Services**: OCR.space, Groq API (Llama 3), Azure Computer Vision, Azure Form Recognizer, Azure Blob Storage
- **Containerization**: Docker & Docker Compose
- **CI/CD & Deployment**: GitHub Actions, Heroku (Container Stack)

## 🏗️ Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Flask Backend  │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│    Database     │
│   TypeScript    │    │     Python      │    │                 │
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
  │  OCR.space /  │     │   Groq API    │     │  Azure Blob   │
  │   Azure APIs  │     │   (Llama 3)   │     │   Storage     │
  └───────────────┘     └───────────────┘     └───────────────┘
```

## 🌟 Key Features

- **Multi-Tier Fallback AI Pipeline**: Intelligent receipt data extraction that balances cost and accuracy by cascading through OCR.space (Engines 1 & 3), Azure Computer Vision, and finally Azure Form Recognizer, parsed seamlessly by Groq (Llama 3).
- **Secure Authentication**: Stateless JWT-based authentication featuring Axios interceptors for automatic, silent background token rotation (refresh tokens) and centralized error handling.
- **Shared Wallets & Permissions**: Create personal or group wallets with an invitation system, strictly managed by relational database constraints and backend middleware.
- **High Test Coverage**: Comprehensive automated testing suite using `pytest` (with fixtures and mock API calls) for the backend and `Jest` + `RTL` (mocking Axios and AuthContext) for the frontend.
- **Automated CI/CD**: Automated deployment pipeline using GitHub Actions triggered on push/merge to the `main` branch.

## 🛠️ Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)

### Environment Variables
Create a `.env` file in the root directory and configure the following keys:

| Variable | Description |
|----------|-------------|
| `FLASK_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret key for JWT signing |
| `GROQ_API_KEY` | API key for Groq LLM parsing |
| `OCR_API_KEY` | API key for OCR.space |
| `AZURE_VISION_KEY` | Credentials for Azure Computer Vision |
| `AZURE_FORM_RECOGNIZER_KEY` | Credentials for Azure Receipt API |
| `AZURE_STORAGE_CONNECTION_STRING`| Connection string for Blob Storage (avatars) |

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/becsmate/smart-receipt-manager.git
   cd smart-receipt-manager
   ```

2. **Start development environment with Docker** (Spins up React, Flask, and PostgreSQL):
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - pgAdmin/Database (if configured): http://localhost:5050

## 🐳 Docker Commands
```bash
# Build and start all services
docker-compose up --build

# Run backend tests inside the container
docker-compose exec backend pytest tests/ --cov

# Run frontend tests inside the container
docker-compose exec frontend npm test
```

## 🌐 Deployment (Heroku & GitHub Actions)

The application is deployed to Heroku using a containerized stack, fully automated via GitHub Actions.

1. **GitHub Actions Workflow**: 
   Any push to the `main` branch triggers the CI/CD pipeline, which runs the test suites and deploys the optimized build to Heroku.

## 📁 Project Structure

```text
├── client
│   ├── Dockerfile.dev
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── src
│   │   ├── App.test.tsx
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── dashboard
│   │   │   │   ├── AddTransactionDialog.tsx
│   │   │   │   ├── CategoryDonutChart.tsx
│   │   │   │   ├── IncomeExpensesChart.tsx
│   │   │   │   ├── QuickUploadCard.tsx
│   │   │   │   ├── RecentTransactionsTable.tsx
│   │   │   │   ├── SummaryCards.tsx
│   │   │   │   ├── WalletInvitationPanel.tsx
│   │   │   │   ├── WalletMembersPanel.tsx
│   │   │   │   └── WalletsPanel.tsx
│   │   │   ├── landing
│   │   │   │   ├── Privacy.tsx
│   │   │   │   └── Terms.tsx
│   │   │   └── navigation
│   │   │       ├── Avatar.tsx
│   │   │       ├── Navigation.test.tsx
│   │   │       └── Navigation.tsx
│   │   ├── constants
│   │   │   └── transactionCategories.ts
│   │   ├── contexts
│   │   │   └── AuthContext.tsx
│   │   ├── index.css
│   │   ├── index.tsx
│   │   ├── pages
│   │   │   ├── Dashboard_.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.test.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── OCRPage.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── StatisticsPage.tsx
│   │   │   └── WalletManagePage.tsx
│   │   ├── react-app-env.d.ts
│   │   ├── services
│   │   │   ├── apiClient.ts
│   │   │   ├── authService.test.ts
│   │   │   ├── authService.ts
│   │   │   ├── ocrService.ts
│   │   │   ├── statisticsService.ts
│   │   │   └── walletService.ts
│   │   └── utils
│   │       ├── avatar.ts
│   │       ├── index.test.ts
│   │       └── index.ts
│   └── tsconfig.json
├── docker-compose.yml
├── Dockerfile
├── README.md
├── server
│   ├── app.py
│   ├── azure_services
│   │   ├── __init__.py
│   │   └── storage.py
│   ├── config.py
│   ├── Dockerfile.dev
│   ├── extensions.py
│   ├── models.py
│   ├── ocr
│   │   ├── __init__.py
│   │   ├── azure_ocr.py
│   │   ├── azure_receipt_service.py
│   │   ├── groq_parser.py
│   │   ├── ocr_service.py
│   │   └── smart_receipt_service.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── ocr.py
│   │   ├── profile_picture.py
│   │   ├── spa.py
│   │   ├── statistics.py
│   │   ├── transactions.py
│   │   └── wallets.py
│   └── tests
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_ocr.py
│       ├── test_profile_picture.py
│       ├── test_spa.py
│       ├── test_statistics.py
│       ├── test_transactions.py
│       └── test_wallets.py
```

This project was developed as a Computer Science BSc thesis at ELTE IK.