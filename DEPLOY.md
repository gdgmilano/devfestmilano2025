# 🚀 Deploy DevFest Milano 2025

## 🗄️ PREREQUISITI - NUOVO PROGETTO FIREBASE

Questo repository è configurato per il nuovo progetto Firebase `devfest-milano-2025`.

Assicurati di:
1. Avere accesso al progetto `devfest-milano-2025` su Firebase Console
2. Aver fatto login con Firebase CLI: `firebase login`
3. Aver selezionato il progetto corretto: `firebase use devfest-milano-2025`

## 🚀 Script di Deploy

### Deploy Completo
```bash
# Deploy completo (funzioni, hosting, storage, firestore)
npm run deploy
```

### Deploy Specifici
```bash
# Deploy solo funzioni
npm run deploy:functions

# Deploy solo hosting
npm run deploy:hosting

# Deploy solo storage
npm run deploy:storage
```

## 📁 Configurazione

- **firebase.json**: Configurazione principale
- **.firebaserc**: Progetto Firebase (devfest-milano-2025)
- **config/production.json**: Configurazione di produzione

## 🎯 Funzioni Deployate

- `prerender`
- `sendGeneralNotification`
- `scheduleNotifications`
- `mailchimpSubscribe`
- `optimizeImages`
- `sessionsWrite`
- `scheduleWrite`
- `speakersWrite`

## ✅ Verifica Post-Deploy

1. Verifica che tutte le funzioni siano state deployate correttamente
2. Testa il sito per assicurarti che funzioni correttamente
3. Controlla che il database Firestore sia configurato correttamente