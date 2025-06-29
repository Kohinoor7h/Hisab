# Shop Accounting App

Yeh ek React-based web application hai jo dukaan ke hisab-kitab ko manage karne ke liye banayi gayi hai. Ismein automatic calculations, AI-powered insights, multi-language support (English aur Hinenglish), aur customizable themes jaise features shamil hain.

## Features

* **User Authentication:** Secure login system (username: `mushahid`, password: `hisab`).
* **Dashboard:** Income, Expense, aur Net Balance ka real-time summary.
* **Transaction Management:** Nayi entries add karein, existing entries ko edit ya delete karein.
* **Automatic Calculations:** Entries add karte hi totals apne aap update ho jaate hain.
* **AI Assistant:** Apne transactions ke baare mein AI se sawaal poochein, expense insights aur monthly summaries paayein.
* **Theme Control:** Light, Dark, aur Blue themes ke beech switch karein.
* **Language Support:** English aur Hinenglish (Hindi in Latin script) mein app ka upyog karein.
* **Data Persistence:** Firebase Firestore ka upyog karke data cloud mein store hota hai.

## Setup aur Run Kaise Karein

Project ko local machine par setup aur run karne ke liye in steps ko follow karein:

### Prerequisites

 सुनिश्चित करें कि आपके सिस्टम पर Node.js और npm (Node Package Manager) इंस्टॉल हैं।

* **Node.js aur npm:**
    * [Node.js website](https://nodejs.org/) se latest LTS version download aur install karein. npm Node.js ke saath hi install ho jaata hai.
    * Installation verify karne ke liye:
        ```bash
        node -v
        npm -v
        ```

### Installation

1.  **Repository Clone Karein:**
    ```bash
    git clone <aapke-github-repo-ka-url>
    cd shop-accounting-app
    ```

2.  **Dependencies Install Karein:**
    ```bash
    npm install
    ```

### Firebase Setup

Yeh application data storage ke liye Firebase Firestore ka upyog karti hai. Isse run karne ke liye aapko apna Firebase project setup karna hoga:

1.  **Firebase Project Banayein:**
    * [Firebase Console](https://console.firebase.google.com/) par jaakar ek naya project banayein.
    * Apne project ke liye Firestore Database enable karein (Start in production mode).
    * **Security Rules:** Firestore security rules ko update karein taki authenticated users read/write kar sakein.

    ```firestore
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /artifacts/{appId}/users/{userId}/{documents=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

2.  **Firebase Config:**
    * Apne Firebase project settings mein jaakar "Your apps" section se "Web app" choose karein.
    * Aapko ek `firebaseConfig` object milega. Ismein se `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` values ko copy karein.
    * **Important:** Is application mein `__app_id`, `__firebase_config`, aur `__initial_auth_token` jaise global variables ka upyog kiya gaya hai jo Canvas environment dwara provide kiye jaate hain. GitHub par deploy karte samay, aapko in values ko seedhe code mein hardcode karna hoga ya environment variables ka upyog karna hoga.

    `src/App.js` file mein, aapko in lines ko update karna hoga:

    ```javascript
    // Global Firebase variables (provided by Canvas environment)
    // const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Is line ko hata dein ya comment kar dein
    // const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {}; // Is line ko hata dein ya comment kar dein
    // const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; // Is line ko hata dein ya comment kar dein

    // Inki jagah apni Firebase config values daalein
    const appId = "aapka-firebase-app-id-yahan"; // Example: "1:1234567890:web:abcdef1234567890abcdef"
    const firebaseConfig = {
      apiKey: "aapka-api-key-yahan",
      authDomain: "aapka-auth-domain-yahan",
      projectId: "aapka-project-id-yahan",
      storageBucket: "aapka-storage-bucket-yahan",
      messagingSenderId: "aapka-messaging-sender-id-yahan",
      appId: "aapka-app-id-yahan" // Yeh bhi upar wale appId jaisa hi hoga
    };
    const initialAuthToken = null; // Ya agar aap custom token use kar rahe hain to woh token string
    ```
    **Note:** `userId` ko `auth.currentUser?.uid || crypto.randomUUID()` se generate kiya ja raha hai. Iska matlab hai ki agar user authenticated hai to uska Firebase UID use hoga, varna ek random ID generate hogi.

### Run Karein

Development mode mein app ko run karne ke liye:

```bash
npm start
Yeh command project ko development mode mein chalayega. Aap application ko apne browser mein http://localhost:3000 par dekh sakte hain. Changes karne par page apne aap reload ho jayega.Build KareinProduction ke liye optimized build banane ke liye:npm run build
Yeh command build folder mein production-ready files generate karega.DeploymentAap build folder ko kisi bhi static hosting service