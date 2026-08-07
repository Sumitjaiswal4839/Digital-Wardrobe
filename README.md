# 👗 Digital Wardrobe & 3D Fitting Studio

An offline-first, high-performance React Native & Expo mobile app that brings your physical wardrobe into a virtual 3D Fitting Studio. Mix & match outfits on interactive 3D mannequins, import garments from e-commerce links, remove image backgrounds in 1-click, and analyze your style metrics — all powered by local SQLite storage.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo_SDK-54.0-000000?style=for-the-badge&logo=expo)
![SQLite](https://img.shields.io/badge/SQLite-Offline_DB-003B57?style=for-the-badge&logo=sqlite)
![License](https://img.shields.io/badge/License-0BSD-brightgreen?style=for-the-badge)

---

## ✨ Features

- **🕺 3D Mannequin Fitting Studio**: Drag, rotate, flip, and 2-finger pinch-to-zoom outfit layers on male & female 3D mannequin models using `react-native-reanimated` and `react-native-gesture-handler`.
- **📍 Garment Body Zone Auto-Placement**: Intelligent Y-coordinate positioning based on garment category (`Topwear`, `Bottomwear`, `Footwear`, `Full Outfit`).
- **✂️ Smart Crop & White Background Eraser**: Auto-remove white or solid backgrounds from imported clothing photos with sensitivity threshold controls.
- **🌐 E-Commerce Web Import**: Import outfits directly from Flipkart, Amazon, Pinterest, or Google URLs with automatic HD product image extraction.
- **💾 Saved Fits & Try-On**: 1-Tap "Try On" from wardrobe catalog to canvas and save full combo looks.
- **📊 Real Wardrobe Insights**: Local SQLite analytics showing total outfits, top categories, saved looks, and usage frequency.
- **🔒 100% Offline & Private**: Zero data sent to third-party servers. All images and database tables reside locally on your device.

---

## 🛠️ Tech Stack

- **Framework**: React Native 0.81 / Expo SDK 54
- **Styling & UI**: Custom Vanilla HSL Color System, Glassmorphism, Lucide Icons
- **Gestures & Animations**: `react-native-gesture-handler` + `react-native-reanimated` v3
- **Database Layer**: `expo-sqlite` (Native iOS/Android) + `webStorage` fallback (Web)
- **Image Processing**: `expo-file-system/legacy` + HTML5 Canvas PNG cutout transformer
- **Security**: Security threat scanner & URL sanitizer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go App on Android/iOS (or Android Emulator / iOS Simulator)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/digital-wardrobe.git
   cd digital-wardrobe
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start Expo Development Server**
   ```bash
   npx expo start --clear
   ```

4. **Run on Device**
   - Scan the QR code using the **Expo Go** app on your phone.
   - Or press `a` for Android Emulator, `i` for iOS Simulator, or `w` for Web.

---

## 📁 Project Structure

```
digital-wardrobe/
├── assets/                  # 3D Avatar mannequin images & app icons
├── src/
│   ├── components/          # Reusable UI cards, modals, overlay gesture handlers
│   ├── constants/           # Avatars & model asset registry
│   ├── database/            # SQLite schema, queries & web storage fallbacks
│   ├── screens/             # Main screen tabs (Fitting Studio, Catalog, Saved Fits, Insights)
│   ├── theme/               # Centralized color tokens, spacing & radius
│   └── utils/               # FileSystem, URL security & image extractors
├── App.js                   # Main application navigation & root state
├── index.js                 # Entry point wrapped in GestureHandlerRootView
├── package.json             # Project dependencies & scripts
└── README.md                # Documentation
```

---

## 🔒 Security & Privacy Notice

- **No Remote Tracking**: All wardrobe data, uploaded photos, and created looks are stored locally in the SQLite database file on your device.
- **Environment Variables**: Sensitive configuration can be customized via `.env` (refer to `.gitignore`).

---

## 📄 License

This project is licensed under the 0BSD License.
