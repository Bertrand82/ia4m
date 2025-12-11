
# Sommaire
- [Step 1](#step-1)
- [Etape 1 — Activer et configurer Firebase Authentification](#etape-1-activer-et-configurer-firebase-authentification)
- [Etape 2 — Activer et configurer Cloud Functions for Firebase](#etape-2-activer-et-configurer-cloud-functions-for-firebase)
- [Etape 3 — Configurer Firebase Hosting](#etape-3-configurer-firebase-hosting)
- [Step 2](#step-2-set-up-firebase-products-using-the-console-or-cli)
# Step 1
## Etape 1 Activer et configurer Firebase Authentification

 - Accédez à la console Firebase : Ouvrez votre navigateur et allez sur console.firebase.google.com  . Assurez-vous d'être connecté au bon projet ( ia4m2-18361 ).
 - Naviguez vers Authentication : Dans le menu de gauche, sous la section "Build" (Construire), cliquez sur "Authentication".
 - Démarrer : Si c'est la première fois que vous y allez, vous verrez un bouton "Get started" (Démarrer). Cliquez dessus.
 - Choisissez les méthodes de connexion : Une fois sur la page "Sign-in method" (Méthodes de connexion), vous verrez la liste des fournisseurs d'authentification disponibles.
    - Email/Password : Cliquez sur "Email/Password", activez-le ("Enable") et cliquez sur "Save" (Enregistrer).
    - Google : Cliquez sur "Google", activez-le, choisissez l'adresse e-mail d'assistance que vous souhaitez afficher pour vos utilisateurs et cliquez sur "Save". Vous devrez peut-être aussi configurer l'écran de consentement OAuth dans votre console Google Cloud si ce n'est pas déjà fait.
 - Une fois ces étapes réalisées, Firebase Authentication est activé et configuré dans votre projet pour ces méthodes de connexion.

## Etape 2 Activer et configurer Cloud Functions for Firebase
  - Accédez à la console Firebase : Comme pour l'authentification, rendez-vous sur console.firebase.google.com  et assurez-vous d'être dans votre projet ( ia4m2-18361 ).
  - Naviguez vers Functions : Dans le menu de gauche, sous la section "Build" (Construire), cliquez sur "Functions".
  - Démarrer (si nécessaire) : Si c'est votre première fois, la console vous proposera peut-être de "Get started" (Démarrer) ou de "Upgrade your project" (Mettre à niveau votre projet) si vous êtes sur le plan Spark et n'avez pas encore activé les fonctions payantes. Cloud Functions nécessite le plan "Blaze" (paiement à l'usage) pour la plupart des fonctionnalités, même si l'utilisation minimale peut être "no-cost".
  - Configuration locale via la CLI Firebase : La majeure partie de la configuration de Cloud Functions se fait localement, via l'interface de ligne de commande (CLI) de Firebase :
    - Installez la CLI Firebase : Si ce n'est pas déjà fait, ouvrez votre terminal et exécutez npm install -g firebase-tools .
    - Connectez-vous à Firebase : Exécutez firebase login pour connecter la CLI à votre compte Google.
    - Initialisez les fonctions : Naviguez jusqu'à la racine de votre dossier de projet et exécutez firebase init functions .
      - La CLI vous posera des questions. Choisissez "Use an existing project" (Utiliser un projet existant) et sélectionnez votre projet ia4m2-18361 .
      - Choisissez TypeScript comme langage pour vos fonctions, comme spécifié dans votre demande.
      - Acceptez d'installer les dépendances avec npm .
    - Ceci créera un dossier functions dans votre projet avec la structure nécessaire, y compris package.json , tsconfig.json et un fichier src/index.ts où vous écrirez votre code.
  - Octroyer les permissions pour Vertex AI : Pour que vos Cloud Functions puissent appeler l'API Generative Models (Vertex AI), vous devez accorder le rôle approprié au compte de service par défaut de vos fonctions.
    - Allez dans la console Google Cloud ( console.cloud.google.com  ).
    - Naviguez vers "IAM & Admin" > "IAM".
    - Recherchez le compte de service de votre fonction, qui est généralement sous la forme votre-projet-id@appspot.gserviceaccount.com .
    - Modifiez les autorisations de ce compte et ajoutez le rôle Vertex AI User (ID : roles/aiplatform.user ).

Ces étapes vous permettront de préparer votre environnement pour développer et déployer vos Cloud Functions.

## Etape 3 Configurer Firebase Hosting
Configurer Firebase Hosting pour votre application Angular est crucial pour sa performance et sa livraison rapide. Voici comment procéder :
  - Prérequis : Assurez-vous d'avoir la Firebase CLI installée et que vous êtes connecté ( firebase login ).
  - Initialisez Firebase Hosting :
    - Naviguez jusqu'à la racine de votre dossier de projet dans votre terminal.
    - Exécutez la commande firebase init hosting .
    - La CLI vous posera plusieurs questions :
       - "Which project do you want to use?" (Quel projet voulez-vous utiliser ?) : Sélectionnez votre projet ia4m2-18361 .
       - What do you want to use as your public directory?" (Quel répertoire voulez-vous utiliser comme répertoire public ?) : Pour Angular, ce sera généralement dist/your-app-name (remplacez your-app-name par le nom de votre projet Angular, que vous trouverez dans votre angular.json sous architect.build.options.outputPath ).
       - "Configure as a single-page app (rewrite all URLs to /index.html)?" (Configurer comme une application monopage ?) : Répondez Yes (Oui). C'est essentiel pour le routage côté client d'Angular.
       - "Set up automatic builds and deploys with GitHub?" (Configurer des builds et déploiements automatiques avec GitHub ?) : Répondez selon vos préférences (pour l'instant, No peut suffire).
Cette commande va créer ou mettre à jour un fichier firebase.json à la racine de votre projet.

  - Activez le mode "framework-aware" pour Angular (fortement recommandé) :
    -Pour tirer parti des optimisations de Firebase pour les applications Angular, activez l'expérimentation dans la CLI :
firebase experiments:enable webframeworks

  - Puis relancez l'initialisation de Hosting (`firebase init hosting`) et, si l'option est présentée, choisissez d'utiliser un "web framework" et sélectionnez Angular. Cela configurera votre `firebase.json` de manière plus spécifique pour Angular.
  - Configurez les réécritures ( rewrites ) pour vos Cloud Functions : Dans votre firebase.json , vous devrez ajouter une section rewrites pour rediriger les appels d'API de votre frontend vers vos Cloud Functions. Assurez-vous que votre firebase.json ressemble à ceci (ajustez le nom de la fonction si différent) :
    ``` {
    "hosting": {
    "public": "dist/your-app-name", // Assurez-vous que ce chemin est correct pour votre projet Angular
    "ignore": [
    "firebase.json",
    "**/.*",
    "**/node_modules/**"
    ],
    "rewrites": [
    {
    "source": "/api/generate",
    "function": "generate" // Le nom de votre Cloud Function "generate"
    },
    {
    "source": "**",
    "destination": "/index.html"
    }
    ]
    }
    }
    ```

  - Cette réécriture garantira que tout appel à `/api/generate` depuis votre application web sera automatiquement acheminé vers votre Cloud Function nommée `generate`.
  - Une fois ces étapes effectuées, votre Firebase Hosting est prêt à servir votre application Angular et à s'intégrer avec vos Cloud Functions !




## Step 2 Set up Firebase products using the Console or CLI

 Set up Firebase products using the Console or CLI" concerne l'activation et la configuration initiale de chaque produit que nous avons choisi. Voici un récapitulatif des orientations générales que nous avons déjà couvertes :
  - Firebase Authentication : Pour l'activer, vous devez vous rendre dans la Console Firebase , naviguer vers la section "Authentication" et y activer les méthodes de connexion souhaitées (Email/Password et Google Sign-in).
  - Cloud Functions for Firebase : L'initialisation principale se fait via la Firebase CLI . Vous utiliserez la commande firebase init functions dans votre terminal pour créer la structure de base de vos fonctions. N'oubliez pas l'étape cruciale dans la Console Google Cloud pour accorder les rôles IAM nécessaires à votre compte de service afin qu'il puisse interagir avec l'API Vertex AI.
  - Firebase Hosting : Sa configuration est également effectuée via la Firebase CLI avec la commande firebase init hosting . Cette étape inclut la définition de votre répertoire public Angular et la mise en place de règles de réécriture dans votre firebase.json pour intégrer vos Cloud Functions.

Nous avons déjà parcouru les détails pour chacun de ces points dans nos échanges précédents. Si vous avez besoin de revoir les instructions spécifiques pour l'un d'eux, faites-le moi savoir !

   - Get to know Firebase for web
   - Enable and set up Firebase products in the console** The app that you're building uses several Firebase products that are available for web apps: - **Firebase Authentication** and **Firebase UI** to easily allow your users to sign in to your app. - **Cloud Firestore** to save structured data on the cloud and get instant notification when data changes. - **Firebase Security Rules** to secure your database. - **Firebase Hosting** to host and serve your assets. Some of these products need special configuration or need to be enabled using the Firebase console.
Get to know Firebase for web
   - Enable and set up Firebase products in the console** The app that you're building uses several Firebase products that are available for web apps: - **Firebase Authentication** and **Firebase UI** to easily allow your users to sign in to your app. - **Cloud Firestore** to save structured data on the cloud and get instant notification when data changes. - **Firebase Security Rules** to secure your database. Some of these products need special configuration or need to be enabled using the Firebase console.
Send and receive notifications for a Flutter app using Firebase Cloud Messaging
   - Set up the Firebase CLI** If you have the Firebase CLI set up, you can skip this step. Go to [Firebase CLI reference](https://firebase.google.com/docs/cli) to download and install the Firebase CLI. Log into Firebase with your Google Account with the following command: ``` text firebase login ```
Add Firestore Vector Search to your mobile apps with Firebase Extensions
   - Enable and set up Firebase products in the console The app that you're building uses several Firebase products that are available for Apple apps: - **Firebase Authentication** to easily allow your users to sign in to your app. - **Cloud Firestore** to save structured data on the cloud and get instant notification when data changes. - **Firebase Security Rules** to secure your database. Some of these products need special configuration or need to be enabled using the Firebase console.
Firebase Android Codelab - Build Friendly Chat
  - Log In Run ` firebase login ` to connect the CLI to your Google account. This will open a new browser window to complete the login process. Make sure to choose the same account you used when creating your Firebase project earlier.
Cloud Firestore Android Codelab  |  Firebase
  - Log In Run ` firebase login ` to connect the CLI to your Google account. This will open a new browser window to complete the login process. Make sure to choose the same account you used when creating your Firebase project earlier.
Add a user authentication flow to a Flutter app using FirebaseUI
  - 2\. Create and set up a Firebase project The first task you'll need to complete is creating a Firebase project in Firebase web console.
Google Ads with Google Analytics for Firebase custom events - Android
  - 2\. Create and set up a Firebase project To get started with Firebase, you'll need to create and set up a Firebase project.
Set up and manage Firebase projects and products via Terraform
  - 10\. Install, configure, and initialize Firebase To get an app working with Firebase, your app needs the Firebase SDK and the Firebase configuration for your Firebase project. The sample code for this codelab is already a working app with all the dependencies and required functions for using various Firebase products in the app. You can look in [` web/package.json `](https://github.com/firebase/friendlychat/blob/master/web/package.json) and [` web/src/index.js `](https://github.com/firebase/friendlychat/blob/master/web/src/index.js) if you'd like to see what's already been done. Even though the sample code is mostly complete, you still need to do a few things to get your app running, including: install the Firebase SDK, start your build, add the Firebase configuration to your app, and finally initialize Firebase.
