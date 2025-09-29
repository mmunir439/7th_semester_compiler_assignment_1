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

// Ordered: strings & chars first so inner quotes don't break later matches
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
  ) return "float";
  if (/^\d+$/.test(tok)) return "dec-int";
  if (/^(true|false)$/.test(tok)) return "bool";
  return "unknown";
}

export default function Phase3() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState(""); // HTML string
  const [constants, setConstants] = useState([]);     // [{value,type,index}]
  const router = useRouter();

  // Load output from Phase 2
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
    // keep current code (optional) or the highlighted result for next phase
    localStorage.setItem("phase3Code", code);
    router.push("/keywords"); // create this page next
  }

  const hasOutput = highlighted.length > 0; // mirror Phase 1 “Output” gating

  return (
    <>
      {/* Top card (same layout as Phase 1) */}
      <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
        <h1 className="text-white font-semibold">Phase 3: Recognize Constants</h1>
        <textarea
          className="w-full h-56 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={recognizeConstants}
          className="mt-2 px-4 py-2 rounded bg-purple-600 text-white"
        >
          Recognize Constants
        </button>
      </div>

      {/* Output card (same green style as Phase 1) */}
      <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
        <h2 className="font-semibold">Output</h2>
        {hasOutput ? (
          <pre className="bg-green-600 rounded p-3 text-white text-sm overflow-x-auto">
            {/* show the code with constants highlighted */}
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        ) : (
          <p className="text-gray-700">Click “Recognize Constants” to see the result.</p>
        )}
      </div>

      {/* Optional: a compact constants summary under the Output card (keeps Phase 1’s feel) */}
      {hasOutput && (
        <div className="mt-4 p-4 bg-green-300 rounded-lg shadow border overflow-x-auto">
          <h3 className="font-semibold mb-2">Detected constants ({constants.length})</h3>
          <table className="min-w-full text-sm">
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
                <tr key={`${c.value}-${c.index}-${i}`} className="border-b">
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

      {/* SAME fixed footer behavior as Phase 1: show only when we have “Output” */}
      {hasOutput && (
        <div className="inset-x-0 z-50 border-t border-yellow-600 bg-yellow-500/90 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-3 flex justify-end">
            <button
              onClick={goToKeywords}
              className="px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90"
            >
              Next Phase → Recognize Keywords
            </button>
          </div>
        </div>
      )}
    </>
  );
}
