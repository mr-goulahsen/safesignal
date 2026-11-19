"use client";

import React, { useState } from "react";

interface DecoyCalculatorProps {
  onUnlock: () => void;
}

export default function DecoyCalculator({ onUnlock }: DecoyCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  // Secret PIN to unlock the hidden vault
  const SECRET_PIN = "1337";

  const handleNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setPreviousValue(parseFloat(display));
    setOperator(op);
    setWaitingForNewValue(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const handleEquals = () => {
    // Check if the secret PIN was entered before pressing '='
    if (display === SECRET_PIN && previousValue === null) {
      handleClear();
      onUnlock();
      return;
    }

    if (operator && previousValue !== null) {
      const current = parseFloat(display);
      let result = 0;
      if (operator === "+") result = previousValue + current;
      if (operator === "-") result = previousValue - current;
      if (operator === "×") result = previousValue * current;
      if (operator === "÷") result = current !== 0 ? previousValue / current : 0;

      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForNewValue(true);
    }
  };

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-800">
        {/* Calculator Display */}
        <div className="text-right text-white text-5xl font-light mb-6 px-2 overflow-hidden truncate">
          {display}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-3">
          {buttons.flat().map((btn) => {
            const isZero = btn === "0";
            const isOperator = ["÷", "×", "-", "+", "="].includes(btn);
            const isTop = ["C", "±", "%"].includes(btn);

            return (
              <button
                key={btn}
                onClick={() => {
                  if (btn === "C") handleClear();
                  else if (btn === "=") handleEquals();
                  else if (["÷", "×", "-", "+"].includes(btn)) handleOperator(btn);
                  else if (btn === "±") setDisplay(String(parseFloat(display) * -1));
                  else if (btn === "%") setDisplay(String(parseFloat(display) / 100));
                  else handleNumber(btn);
                }}
                className={`${isZero ? "col-span-2 text-left pl-7" : "text-center"} 
                  h-16 rounded-full text-2xl font-medium transition active:scale-95
                  ${isOperator ? "bg-amber-500 text-white hover:bg-amber-400" : ""}
                  ${isTop ? "bg-zinc-400 text-black hover:bg-zinc-300" : ""}
                  ${!isOperator && !isTop ? "bg-zinc-800 text-white hover:bg-zinc-700" : ""}
                `}
              >
                {btn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}