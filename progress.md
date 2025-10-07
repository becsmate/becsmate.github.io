1. Előkészítő fázis (1-2 hét)
   Projektstruktúra kialakítása
   text

financetracker/
├── frontend/ # React alkalmazás
├── backend/ # Node.js/Python API
├── ocr-service/ # OCR feldolgozó microservice
└── docs/ # Dokumentáció

Technológiai stack kiválasztása

    Frontend: React + TypeScript + Tailwind CSS

    Backend: Node.js (Express) vagy Python (FastAPI)

    Adatbázis: PostgreSQL

    OCR szolgáltatás: Google Cloud Vision API

    Fájltárolás: Cloudinary vagy helyi file storage

2. Adatmodell tervezése (1 hét)
   Fő entitások
   javascript

User {
id, email, name, password_hash, created_at
}

Wallet {
id, name, type: 'personal' | 'group',
owner_id, created_at
}

WalletMember {
id, wallet_id, user_id, role: 'owner' | 'member'
}

Transaction {
id, wallet_id, amount, description,
category, date, created_by,
// OCR mezők
original_image_url, ocr_raw_text,
ocr_confidence, is_auto_categorized
}

OCRJob {
id, user_id, image_path, status,
raw_text, extracted_data, error_message
}

3. Backend fejlesztés (3-4 hét)
   API végpontok tervezése
   text

GET /api/wallets - pénztárak listázása
POST /api/wallets - új pénztár létrehozása
GET /api/wallets/:id/transactions - tranzakciók listázása
POST /api/transactions - új tranzakció (manuális)
POST /api/ocr/process - OCR feldolgozás indítása
GET /api/ocr/jobs/:id - OCR job státusza
POST /api/ocr/confirm - OCR eredmény jóváhagyása

OCR szolgáltatás implementációja
python

# OCR feldolgozó pipeline

1.  Kép feltöltés → Cloud Storage
2.  Google Vision API hívás
3.  Szöveg kinyerés és elemzés
4.  Adatok strukturálása (összeg, dátum, hely)
5.  Eredmény visszaadása

6.  Frontend fejlesztés (3-4 hét)
    Fő komponensek

        Dashboard - áttekintő nézet

        WalletList - pénztárak kezelése

        TransactionList - tranzakciók listázása

        TransactionForm - új tranzakció (manuális/OCR)

        OCRUpload - képfeltöltés komponens

        Statistics - statisztikák megjelenítése

Útvonalak (React Router)
text

/ - dashboard
/wallets - pénztárak
/wallets/:id - pénztár részletek
/transactions - összes tranzakció
/statistics - statisztikák
/settings - beállítások

5.  OCR integráció részletesen (2 hét)
    Feldolgozási lépések

        Képfeltöltés

            Drag & drop interface

            Kép kompresszió (minőségmegtartással)

            Formátum validálás (jpg, png, pdf)

        OCR kérés

            Kép küldése Google Cloud Vision API-nak

            TEXT_DETECTION funkció használata

            Válasz feldolgozása és hibakezelés

        Adatkinyerés algoritmus

            Összeg keresése regex-szel

            Dátum parsing különböző formátumokból

            Kereskedő név azonosítása

            Biztonsági mentés: nyers szöveg tárolása

        Felhasználói interakció

            Javasolt adatok megjelenítése

            Szerkesztési lehetőség

            Megerősítés után mentés

6.  Tesztelési fázis (1-2 hét)
    Tesztesetek

        Manuális tranzakció rögzítés

        OCR feldolgozás különböző nyugtákkal

        Csoport pénztárak kezelése

        Hibakezelés (érvénytelen kép, API hiba)

        Teljesítmény tesztelés

Tesztadatok generálása

    5-10 különböző formátumú nyugta

    Különböző pénznemek és dátum formátumok

    Csoport pénztárak különböző méretekkel

7.  Dokumentáció és bemutató (1 hét)
    Dokumentációk

        Felhasználói dokumentáció - hogyan kell használni

        Technikai dokumentáció - architektúra, API dokumentáció

        Telepítési útmutató - lokális fejlesztési környezet

Bemutató anyagok

    Live demo - fő funkciók bemutatása

    Képernyőfelvételek - különböző állapotok

    Adatáramlási diagram - OCR folyamat vizualizációja

8. Időbeosztás javaslat
   Hét Feladat
   1-2 Előkészítés, technológiai kutatás
   3-4 Backend API fejlesztés
   5-6 Frontend alap komponensek
   7-8 OCR integráció
   9-10 Összekapcsolás, finomhangolás
   11 Tesztelés, hibajavítás
   12 Dokumentáció, előkészülés
9. Kockázatok és megoldásaik

   OCR pontosság → több OCR szolgáltató támogatása

   Komplex dátum formátumok → rugalmas dátum parser

   Teljesítmény → kép kompresszió, cache-elés

   Böngésző kompatibilitás → progresszív fejlesztés

Ez a terv biztos alapot ad a projekt megvalósításához, miközben rugalmasságot hagy a konkrét implementációs döntésekhez.
