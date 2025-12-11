# IA4m Prompt pour generer appli

```text
Tu es un assistant développeur expert qui va générer un projet complet (fichiers et contenu) pour une application web de gestion d'emails inspirée du comportement de Gmail. L'application doit être prête à être clonée dans un repo Git, buildée et déployée sur Firebase Hosting + Cloud Functions. L'IA "Gemini" sera utilisée uniquement côté serveur (Cloud Function) via l'API Generative Models (Vertex AI), pour des fonctionnalités facultatives comme résumé automatique, suggestions de réponse et tri intelligent.

Important — contraintes et recommandations :
- Ne pas inclure ou reproduire d'éléments propriétaires (logo Gmail, assets Google). Le design doit être original mais s'inspirer de la disposition boîte mail (bandeau supérieur, sidebar, liste d'emails, aperçu).
- L'architecture doit séparer frontend (Angular) et backend (Cloud Functions). Toutes les requêtes vers Gemini doivent être effectuées par la Function.
- Pour éviter des conflits de peerDependencies avec @angular/fire, n'utilise PAS @angular/fire. Utilise le SDK officiel firebase (firebase/app, firebase/auth, firebase/firestore, firebase/storage) et fournis des providers Angular pour l'initialisation.
- Le projet cible Angular version: angularVersion=20. Indique la version majeure dans le package.json.
- Fournis un ensemble minimal mais complet de fichiers: package.json (app & functions), angular.json, tsconfig, src/app with components/services, styles, environments, functions/src with code TypeScript pour appeler Gemini (Vertex AI) en toute sécurité via google-auth-library, firebase.json, .gitattributes, README.md.
- L'output doit être strictement au format JSON (ou un format structuré) contenant un tableau "files" : [{ "path": "<path>", "content": "<file content>" }]. Ne rien envoyer hors de ce JSON. (Si l'interface ne supporte pas JSON, renvoie une liste de fichiers en markdown avec un header indiquant le chemin, puis bloc de code contenant le contenu.)
- Inclure des placeholders clairement identifiables pour toutes les valeurs sensibles (FIREBASE_CONFIG, PROJECT_ID, MODEL, LOCATION). Ne pas inclure de vraies clés.
- Inclure des instructions d'installation et de déploiement (commands) dans README.md.

Fonctionnalités attendues (minimum viable feature set)
1) Auth:
  - Firebase Authentication (Email/Password et Google sign-in).
  - Frontend login/logout + guard pour routes privées.
  - Appel à gemini , pour chaque mail, pour recuperer un ou plusieurs labels parmi une liste: banque, perso, offreEmploi, newsletter,contact, administratif, abonnements

2) UI/UX:
  - Bandeau supérieur distinctif avec branding "ia4mail".
  - Sidebar (Compose, Dossiers: Boîte de réception, Important, Envoyés, Brouillons, Spam, Labels).
  - Liste d'emails centrale (infinite scroll/pagination), items avec statut lu/non lu, avatar initiales, sujet, snippet, time.
  - Panneau d'aperçu à droite (déployable/cachable sur mobile).
  - Fenêtre de composition (dialog) avec possibilité d'ajouter pièces jointes (upload vers Firebase Storage).
  - Recherche côté client (sur cached local fields) + recherche serveur Firestore (texte simple).
  - Actions: marquer lu/non lu, supprimer (déplacer vers corbeille), archiver, déplacer vers label.

3) Stockage / backend:
  - Emails restent dans gmail: utilisation de l'api de gmail pour lister les messages, afficher leur contenu.
  - Pour chaque mail, un bouton permettant l'ouverture du mail dans gmail.
  - Cloud Function HTTPS "generate" qui reçoit prompt+context et appelle Gemini/Vertex AI, renvoie résumé ou suggestion.
  - Cloud Function "sendEmail" qui peut simuler enregistrement d'un message envoyé dans Firestore (et éventuellement envoi réel via SMTP si fourni plus tard).

4) Gemini integration (Cloud Function):
  - Utiliser google-auth-library pour récupérer token d'accès (ou Application Default Credentials en runtime).
  - Appeler l’endpoint appropriate: projects/PROJECT_ID/locations/LOCATION/models/MODEL:generate (ou l’endpoint documenté actuellement), POST JSON avec prompt.
  - La function doit vérifier l’ID token Firebase passé par l’utilisateur (Authorization: Bearer <idToken>) et valider avec admin.auth().verifyIdToken avant d’autoriser l’appel.
  - Implémenter throttling simple / rate-limiting / quota par utilisateur (en mémoire simple ou via Firestore counters) pour éviter abus.

5) Dev / déploiement:
  - firebase.json avec hosting rewrites pour rediriger /api/generate vers la Cloud Function "generate".
  - Scripts npm pour build, serve, deploy.
  - README détaillant: installer dépendances, config environment, commande pour initialiser Firebase, déployer functions+hosting, tester localement avec emulators.

6) Tests & qualité:
  - Linter basique (ESLint), config minimale, et option --fix dans README.
  - Exemples de tests unitaires non obligatoires mais un test simple pour AuthService si possible.

Format de sortie demandé
- Réponds sous forme de JSON strict avec la structure:
{
  "project": "ia4mail",
  "angularVersion": "{{angularVersion}}",
  "files": [
    { "path": "package.json", "content": "..." },
    { "path": "angular.json", "content": "..." },
    ...
  ],
  "instructions": "Texte court (installation & déploiement)"
}
- Chaque fichier content doit être la version complète du fichier (pas d'extraits), encodée en UTF-8. Pour les fichiers binaires (aucun ici), indiquer un placeholder.
- Noms de fichiers et arborescence clairs et prêts à coller dans un repo.

Exemples de fichiers absolument requis dans la réponse (au moins):
- package.json (racine) (script build, start)
- .gitattributes (normaliser eol=lf)
- README.md (usage)
- firebase.json (hosting+functions rewrites)
- src/environments/environment.ts (avec placeholder FIREBASE_CONFIG)
- src/main.ts (bootstrapApplication ou AppModule selon angularVersion)
- src/app/app.component.ts/.html/.scss
- src/app/app.module.ts OR config pour standalone bootstrap
- src/app/components: sidebar, inbox, preview, compose-dialog (html/scss/ts)
- src/app/services: auth.service.ts, email.service.ts, firebase.providers.ts, genai.service.ts (client calling the function)
- functions/package.json, functions/src/index.ts (generate function + sendEmail function), functions/README
- tsconfig.json (root) and functions/tsconfig.json

Sécurité / Notes finales :
- N'inclue pas de clés. Utilise placeholders comme "__FIREBASE_API_KEY__".
- Indique comment configurer les variables Firebase (via environment files or firebase functions:config:set).
- Indique comment accorder le rôle Vertex AI à l'account used by functions: roles/aiplatform.user.
- Indique comment tester localement: gcloud auth application-default login + firebase emulators:start.

Réponse attendue :
- Si tu peux renvoyer le JSON complet contenant chaque fichier demandé, fais-le.
- Si la sortie dépasse la limite de tokens, fournis d'abord l'arborescence + README + fichiers critiques (firebase providers, functions/index.ts, auth.service, email.service, app component), puis demande si tu veux le reste.

Fin du prompt.

