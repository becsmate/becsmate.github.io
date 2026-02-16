# Finance Tracker - Szoftver Követelmények

## 📋 Rendszer Áttekintése

Webalapú pénzügyi nyilvántartó alkalmazás OCR technológiával. Flask backend (Python 3.11) + React TypeScript frontend, Docker containerizálás, Heroku deployment.

## 🎯 Funkcionális Követelmények

### 1. Felhasználói Hitelesítés
- **Regisztráció**: E-mail, jelszó, név - bcrypt titkosítás
- **Bejelentkezés**: E-mail/jelszó validáció, JWT token (1 óra TTL)
- **Profilkép**: Azure Blob Storage feltöltés, publikus URL

### 2. Pénztár (Wallet) Kezelés
- **Típusok**: Personal, Group
- **Megosztás**: Több felhasználó hozzáadása (Owner/Member szerepek)
- **Kezelés**: Létrehozás, módosítás, törlés

### 3. Tranzakciók
- **Manuális rögzítés**: Összeg, dátum, kategória, leírás, kereskedő név
- **Szerkesztés/Törlés**: Csak létrehozó felhasználó
- **Szűrés**: Kategória, dátumtartomány, összeg
- **Rendezés**: Oszlopok szerinti sorbarendezés

### 4. OCR Feldolgozás (Nyugták)
- **Feltöltés**: jpg/png/pdf, max 5MB
- **Szöveges kinyerés**: Azure Vision API
- **AI feldolgozás**: Groq API adatok strukturálásához
  - Kereskedő név, dátum, összeg, tétel lista
- **Felülvizsgálat**: Felhasználó szerkesztheti, majd jóváhagyja
- **Fallback**: Azure Form Recognizer

### 5. Statisztikák
- **Megjelenítés**: 
  - Teljes egyenleg
  - Havi költés
  - Kategória szerinti bontás
  - Trend chart (6 hónap)
  - Kördiagram kategóriák szerint
- **Listanézet**: Szűrt, rendezett tranzakciók

### 6. UI/UX
- **Dark/Light téma**: Material-UI, localStorage preferencia
- **Responsive**: Desktop, tablet, mobil
- **Bejelentkezés nélkül**: Kezdőoldal alkalmazás leírása + CTA

---

## 🗄️ Adatmodell (Röviden)

```
User
├── id, email (UNIQUE), name, password_hash
├── profile_image_url
└── created_at, updated_at

Wallet
├── id, name, type (personal|group)
├── owner_id (FK→User)
└── created_at, updated_at

Transaction
├── id, wallet_id (FK→Wallet)
├── amount, currency, category, date
├── description, merchant_name
├── original_image_url, ocr_raw_text
├── created_by (FK→User)
└── created_at, updated_at

OCRJob
├── id, user_id (FK→User)
├── image_path, status (pending|processing|completed|failed)
├── raw_text, extracted_data (JSON)
└── created_at, completed_at
```

---

## 🔗 API Végpontok (Fontosak)

```
POST   /api/auth/register             - Regisztráció
POST   /api/auth/login                - Bejelentkezés
POST   /api/profile-picture           - Profilkép feltöltés

GET    /api/wallets                   - Pénztárak listája
POST   /api/wallets                   - Új pénztár
GET    /api/wallets/:id/transactions  - Tranzakciók

POST   /api/transactions              - Új tranzakció
PUT    /api/transactions/:id          - Módosítás
DELETE /api/transactions/:id          - Törlés

POST   /api/ocr/process               - Nyugta feldolgozása
GET    /api/ocr/jobs/:id              - OCR státusz
POST   /api/ocr/confirm               - Eredmény jóváhagyása
```

---

## 🧪 Tesztelés

- **Unit**: Backend API végpontok
- **Integrálás**: Adatbázis, Azure API-k
- **E2E**: Teljes felhasználói workflows
- **OCR**: Különféle nyugta formátumok

---

## 🚀 Tech Stack

**Frontend**: React 18 + TypeScript + Material-UI 5  
**Backend**: Flask 3.0 + SQLAlchemy  
**Adatbázis**: PostgreSQL (prod) / SQLite (dev)  
**Container**: Docker + Docker Compose  
**Deployment**: Heroku  
**Cloud**: Azure Vision, Azure Blob Storage, Groq AI  

---

## 📦 Integrálások

- **Azure Computer Vision API**: OCR szöveges kinyerés
- **Azure Form Recognizer**: Nyugta feldolgozás
- **Azure Blob Storage**: Képek tárolása
- **Groq API**: Gyors AI feldolgozás
- **Heroku**: Hosting
- **PostgreSQL**: Éles adatbázis

---
