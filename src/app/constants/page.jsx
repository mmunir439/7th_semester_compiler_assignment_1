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
    if (prev) setCode(prev);
  }, []);

  function recognizeConstants() {
    const found = [];
    let html = "";
    let last = 0;

    for (const m of code.matchAll(TOKEN_RE)) {
      const tok = m[0];
      const start = m.index ?? 0;
      const end = start + tok.length;
      const type = classify(tok);

      html += escapeHtml(code.slice(last, start));
      if (type !== "unknown") {
        found.push({ value: tok, type, index: start });
        html += `<mark class="rounded px-1" style="background:#fdd835;">${escapeHtml(
          tok
        )}</mark>`;
      } else {
        html += escapeHtml(tok);
      }
      last = end;
    }
    html += escapeHtml(code.slice(last));

    setHighlighted(html);
    setConstants(found);
  }

  function goToKeywords() {
    localStorage.setItem("phase3Code", code);
    router.push("/keywords");
  }

  const hasOutput = highlighted.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <div className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-6">
        {/* Header */}
        <h1 className="text-lg sm:text-xl md:text-2xl text-white font-semibold mb-4">
          Phase 3: Recognize Constants
        </h1>

        {/* Input Box */}
        <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
          <textarea
            className="w-full h-56 sm:h-64 md:h-72 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm sm:text-base resize-y"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            onClick={recognizeConstants}
            className="mt-3 w-full sm:w-auto px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Recognize Constants
          </button>
        </div>

        {/* Output Box */}
        <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
          <h2 className="font-semibold text-gray-900 mb-2">Output</h2>
          {hasOutput ? (
            <pre className="bg-green-600 rounded p-3 text-white text-xs sm:text-sm overflow-x-auto">
              <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          ) : (
            <p className="text-gray-700 text-sm">
              Click “Recognize Constants” to see the result.
            </p>
          )}
        </div>

        {/* Constants Summary */}
        {hasOutput && (
          <div className="mt-4 p-4 bg-green-300 rounded-lg shadow border overflow-x-auto">
            <h3 className="font-semibold mb-2">
              Detected constants ({constants.length})
            </h3>
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Value</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Index</th>
                </tr>
              </thead>
              <tbody>
                {constants.map((c, i) => (
                  <tr
                    key={`${c.value}-${c.index}-${i}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-2 pr-4">{i + 1}</td>
                    <td className="py-2 pr-4 font-mono">{c.value}</td>
                    <td className="py-2 pr-4">{c.type}</td>
                    <td className="py-2 pr-4">{c.index}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      {hasOutput && (
        <div className="sticky bottom-0 inset-x-0 z-50 border-t border-yellow-600 bg-yellow-500/95 backdrop-blur">
          <div className="mx-auto max-w-4xl px-3 sm:px-6 py-3 flex justify-center sm:justify-end">
            <button
              onClick={goToKeywords}
              className="w-full sm:w-auto px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90 transition"
            >
              Next Phase → Recognize Keywords
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
