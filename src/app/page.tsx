"use client";

import React, { useState, useEffect } from "react";
import DecoyCalculator from "../components/DecoyCalculator";
import { encryptNoteToMorse, decryptMorseNote } from "../utils/crypto";
import {
  ShieldAlert,
  Lock,
  Plus,
  Trash2,
  Radio,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

interface MorseEncryptedRecord {
  id: string;
  timestamp: string;
  morseCipher: string;
  morseIv: string;
}

interface VaultRecord {
  id: string;
  timestamp: string;
  content: string;
  morseCipher: string;
}

const STORAGE_KEY = "safesignal_morse_vault";
const VAULT_PIN = "1337";

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [stealthMorseView, setStealthMorseView] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Instant Panic Exit via ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsUnlocked(false);
        setRecords([]);
        setSosActive(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load and decrypt stored Morse-encoded AES-256 records
  useEffect(() => {
    if (!isUnlocked) return;

    const loadVault = async () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setRecords([]);
        return;
      }

      try {
        const encryptedList: MorseEncryptedRecord[] = JSON.parse(raw);
        const decryptedList: VaultRecord[] = [];

        for (const item of encryptedList) {
          const text = await decryptMorseNote(
            item.morseCipher,
            item.morseIv,
            VAULT_PIN
          );
          decryptedList.push({
            id: item.id,
            timestamp: item.timestamp,
            content: text,
            morseCipher: item.morseCipher,
          });
        }
        setRecords(decryptedList);
      } catch (err) {
        console.error("Decryption failed:", err);
      }
    };

    loadVault();
  }, [isUnlocked]);

  // Silent SOS Morse Code Beacon (... --- ...) using Web Audio API
  const triggerSosSignal = () => {
    if (sosActive) return;
    setSosActive(true);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      // SOS pattern in ms: S (...), O (---), S (...)
      const pattern = [150, 100, 150, 100, 150, 300, 450, 100, 450, 100, 450, 300, 150, 100, 150, 100, 150];
      let time = ctx.currentTime;

      pattern.forEach((duration, idx) => {
        if (idx % 2 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = 880;
          gain.gain.value = 0.15;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + duration / 1000);
        }
        time += duration / 1000;
      });

      setTimeout(() => setSosActive(false), 3800);
    } catch {
      setTimeout(() => setSosActive(false), 3000);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    setIsEncrypting(true);
    try {
      const { morseCipher, morseIv } = await encryptNoteToMorse(
        noteInput.trim(),
        VAULT_PIN
      );
      const newRecord: MorseEncryptedRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        morseCipher,
        morseIv,
      };

      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const existingList: MorseEncryptedRecord[] = existingRaw
        ? JSON.parse(existingRaw)
        : [];
      const updatedList = [newRecord, ...existingList];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

      setRecords((prev) => [
        {
          id: newRecord.id,
          timestamp: newRecord.timestamp,
          content: noteInput.trim(),
          morseCipher,
        },
        ...prev,
      ]);
      setNoteInput("");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    if (existingRaw) {
      const existingList: MorseEncryptedRecord[] = JSON.parse(existingRaw);
      const filtered = existingList.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuickExit = () => {
    setRecords([]);
    setSosActive(false);
    setIsUnlocked(false);
  };

  if (!isUnlocked) {
    return <DecoyCalculator onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl">
            <ShieldAlert />
            <span>SafeSignal Vault</span>
          </div>
          <button
            onClick={handleQuickExit}
            className="flex items-center gap-1 bg-red-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
          >
            <Lock size={16} />
            Quick Exit
          </button>
        </div>

        {/* Security & Morse Steganography Status */}
        <div className="bg-slate-900/60 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <Radio size={16} />
              <span>AES-256 + Morse Steganography</span>
            </div>
            <button
              type="button"
              onClick={() => setStealthMorseView(!stealthMorseView)}
              className="morse-toggle-btn flex items-center gap-1"
            >
              {stealthMorseView ? <Eye size={14} /> : <EyeOff size={14} />}
              {stealthMorseView ? "Show Plaintext" : "Morse Mask"}
            </button>
          </div>
          <p className="text-slate-300 text-sm">
            Data is encrypted with AES-256 and disguised as Morse signals (
            <code>.- / -...</code>). Press <kbd>ESC</kbd> for instant exit.
          </p>
        </div>

        {/* SOS Morse Beacon Button */}
        <button
          type="button"
          onClick={triggerSosSignal}
          className={`sos-btn flex items-center justify-center gap-2 ${
            sosActive ? "sos-active" : ""
          }`}
        >
          <AlertTriangle size={18} />
          {sosActive
            ? "Transmitting SOS (... --- ...)..."
            : "Emit Silent SOS Morse Signal (... --- ...)"}
        </button>

        {/* Add Encrypted Evidence Form */}
        <form onSubmit={handleSaveEvidence} className="space-y-3">
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Write incident notes... They will be encrypted & disguised in Morse code."
            rows={3}
            className="vault-textarea"
          />
          <button
            type="submit"
            disabled={isEncrypting || !noteInput.trim()}
            className="vault-submit-btn flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {isEncrypting ? "Encoding to Morse..." : "Encrypt & Disguise as Morse"}
          </button>
        </form>

        {/* Decrypted / Morse-Masked Entries List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">
            Stored Signals ({records.length})
          </h2>

          {records.length === 0 ? (
            <p className="text-slate-300 text-sm bg-slate-900/60 p-4 rounded-xl text-center">
              No signals logged yet.
            </p>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/60 p-4 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400">
                    {rec.timestamp}
                  </span>
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="text-slate-300 hover:text-red-400 transition"
                    title="Delete signal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {stealthMorseView ? (
                  <p className="morse-code-text">{rec.morseCipher}</p>
                ) : (
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {rec.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}