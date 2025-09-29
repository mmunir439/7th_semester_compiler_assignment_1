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

/* Same C++ keyword set used in /keywords (keep in sync) */
const CPP_KEYWORDS = new Set([
  "auto","bool","char","char16_t","char32_t","char8_t","double","float","int","long","short",
  "signed","unsigned","void","wchar_t","decltype","nullptr_t",
  "extern","mutable","register","static","thread_local","volatile","const",
  "break","case","continue","default","do","else","for","goto","if","return","switch","while",
  "class","struct","union","enum","template","typename","using","namespace",
  "inline","virtual","explicit","friend","operator","this","new","delete",
  "try","catch","throw","noexcept",
  "const_cast","static_cast","dynamic_cast","reinterpret_cast",
  "true","false","nullptr",
  "sizeof","typeid","alignof","alignas","constexpr","consteval","constinit",
  "export","import","requires","concept","co_await","co_yield","co_return"
]);

/* Regex helpers */
const STRING_OR_CHAR_RE = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'/g;     // skip strings/chars
const IDENT_RE = /[A-Za-z_][A-Za-z0-9_]*/g;                          // C/C++ identifier

export default function IdentifiersPhase() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState(""); // HTML
  const [idents, setIdents] = useState([]);           // [{name,index}]
  const router = useRouter();

  // Load from previous phase
  useEffect(() => {
    const prev = localStorage.getItem("phase4Code");
    if (prev) setCode(prev);
  }, []);

  function recognizeIdentifiers() {
    // 1) Find string/char literal spans so we can skip identifiers inside them
    const skipSpans = [];
    for (const m of code.matchAll(STRING_OR_CHAR_RE)) {
      const start = m.index ?? 0;
      skipSpans.push([start, start + m[0].length]);
    }

    // Utility: check if position is inside any skip span
    const inSkip = (pos) => skipSpans.some(([s, e]) => pos >= s && pos < e);

    // 2) Scan for identifiers and exclude keywords; also skip inside strings/chars
    let html = "";
    let last = 0;
    const found = [];

    for (const m of code.matchAll(IDENT_RE)) {
      const name = m[0];
      const start = m.index ?? 0;
      const end = start + name.length;

      // Append plain text before this identifier
      html += escapeHtml(code.slice(last, start));

      // Skip if inside a string/char literal
      if (inSkip(start)) {
        html += escapeHtml(name);
        last = end;
        continue;
      }

      // Skip keywords (we highlighted them in previous phase)
      if (CPP_KEYWORDS.has(name)) {
        html += escapeHtml(name);
        last = end;
        continue;
      }

      // Otherwise, treat as identifier
      found.push({ name, index: start });
      html += `<mark class="rounded px-1" style="background:#60a5fa;">${escapeHtml(
        name
      )}</mark>`;
      last = end;
    }

    // Tail
    html += escapeHtml(code.slice(last));

    setHighlighted(html);
    setIdents(found);
  }

  function goToNext() {
    // Save code for the next phase (operators or whatever you name it)
    localStorage.setItem("phase5Code", code);
    router.push("/operators"); // create this page next (or rename)
  }

  const hasOutput = highlighted.length > 0;

  return (
    <>
      {/* Top card (same layout as earlier phases) */}
      <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
        <h1 className="text-white font-semibold">Phase 5: Recognize Identifiers</h1>
        <textarea
          className="w-full h-56 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={recognizeIdentifiers}
          className="mt-2 px-4 py-2 rounded bg-purple-600 text-white"
        >
          Recognize Identifiers
        </button>
      </div>

      {/* Output card (same green style as before) */}
      <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
        <h2 className="font-semibold">Output</h2>
        {hasOutput ? (
          <pre className="bg-green-600 rounded p-3 text-white text-sm overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        ) : (
          <p className="text-gray-700">Click “Recognize Identifiers” to see the result.</p>
        )}
      </div>

      {/* Summary table */}
      {hasOutput && (
        <div className="mt-4 p-4 bg-green-500 rounded-lg shadow border overflow-x-auto">
          <h3 className="font-semibold mb-2">Detected identifiers ({idents.length})</h3>
          {idents.length === 0 ? (
            <p className="text-gray-600">No identifiers found.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Identifier</th>
                  <th className="py-2 pr-4">Index</th>
                </tr>
              </thead>
              <tbody>
                {idents.map((it, i) => (
                  <tr key={`${it.name}-${it.index}-${i}`} className="border-b">
                    <td className="py-2 pr-4">{i + 1}</td>
                    <td className="py-2 pr-4 font-mono">{it.name}</td>
                    <td className="py-2 pr-4">{it.index}</td>
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
              Next Phase → Operators & punctuation
            </button>
          </div>
        </div>
      )}
    </>
  );
}
