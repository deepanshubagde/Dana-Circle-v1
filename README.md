# Dana Circle (Donation Portal)

A serene, Buddhist-inspired community donation portal rooted in the concept of **Dana** (generosity). Built with pure white space, earthy tones, and Monkhood Saffron accents.

## 🌟 Key Features

- **Live Sangha Impact Trajectory:** Rich graphical representation of communal generosity featuring:
  - Total Dana Given So Far counter in INR
  - Continuous SVG Bézier Growth Curve with interactive nodes
  - Monthly bar distribution
  - 100% direct cause allocation breakdown
  - Sacred privacy protection (individual donor identities and amounts are strictly private)
- **4-Step Linear Offering Flow:**
  1. *Select Cause:* Verified NGO details, UPI credentials, and bank account numbers with 1-click copy
  2. *Make Donation:* Scannable UPI QR code and 1-tap mobile link to open Google Pay, PhonePe, or Paytm directly
  3. *Upload Proof:* Drag-and-drop or tap-to-upload zone accepting `.jpg`, `.png`, and `.pdf` payment receipts, plus demo samples
  4. *AI Extraction & Success:* Automated OCR extraction via Gemini Vision API, transitioning to a massive Green Checkmark and live ledger graph update
- **Admin Control Sanctuary:**
  - Discreet `🔒 Admin` access button in top corner
  - Gated access requiring verified administrator credentials
  - Theme manager for updating active NGO name, monthly cause, UPI credentials, and QR codes
- **Serverless Architecture:**
  - Zero SQL / Mongo required
  - Google Apps Script webhook backend (`Code.gs`) connected to Google Drive and cloud ledger

---

## 🚀 Deployment

### Option 1: Cloudflare Pages (Recommended)

1. Push this repository to GitHub.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set the build configuration:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**. Cloudflare edge routing (`public/_redirects`) is preconfigured!

### Option 2: Full-Stack / Node.js (Cloud Run / VPS / Railway / Render)

```bash
# Install dependencies
npm install

# Start development server with live Gemini Vision API proxy
npm run dev

# Or build and run production server
npm run build
npm start
```

### Option 3: Standalone Single-File (GitHub Pages / Zero-Build)

A complete standalone single-file version is pre-built at `public/standalone-portal.html`. You can rename it to `index.html` and drop it onto any static web host or GitHub Pages branch.

---

## ⚡ Google Apps Script (`Code.gs`) Setup

1. Create a new Google Spreadsheet named `Dana Circle Ledger`.
2. Go to **Extensions** > **Apps Script**.
3. Copy the script from `google-apps-script/Code.gs` and paste it into the editor.
4. Go to **Project Settings (gear icon)** > **Script Properties** and add:
   - `GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/).
   - `DRIVE_FOLDER_ID`: *(Optional)* Google Drive Folder ID to store uploaded receipts.
5. Click **Deploy** > **New deployment** > Select **Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
6. Copy the generated Web App URL and paste it into the Dana Circle Admin Panel (`🔒 Admin`).

---

## 🔐 Administrator Access

- Click the `🔒 Admin` button in the top-right corner or append `?admin=true` to the URL.
- Default credentials:
  - **Admin Email:** `deepanshubagde@gmail.com`
  - **Admin Passcode:** `dana2025` or `sangha`

---

## 📜 License

Apache-2.0
