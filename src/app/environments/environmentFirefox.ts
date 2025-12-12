export const environmentFirefox = {
  production: false,
  geminiApiUrl2: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  geminiApiUrl:'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent',
  geminiApiUrlMultimodal : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent',
  geminiApiUrlMultimodal____ : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  geminiApiUrlMultimodal__doesnt_work : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
  openRouterApiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  firebase: {
    apiKey: 'VOTRE_API_KEY',
    authDomain: 'VOTRE_AUTH_DOMAIN',
    projectId: 'VOTRE_PROJECT_ID',
    storageBucket: 'VOTRE_STORAGE_BUCKET',
    messagingSenderId: 'VOTRE_MESSAGING_SENDER_ID',
    appId: 'VOTRE_APP_ID',
  },

  googleClientId_: 'VOTRE_CLIENT_ID.apps.googleusercontent.com', // remplacer par votre Client ID
 //gmailScopes_old: 'https://www.googleapis.com/auth/gmail.readonly',
  gmailScopes : 'https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.modify'

};

