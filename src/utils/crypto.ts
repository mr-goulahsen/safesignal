// src/utils/crypto.ts
// Hybrid Security: AES-256-GCM Encryption + Morse Code Steganography

const SALT_KEY = "safesignal_vault_salt";

const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  "+": ".-.-.", "/": "-..-.", "=": "-...-", ":": "---...",
};

const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

// Convert Base64 string to Morse Code (preserving case via '^' prefix for lowercase)
export function encodeToMorse(text: string): string {
  return text
    .split("")
    .map((char) => {
      const isLower = char >= "a" && char <= "z";
      const upper = char.toUpperCase();
      const morse = MORSE_MAP[upper];
      if (!morse) return "";
      return isLower ? `^${morse}` : morse;
    })
    .filter(Boolean)
    .join(" ");
}

// Convert Morse Code back to original Base64 string
export function decodeFromMorse(morseText: string): string {
  return morseText
    .split(" ")
    .map((code) => {
      if (code.startsWith("^")) {
        const char = REVERSE_MORSE_MAP[code.slice(1)] || "";
        return char.toLowerCase();
      }
      return REVERSE_MORSE_MAP[code] || "";
    })
    .join("");
}

function getSalt(): Uint8Array {
  const existing = localStorage.getItem(SALT_KEY);
  if (existing) {
    return new Uint8Array(JSON.parse(existing));
  }
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)));
  return salt;
}

async function deriveKey(pin: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: getSalt(),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt plaintext with AES-256, then disguise output as Morse Code
export async function encryptNoteToMorse(
  plaintext: string,
  pin: string
): Promise<{ morseCipher: string; morseIv: string }> {
  const key = await deriveKey(pin);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );

  const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    morseCipher: encodeToMorse(cipherBase64),
    morseIv: encodeToMorse(ivBase64),
  };
}

// Decode Morse Code back to Base64, then decrypt with AES-256
export async function decryptMorseNote(
  morseCipher: string,
  morseIv: string,
  pin: string
): Promise<string> {
  const cipherBase64 = decodeFromMorse(morseCipher);
  const ivBase64 = decodeFromMorse(morseIv);

  const key = await deriveKey(pin);
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(cipherBase64), (c) =>
    c.charCodeAt(0)
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
}