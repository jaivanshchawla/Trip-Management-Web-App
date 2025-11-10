import CryptoJS from 'crypto-js';

// Replace this with your secret key. It should be stored securely (e.g., in environment variables)
const SECRET_KEY = 'thisislittlesecret';

export function encryptData(data : string) {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

export function decryptData(ciphertext : string) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    console.log(originalText)
    return originalText;
}
