# Responsive Yoga Webinar Template

A premium, responsive webinar landing page for Yoga Classes designed with **HTML, Bootstrap 5, custom CSS (vanilla), and Vanilla JavaScript**.

This website integrates live staging APIs to showcase banner images, introductory videos, testimonials, and active yoga classes, and includes a full registration system linked with **Firebase Firestore**.

---

## 📁 Folder Structure

The project strictly follows the requested directory layout:

```text
Yoga-Webinar-Template/
│
├── index.html                  # Main landing page layout
│
├── assets/
│   ├── css/
│   │   └── style.css           # Premium typography, color systems & animations
│   │
│   ├── js/
│   │   ├── api.js              # Handles fetch requests to Bienapp APIs with fallback data
│   │   ├── firebase.js         # Firebase config, Firestore saves, and LocalStorage fallback
│   │   └── script.js           # Coordinates UI rendering, form validation, and carousel
│   │
│   ├── images/                 # Image assets (optional local overrides)
│   └── videos/                 # Video assets (optional local overrides)
│
└── README.md                   # This project documentation
```

---

## ⚡ Live API Integration

The website consumes the following JSON endpoints dynamically:

1. **Banner List API:**
   - URL: `https://ht-admin-api-stg.bienapp.in/api/home/webinar/banner-list` (GET)
   - Fetches and displays dynamic slide banners inside the hero header.

2. **Video List API:**
   - URL: `https://ht-admin-api-stg.bienapp.in/api/home/webinar/video-list` (GET)
   - Fetches the introductory video link and embeds it responsively.

3. **Classes List API:**
   - URL: `https://ht-admin-api-stg.bienapp.in/api/home/webinar/class-list` (GET)
   - Populates the class listing section and updates the registration form selector options automatically.

4. **Testimonials List API:**
   - URL: `https://ht-admin-api-stg.bienapp.in/api/home/webinar/testimonial-list` (GET)
   - Displays student feedback using a custom fade-in testimonials slider.

*Note: If the live endpoints fail, timeout, or trigger CORS issues, the page automatically switches to local fallback datasets matching the requested formats, keeping the user interface completely functional.*

---

## 🔥 Firebase Integration & Setup

The registration form collects the registrant's **Name, Phone, Email, and selected Class ID**. Submissions save directly to a Firestore database.

### How to configure live Firestore storage:

1. Open [assets/js/firebase.js](file:///C:/Users/merry/.gemini/antigravity/scratch/Yoga-Webinar-Template/assets/js/firebase.js).
2. Replace the empty values in `firebaseConfig` with your actual project keys from the Firebase console:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```
3. Open Firebase Console -> Database -> Cloud Firestore and create a collection named `registrations`.
4. Ensure Firestore security rules allow writing submissions (e.g. enabling temporary public writes or specific client validations).

### 💡 Fallback Out-of-the-Box Mode:
If `firebaseConfig` is not configured, the website runs in **Simulated Storage mode**. Submissions will be printed in the console and persisted in the browser's `LocalStorage` so you can verify form validation and success modal interactions immediately.

---

## 🚀 How to Run Locally

You can run this project locally by opening `index.html` directly in any web browser, or by serving it using a light development server:

### Python 3
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### Node.js / live-server
```bash
npm install -g live-server
live-server
```

---

## 🎨 Design Features
- **Curated Palette:** Custom HSL/Teal styling representing yoga's calming themes.
- **Glassmorphic Navigation:** Blurry transparent navigation bar that locks to the top.
- **Micro-animations:** Hover transitions on buttons, interactive card elevation, and smooth carousel transitions.
- **Responsive Embeds:** Responsive 16:9 YouTube wrapper for clean viewing on mobile, tablet, and desktop viewports.
