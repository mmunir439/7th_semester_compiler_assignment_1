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
    // save output to localStorage so phase2 can read it
    if (output) {
      localStorage.setItem("phase1Output", output);
      router.push("/whitespace");
    } else {
      alert("Please remove comments first before going to next phase!");
    }
  }

  return (
    <>
      <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
        <h1 className="text-white font-semibold">Phase 1: Remove Comments</h1>
        <textarea
          className="w-full h-56 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <button
          onClick={handleRemove}
          className="mt-2 px-4 py-2 rounded bg-emerald-500 text-white"
        >
          Remove Comments
        </button>
      </div>

      <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
        <h2 className="font-semibold">Output</h2>
        {output ? (
          <pre className="bg-green-600 rounded p-3 text-white">
            <code>{output}</code>
          </pre>
        ) : (
          <p className="text-gray-700">No output yet</p>
        )}
      </div>

      {/* Footer navigation button - only show when Phase 1 is done */}
{output && (
  <div className="inset-x-0 z-50 border-t border-yellow-600 bg-yellow-500/90 backdrop-blur">
    <div className="mx-auto max-w-4xl px-4 py-3 flex justify-end">
      <button
        onClick={goToNextPhase}
        className="px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90"
      >
        Next Phase → Remove White Space
      </button>
    </div>
  </div>
)}

    </>
  );
}
