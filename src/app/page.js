"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function CommentsPage() {
  const router = useRouter();

  function step1() {
    router.push("/comments");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Name: Muhammad Munir Reg: 4567/FOC/BSCS/F22A
        </h1>
        <p className="font-bold text-gray-800 mb-4">Lexical Analyzer Phase that produces the lexeme tokens pairs</p>

        <p className="text-gray-600 mb-6 text-lg">
          Lexical Analyzer has 7 steps:
        </p>

        <ul className="text-left list-decimal list-inside space-y-2 text-gray-700 text-base md:text-lg">
          <li>Remove Comments</li>
          <li>Remove White Spaces</li>
          <li>Recognition of Constants</li>
          <li>Recognition of Keywords</li>
          <li>Recognition of Identifiers</li>
          <li>Recognizes Operators</li>
          <li>Correlates Error Messages with the Source Program</li>
        </ul>

        <button
          onClick={step1}
          className="mt-8 px-6 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-xl shadow-md transition duration-300 ease-in-out"
        >
          Go to Step 1
        </button>
      </div>
    </div>
  );
}
