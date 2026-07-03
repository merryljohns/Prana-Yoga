/**
 * Firebase Integration and Storage Handler.
 * Integrates Firebase Firestore and falls back gracefully to LocalStorage
 * if credentials are left as placeholders.
 */

// REPLACE this configuration with your Firebase project credentials:
const firebaseConfig = {
    apiKey: "AIzaSyCJlKvRa2MiKesm61YMSgwPhyCtB61G1Yk",
    authDomain: "sample-46553.firebaseapp.com",
    projectId: "sample-46553",
    storageBucket: "sample-46553.firebasestorage.app",
    messagingSenderId: "1010808035540",
    appId: "1:1010808035540:web:101699c3a9495a6c13c341",
    measurementId: "G-67HNL379VD"
};

let db = null;
let isFirebaseInitialized = false;

// Attempt to initialize Firebase
try {
    // Check if configuration has been updated and firebase library is loaded
    const isConfigValid = firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("YOUR_");
    
    if (isConfigValid && typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        isFirebaseInitialized = true;
        console.log("Firebase initialized successfully.");
    } else {
        if (typeof firebase === 'undefined') {
            console.info("Firebase SDK not loaded yet. Mock database fallback will be used.");
        } else {
            console.info("Using mock registration storage. To enable live database storage, update the configuration in assets/js/firebase.js.");
        }
    }
} catch (error) {
    console.error("Error initializing Firebase:", error.message);
}

/**
 * Submits a new registration entry.
 * Saves to Firebase Firestore if initialized; otherwise falls back to LocalStorage.
 * 
 * @param {string} name - Registrant's name
 * @param {string} email - Registrant's email address
 * @param {string} phone - Registrant's phone number
 * @param {string} classId - The ID of the yoga class
 * @returns {Promise<{success: boolean, id?: string, error?: any}>}
 */
window.saveRegistration = async function(name, email, phone, classId) {
    const registrationData = {
        Name: name,
        Email: email,
        Phone: phone,
        Class_ID: classId,
        registered_at: new Date().toISOString()
    };

    if (isFirebaseInitialized && db) {
        try {
            // Save to Firestore collection "registrations"
            const docRef = await db.collection("registrations").add(registrationData);
            console.log("Registration successfully saved in Firestore. Doc ID:", docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Firestore write failed:", error);
            // Fallback to local storage in case of writing failures
            saveToLocalStorage(registrationData);
            return { success: true, id: "local_" + Date.now(), error: error.message };
        }
    } else {
        // Local simulation fallback
        saveToLocalStorage(registrationData);
        return { success: true, id: "local_" + Date.now() };
    }
};

/**
 * Saves registration to local storage for testing and local persistence.
 */
function saveToLocalStorage(data) {
    try {
        const currentList = JSON.parse(localStorage.getItem('yoga_registrations') || '[]');
        currentList.push(data);
        localStorage.setItem('yoga_registrations', JSON.stringify(currentList));
        console.log("Registration simulated and saved to LocalStorage:", data);
    } catch (e) {
        console.error("LocalStorage write failed:", e);
    }
}

/**
 * Helper to fetch all simulated registrations stored in LocalStorage.
 */
window.getLocalRegistrations = function() {
    try {
        return JSON.parse(localStorage.getItem('yoga_registrations') || '[]');
    } catch (e) {
        return [];
    }
};
