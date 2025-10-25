"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const TOKEN_RE =
  /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'|0x[0-9A-Fa-f]+|0b[01]+|0[0-7]+|(?:\d+\.\d*|\.\d+)(?:[eE][+\-]?\d+)?[fFlL]?|\d+(?:[eE][+\-]?\d+)[fFlL]?|\b\d+\b|\btrue\b|\bfalse\b/g;

function classify(tok) {
  // Treat empty single-quote literal as invalid/unknown (don't treat as string/char)
  if (tok === "''") return "unknown";
  if (/^"(?:\\.|[^"\\])*"$/.test(tok)) return "string";
  if (/^'(?:\\.|[^'\\])'$/.test(tok)) return "char";
  if (/^0x[0-9A-Fa-f]+$/.test(tok)) return "hex-int";
  if (/^0b[01]+$/.test(tok)) return "bin-int";
  if (/^0[0-7]+$/.test(tok)) return "oct-int";
  if (
    /^(?:\d+\.\d*|\.\d+)(?:[eE][+\-]?\d+)?[fFlL]?$/.test(tok) ||
    /^\d+(?:[eE][+\-]?\d+)[fFlL]?$/.test(tok)
  )
    return "float";
  if (/^\d+$/.test(tok)) return "dec-int";
  if (/^(true|false)$/.test(tok)) return "bool";
  return "unknown";
}

export default function Phase3() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [constants, setConstants] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const prev = localStorage.getItem("phase2Output");
    if (prev) {
      // Load input from previous phase but do NOT auto-run recognition.
      // User will click the button to run recognition.
      setCode(prev);
    } else {
      alert("No output from previous phase found. Please complete Phase 2 first.");
      router.push("/whitespace");
    }
  }, [router]);

  function recognizeConstants(input) {
    const src = typeof input === "string" ? input : code;
    const found = [];
    let html = "";
    let last = 0;

    // Detect character-range patterns like `'a'..'z'` and avoid treating the
    // quoted chars inside ranges as constants.
    const RANGE_RE = /'([^'\\]|\\.)'\s*\.{2}\s*'([^'\\]|\\.)'/g;
    const skipStarts = new Set();
    for (const r of src.matchAll(RANGE_RE)) {
      const base = r.index ?? 0;
      const segment = r[0];
      const innerRE = /'([^'\\]|\\.)'/g;
      let im;
      while ((im = innerRE.exec(segment)) !== null) {
        skipStarts.add(base + im.index);
      }
    }

    for (const m of src.matchAll(TOKEN_RE)) {
      const tok = m[0];
      const start = m.index ?? 0;
      const end = start + tok.length;
      let type = classify(tok);
      const isRangeChar = skipStarts.has(start);

      html += escapeHtml(src.slice(last, start));
      if (type !== "unknown" && !isRangeChar) {
        found.push({ value: tok, type, index: start });
        // light green highlight for constants
        html += `<mark class="rounded px-1" style="background:#bbf7d0;color:#064e3b;padding:0.125rem 0.25rem;border-radius:0.25rem;">${escapeHtml(
          tok
        )}</mark>`;
      } else {
        html += escapeHtml(tok);
      }
      last = end;
    }
    html += escapeHtml(src.slice(last));

    setHighlighted(html);
    setConstants(found);
    // Notify user after recognition
    try {
      alert("Constants recognized successfully!");
    } catch (e) {
      // ignore
    }
  }

  function goToKeywords() {
    localStorage.setItem("phase3Code", code);
    router.push("/keywords");
  }

  const hasOutput = highlighted.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto transition-all">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-green-700 mb-6">
          Lexical Analyzer – Phase 3: Recognize Constants
        </h1>

        {/* Input + Output Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Input Box */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
            <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">Input Code (from Previous Phase)</h2>
            {code ? (
              <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words"><code>{code}</code></pre>
            ) : (
              <p className="text-gray-400 text-center">No input available</p>
            )}
          </div>

          {/* Output Box */}
          {hasOutput && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 shadow-sm min-h-[250px] overflow-auto max-h-[400px]">
              <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">Output (Constants Highlighted)</h2>
              <div className="flex items-center justify-center mb-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold">
                  {constants.length}
                </div>
              </div>
              <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words">
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
            </div>
          )}
        </div>

        {/* Recognize Button (outside input card) */}
        {!hasOutput && code && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => recognizeConstants()}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Recognize Constants
            </button>
          </div>
        )}

        {/* Next Step Button (after recognition) */}
        {hasOutput && (
          <div className="flex justify-center mt-8">
            <button
              onClick={goToKeywords}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Next Step → Recognize Keywords
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
