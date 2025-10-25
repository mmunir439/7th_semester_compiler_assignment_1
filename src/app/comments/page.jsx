"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [healthData, setHealthData] = useState("");
  const [processedData, setProcessedData] = useState("");
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // --- CFG-like rules for comments ---
  const CFG = [
    { type: "single-line", pattern: /\/\/[^\n]*/g },
    { type: "multi-line", pattern: /\/\*[\s\S]*?\*\//g },
  ];

  // Handle file selection
  function handleFilePick() {
    fileInputRef.current?.click();
  }

  // Read file content
  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        setHealthData(text);
        setIsFileLoaded(true);
        setShowOutput(false); // Hide output on new upload
      } catch (err) {
        console.error("Failed to read file", err);
        alert("Failed to read file");
      }
    }
    e.target.value = null;
  }

  // Remove comments using CFG patterns
  function handleRemoveComments() {
    if (!healthData) return;
    let updatedCode = healthData;
    CFG.forEach(rule => {
      updatedCode = updatedCode.replace(rule.pattern, "");
    });
    const trimmed = updatedCode.trim();
    setProcessedData(trimmed);
    // Persist Phase 1 output so next phase can read it
    try {
      localStorage.setItem("phase1Output", trimmed);
    } catch (e) {
      // localStorage may be unavailable in some environments; log but continue
      console.warn("Unable to persist phase1 output to localStorage", e);
    }
    setShowOutput(true);
    alert("Comments removed successfully!");
  }

  // Navigate to next step (Remove White Spaces)
  function goToNextStep() {
    router.push("/whitespace");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto transition-all">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-green-700 mb-6">
          Lexical Analyzer – Remove Comments
        </h1>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".kt,.kts,.txt"
        />

        {/* Upload / Change File Buttons */}
        <div className="flex justify-center mb-5">
          {!isFileLoaded ? (
            <button
              onClick={handleFilePick}
              className="px-6 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Upload  File
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Change File
            </button>
          )}
        </div>

        {/* Input + Output Boxes */}
        {isFileLoaded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Input Box */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
              <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">
                Input File Content
              </h2>
              {healthData ? (
                <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words">
                  <code>{healthData}</code>
                </pre>
              ) : (
                <p className="text-gray-400 text-center">No file loaded</p>
              )}
            </div>

            {/* Output Box (only visible after clicking Remove Comments) */}
            {showOutput && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
                <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">
                  Output (After Removing Comments)
                </h2>
                {processedData ? (
                  <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words">
                    <code>{processedData}</code>
                  </pre>
                ) : (
                  <p className="text-gray-400 text-center">No output available</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Remove Comments Button */}
        {isFileLoaded && !showOutput && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleRemoveComments}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Remove Comments
            </button>
          </div>
        )}

        {/* Next Step Button (visible after comments removed) */}
        {showOutput && (
          <div className="flex justify-center mt-8">
            <button
              onClick={goToNextStep}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Next Step → go to Remove White Spaces
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
