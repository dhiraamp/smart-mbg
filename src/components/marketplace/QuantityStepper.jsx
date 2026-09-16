import React from "react";
import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({ qty, onDec, onInc, max, disabled }) {
  const btn = "w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40";
  return (
    <div className={`flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white ${disabled ? "opacity-50" : ""}`}>
      <button onClick={onDec} disabled={disabled || qty <= 1} className={btn} aria-label="Kurangi">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-9 text-center text-xs font-bold text-gray-900">{qty}</span>
      <button onClick={onInc} disabled={disabled || qty >= (max || 999)} className={btn} aria-label="Tambah">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
