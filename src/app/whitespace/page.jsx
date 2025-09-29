"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Phase2() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const router = useRouter();

  // Load Phase1 output
  useEffect(() => {
    const prev = localStorage.getItem("phase1Output");
    if (prev) setCode(prev);
  }, []);

  function removeWhitespace(text) {
    // collapse spaces/tabs/newlines into a single space and trim ends
    return text.replace(/\s+/g, " ").trim();
  }

  function handleRemove() {
    setOutput(removeWhitespace(code));
  }

  function goToNextPhase() {
    if (output) {
      localStorage.setItem("phase2Output", output);
      router.push("/constants");
    } else {
      alert("Please click “Remove White Space” first.");
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
        <h1 className="text-white font-semibold text-lg md:text-xl mb-3">
          Phase 2: Remove White Space
        </h1>
        <textarea
          className="w-full min-h-[200px] md:min-h-[280px] lg:min-h-[320px] 
                     bg-gray-800 text-green-200 rounded p-3 font-mono text-sm 
                     resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRemove}
            className="px-4 py-2 rounded bg-emerald-500 text-white 
                       hover:bg-emerald-600 transition"
          >
            Remove White Space
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="p-4 bg-green-300 rounded-lg shadow-lg">
        <h2 className="font-semibold text-lg mb-2">Output</h2>
        {output ? (
          <pre className="bg-green-600 rounded p-3 text-white overflow-x-auto text-sm md:text-base">
            <code>{output}</code>
          </pre>
        ) : (
          <p className="text-gray-700">
            Click “Remove White Space” to see the cleaned program.
          </p>
        )}
      </div>

      {/* Sticky Footer */}
      {output && (
        <div className="fixed bottom-0 inset-x-0 z-50 
                        border-t border-yellow-600 bg-yellow-500/95 
                        backdrop-blur shadow-lg">
          <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={goToNextPhase}
              className="w-full sm:w-auto px-6 py-2 rounded 
                         bg-blue-600 text-white font-medium 
                         hover:bg-blue-700 transition"
            >
              Next Phase → Recognize Constants
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
