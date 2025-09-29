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

  // Load from previous phase
  useEffect(() => {
    const prev = localStorage.getItem("phase5Code");
    if (prev) setCode(prev);
  }, []);

  function recognizeOps() {
    // 1) Mark spans to skip (strings/chars)
    const skipSpans = [];
    for (const m of code.matchAll(STRING_OR_CHAR_RE)) {
      const start = m.index ?? 0;
      skipSpans.push([start, start + m[0].length]);
    }
    const inSkip = (pos) => skipSpans.some(([s, e]) => pos >= s && pos < e);

    // 2) Walk the code and wrap operator/punctuator tokens
    let html = "";
    let last = 0;
    const results = [];

    for (const m of code.matchAll(TOKEN_RE)) {
      const tok = m[0];
      const start = m.index ?? 0;
      const end = start + tok.length;

      // Plain text before token
      html += escapeHtml(code.slice(last, start));

      if (inSkip(start)) {
        // Don't highlight inside string/char
        html += escapeHtml(tok);
      } else {
        const kind = OPERATOR_SET.has(tok)
          ? "operator"
          : PUNCTUATOR_SET.has(tok)
          ? "punctuator"
          : "other";

        // Highlight (amber)
        html += `<mark class="rounded px-1" style="background:#f59e0b;">${escapeHtml(
          tok
        )}</mark>`;
        results.push({ value: tok, kind, index: start });
      }

      last = end;
    }
    // Tail
    html += escapeHtml(code.slice(last));

    setHighlighted(html);
    setFound(results);
  }

  function goToNext() {
    localStorage.setItem("phase6Code", code);
    router.push("/"); // or your next phase route
  }

  const hasOutput = highlighted.length > 0;

  return (
    <>
      {/* Top card */}
      <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
        <h1 className="text-white font-semibold">Phase 6: Recognize Operators & Punctuators</h1>
        <textarea
          className="w-full h-56 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={recognizeOps}
          className="mt-2 px-4 py-2 rounded bg-purple-600 text-white"
        >
          Recognize Operators & Punctuators
        </button>
      </div>

      {/* Output card */}
      <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
        <h2 className="font-semibold">Output</h2>
        {hasOutput ? (
          <pre className="bg-green-600 rounded p-3 text-white text-sm overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        ) : (
          <p className="text-gray-700">Click the button to highlight operators & punctuators.</p>
        )}
      </div>

      {/* Summary table */}
      {hasOutput && (
        <div className="mt-4 p-4 bg-green-500 rounded-lg shadow border overflow-x-auto">
          <h3 className="font-semibold mb-2">
            Detected tokens ({found.length})
          </h3>
          {found.length === 0 ? (
            <p className="text-gray-600">No operators or punctuators found.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Token</th>
                  <th className="py-2 pr-4">Kind</th>
                  <th className="py-2 pr-4">Index</th>
                </tr>
              </thead>
              <tbody>
                {found.map((t, i) => (
                  <tr key={`${t.value}-${t.index}-${i}`} className="border-b">
                    <td className="py-2 pr-4">{i + 1}</td>
                    <td className="py-2 pr-4 font-mono">{t.value}</td>
                    <td className="py-2 pr-4 capitalize">{t.kind}</td>
                    <td className="py-2 pr-4">{t.index}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SAME fixed footer behavior */}
      {hasOutput && (
        <div className="inset-x-0 z-50 border-t border-yellow-600 bg-yellow-500/90 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-3 flex justify-end">
            <button
              onClick={goToNext}
              className="px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90"
            >
              Go To → Home page
            </button>
          </div>
        </div>
      )}
    </>
  );
}
