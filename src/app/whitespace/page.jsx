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
    // save output so phase3 can read it
    if (output) {
      localStorage.setItem("phase2Output", output);
      router.push("/constants");
    } else {
      alert("Please click “Remove White Space” first.");
    }
  }

  return (
    <>
      <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
        <h1 className="text-white font-semibold">Phase 2: Remove White Space</h1>
        <textarea
          className="w-full h-56 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={handleRemove}
          className="mt-2 px-4 py-2 rounded bg-emerald-500 text-white"
        >
          Remove White Space
        </button>
      </div>

      <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
        <h2 className="font-semibold">Output</h2>
        {output ? (
          <pre className="bg-green-600 rounded p-3 text-white">
            <code>{output}</code>
          </pre>
        ) : (
          <p className="text-gray-700">Click “Remove White Space” to see the cleaned program.</p>
        )}
      </div>

      {/* SAME fixed footer behavior as your Phase 1 */}
      {output && (
        <div className="inset-x-0 z-50 border-t border-yellow-600 bg-yellow-500/90 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-3 flex justify-end">
            <button
              onClick={goToNextPhase}
              className="px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90"
            >
              Next Phase → Recognize Constants
            </button>
          </div>
        </div>
      )}
    </>
  );
}
