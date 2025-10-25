"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WhiteSpacePhase() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const router = useRouter();

  // ✅ Load output from previous phase (Phase 1)
  useEffect(() => {
    const prevOutput = localStorage.getItem("phase1Output");
    if (prevOutput) {
      setCode(prevOutput);
    } else {
      alert("No output from previous phase found. Please complete Phase 1 first.");
      router.push("/comments");
    }
  }, [router]);

  // ✅ Remove white spaces function
  function removeWhitespace(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  // ✅ Handle button click
  function handleRemoveWhiteSpaces() {
    if (!code.trim()) {
      alert("No code available to process.");
      return;
    }
    const cleaned = removeWhitespace(code);
    setOutput(cleaned);
    setShowOutput(true);
    localStorage.setItem("phase2Output", cleaned);
    alert("White spaces removed successfully!");
  }

  // ✅ Navigate to next phase
  function goToNextPhase() {
    router.push("/constants");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto transition-all">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-green-700 mb-6">
          Lexical Analyzer – Phase 2: Remove White Spaces
        </h1>

        {/* Input + Output Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Input Box */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
            <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">
              Input Code (from Previous Phase)
            </h2>
            {code ? (
              <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words">
                <code>{code}</code>
              </pre>
            ) : (
              <p className="text-gray-400 text-center">No input available</p>
            )}
          </div>

          {/* Output Box */}
          {showOutput && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
              <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">
                Output (After Removing White Spaces)
              </h2>
              <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words">
                <code>{output}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {!showOutput && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleRemoveWhiteSpaces}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Remove White Spaces
            </button>
          </div>
        )}

        {/* Next Step Button (after removal) */}
        {showOutput && (
          <div className="flex justify-center mt-8">
            <button
              onClick={goToNextPhase}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Next Step → Recognize Constants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
