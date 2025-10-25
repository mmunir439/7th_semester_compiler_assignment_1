"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* Escape HTML before injecting into code block */
function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* Skip strings/chars while scanning */
const STRING_OR_CHAR_RE = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'/g;

/* C++ operators & punctuators (longest first) */
const TOKENS = [
  ">>=", "<<=", "->*", "...",
  ".*", "->", "::", "##",
  "++", "--", "<<", ">>",
  "<=", ">=", "==", "!=",
  "&&", "||", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
  "~", "!", "+", "-", "*", "/", "%", "&", "|", "^", "=",
  "<", ">", "?", ":", ".", ",", ";", "(", ")", "{", "}", "[", "]", "#"
];

/* Which ones are treated as operators vs punctuators (for the table) */
const OPERATOR_SET = new Set([
  ">>=", "<<=", "->*", ".*", "->", "++", "--",
  "<<", ">>", "<=", ">=", "==", "!=",
  "&&", "||",
  "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
  "~", "!", "+", "-", "*", "/", "%", "&", "|", "^", "=",
  "<", ">", "?", ":", ".", // member access . and ?: counted as operators
]);

const PUNCTUATOR_SET = new Set([
  "::", "##", "...", ",", ";", "(", ")", "{", "}", "[", "]", "#"
]);

/* Build a single regex from TOKENS (longest-first) */
function escapeRegex(tok) {
  return tok.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
const TOKEN_RE = new RegExp(TOKENS.map(escapeRegex).join("|"), "g");

export default function OperatorsPhase() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState(""); // HTML
  const [found, setFound] = useState([]);             // [{value, kind, index}]
  const router = useRouter();
  // Load from previous phase and auto-run
  useEffect(() => {
    const prev = localStorage.getItem("phase5Code");
    if (prev) {
      // Load input from previous phase but do NOT auto-run recognition.
      // User should click the button to run recognition.
      setCode(prev);
    } else {
      alert("No output from previous phase found. Please complete Phase 5 first.");
      router.push("/identifiers");
    }
  }, [router]);

  function recognizeOps(input) {
    const src = typeof input === "string" ? input : code;
    // 1) Mark spans to skip (strings/chars)
    const skipSpans = [];
    for (const m of src.matchAll(STRING_OR_CHAR_RE)) {
      const start = m.index ?? 0;
      skipSpans.push([start, start + m[0].length]);
    }
    const inSkip = (pos) => skipSpans.some(([s, e]) => pos >= s && pos < e);

    // 2) Walk the code and wrap operator/punctuator tokens
    let html = "";
    let last = 0;
    const results = [];

    for (const m of src.matchAll(TOKEN_RE)) {
      const tok = m[0];
      const start = m.index ?? 0;
      const end = start + tok.length;

      // Plain text before token
      html += escapeHtml(src.slice(last, start));

      if (inSkip(start)) {
        // Don't highlight inside string/char
        html += escapeHtml(tok);
      } else {
        const kind = OPERATOR_SET.has(tok)
          ? "operator"
          : PUNCTUATOR_SET.has(tok)
          ? "punctuator"
          : "other";

        // Highlight using light-green (match other phases)
        html += `<mark class="rounded px-1" style="background:#bbf7d0;color:#064e3b;padding:0.125rem 0.25rem;border-radius:0.25rem;">${escapeHtml(
          tok
        )}</mark>`;
        results.push({ value: tok, kind, index: start });
      }

      last = end;
    }
    // Tail
    html += escapeHtml(src.slice(last));

    setHighlighted(html);
    setFound(results);
    try {
      alert("Operators recognized successfully!");
    } catch (e) {
      // ignore
    }
  }

  function goToNext() {
    localStorage.setItem("phase6Code", code);
    router.push("/"); // or your next phase route
  }

  const hasOutput = highlighted.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto transition-all">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-green-700 mb-6">Lexical Analyzer – Phase 6: Recognize Operators & Punctuators</h1>

        {/* Input + Output Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Input Box */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
            <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">Input Code (from Previous Phase)</h2>
            {code ? (
              <>
                <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words"><code>{code}</code></pre>
              </>
            ) : (
              <p className="text-gray-400 text-center">No input available</p>
            )}
          </div>

          {/* Output Box */}
          {hasOutput && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
              <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">Output (Operators Highlighted)</h2>
              <div className="flex items-center justify-center mb-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold">{found.length}</div>
              </div>
              <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
            </div>
          )}
        </div>

        {/* Recognize Button (moved outside input card) */}
        {code && !hasOutput && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => recognizeOps()}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Recognize Operators & Punctuators
            </button>
          </div>
        )}

        {/* Next Step Button (after recognition) */}
        {hasOutput && (
          <div className="flex justify-center mt-8">
            <button onClick={goToNext} className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200">Go To → Home page</button>
          </div>
        )}
      </div>
    </div>
  );
}
