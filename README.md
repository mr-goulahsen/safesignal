# SafeSignal — Zero-Knowledge Evidence Vault & Morse Steganography Platform.

> **Built for SafeSpace Hacks** | *Privacy-First Safety Architecture for Domestic Violence Survivors*

**SafeSignal** is a covert, client-side encrypted evidence locker disguised as a fully functional standard calculator. Engineered with **Zero-Knowledge Architecture**, **AES-256-GCM cryptography**, and **Morse Code Steganography**, it empowers individuals in high-risk environments to document incidents, emit silent distress beacons, and vanish from view in milliseconds.

;

## The Problem:
Survivors of domestic abuse often face severe device surveillance, coerced passcodes, and lack of secure channels to document evidence for legal or emergency intervention. Traditional "safety apps" are easily spotted on a home screen, putting the user in immediate danger if discovered.


## The Solution:
SafeSignal eliminates visual and forensic red flags through **Defense-in-Depth Plausible Deniability**:
1. **Functional Decoy Interface:** Opens as a responsive, working calculator. Performing standard arithmetic works seamlessly.
2. **Secret PIN Trigger:** Entering a custom numeric PIN (`1337` + `=`) unlocks the hidden cryptographic vault without leaving browser history traces or separate URLs.
3. **Hybrid Encryption + Steganography:** Incident logs are encrypted locally using **PBKDF2 + AES-256-GCM**, then encoded into **International Morse Code (`.- / -...`)** before touching `localStorage` disguising high-entropy ciphertext as benign radio/telegraph practice data.
4. **Instant Panic Exit (`ESC` / Quick Exit):** Wipes decrypted plaintext from volatile memory (RAM) and immediately reverts the UI to the calculator screen.
5. **Silent SOS Audio Beacon:** Synthesizes an authentic `... --- ...` (SOS) acoustic signal via the **Web Audio API** for covert emergency signaling when speech is unsafe.


## Security Architecture:
SafeSignal operates under a strict **Zero-Knowledge, Client-Side Only** threat model. No servers, no cloud databases, and no third-party analytics ever receive user data.

