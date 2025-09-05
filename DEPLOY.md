# Deploy Instructions - DevFest Milano 2025

## ⚠️ IMPORTANTE - NON CANCELLARE LE FUNZIONI 2024

Questo repository gestisce SOLO le funzioni 2025. Le funzioni 2024 devono rimanere intatte in GCP.

## 🚀 Script di Deploy

### Deploy Completo (SICURO)
```bash
# Deploy solo hosting e storage (NON tocca le funzioni esistenti)
npm run deploy:hosting
npm run deploy:storage
```

### Deploy Solo Funzioni 2025
```bash
# Deploy solo le nuove funzioni 2025
npm run deploy:functions
```

### Deploy Tutto (ATTENZIONE)
```bash
# Usa con cautela - potrebbe interferire con le funzioni esistenti
npm run deploy
```

## 📁 Configurazione

- **firebase.json**: Configurazione principale (solo hosting, storage, firestore)
- **firebase-functions.json**: Configurazione specifica per le funzioni 2025
- **.firebaserc**: Progetto Firebase (devfest-milano-2024)

## 🎯 Funzioni 2025 Deployate

- `prerender2025`
- `sendGeneralNotification2025`
- `scheduleNotifications2025`
- `mailchimpSubscribe2025`
- `optimizeImages2025`
- `sessionsWrite2025`
- `scheduleWrite2025`
- `speakersWrite2025`

## ✅ Verifica Post-Deploy

1. Controlla che le funzioni 2024 siano ancora presenti in GCP
2. Verifica che le funzioni 2025 siano state deployate
3. Testa il sito per assicurarti che funzioni correttamente
