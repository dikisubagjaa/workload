let adminInstance;

export function getAdmin() {
    if (adminInstance) return adminInstance;
    // eslint-disable-next-line global-require
    const admin = require("firebase-admin");

    if (!admin.apps.length) {
        const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (json) {
            const creds = JSON.parse(json);
            admin.initializeApp({ credential: admin.credential.cert(creds) });
        } else {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
            admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
        }
    }
    adminInstance = admin;
    return adminInstance;
}
