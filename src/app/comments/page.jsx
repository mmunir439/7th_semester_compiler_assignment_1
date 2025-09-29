"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Phase1() {
  const [source, setSource] = useState(`#include <iostream>
using namespace std;

int main() {
   int x=5;
    cout << "hi" << endl;   // print hi
    cout<<x*x<<endl;
    return 0;
}
/* end */`);

  const [output, setOutput] = useState("");
  const router = useRouter();

  function removeComments(text) {
    const noBlock = text.replace(/\/\*[\s\S]*?\*\//g, "");
    const noLine = noBlock.replace(/(^|\s)\/\/.*$/gm, (m) =>
      m.startsWith("//") ? "" : m.replace(/\/\/.*$/, "")
    );
    return noLine.trimEnd();
  }

  function handleRemove() {
    const cleaned = removeComments(source);
    setOutput(cleaned);
  }

  function goToNextPhase() {
    if (output) {
      localStorage.setItem("phase1Output", output);
      router.push("/whitespace");
    } else {
      alert("Please remove comments first before going to next phase!");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <div className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-6">
        {/* Header */}
        <h1 className="text-lg sm:text-xl md:text-2xl text-white font-semibold mb-4">
          Phase 1: Remove Comments
        </h1>

        {/* Input Box */}
        <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
          <textarea
            className="w-full h-56 sm:h-64 md:h-72 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm sm:text-base resize-y"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <button
            onClick={handleRemove}
            className="mt-3 w-full sm:w-auto px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition"
          >
            Remove Comments
          </button>
        </div>

        {/* Output Box */}
        <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
          <h2 className="font-semibold text-gray-900 mb-2">Output</h2>
          {output ? (
            <pre className="bg-green-600 rounded p-3 text-white text-xs sm:text-sm overflow-x-auto">
              <code>{output}</code>
            </pre>
          ) : (
            <p className="text-gray-700 text-sm">No output yet</p>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      {output && (
        <div className="sticky bottom-0 inset-x-0 z-50 border-t border-yellow-600 bg-yellow-500/95 backdrop-blur">
          <div className="mx-auto max-w-4xl px-3 sm:px-6 py-3 flex justify-center sm:justify-end">
            <button
              onClick={goToNextPhase}
              className="w-full sm:w-auto px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90 transition"
            >
              Next Phase → Remove White Space
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
