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

const STRING_OR_CHAR_RE = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'/g;
const IDENT_RE = /[A-Za-z_][A-Za-z0-9_]*/g;

export default function IdentifiersPhase() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [idents, setIdents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const prev = localStorage.getItem("phase4Code");
    if (prev) setCode(prev);
  }, []);

  function recognizeIdentifiers() {
    const skipSpans = [];
    for (const m of code.matchAll(STRING_OR_CHAR_RE)) {
      const start = m.index ?? 0;
      skipSpans.push([start, start + m[0].length]);
    }

    const inSkip = (pos) => skipSpans.some(([s, e]) => pos >= s && pos < e);

    let html = "";
    let last = 0;
    const found = [];

    for (const m of code.matchAll(IDENT_RE)) {
      const name = m[0];
      const start = m.index ?? 0;
      const end = start + name.length;

      html += escapeHtml(code.slice(last, start));

      if (inSkip(start) || CPP_KEYWORDS.has(name)) {
        html += escapeHtml(name);
      } else {
        found.push({ name, index: start });
        html += `<mark class="rounded px-1" style="background:#60a5fa;">${escapeHtml(
          name
        )}</mark>`;
      }
      last = end;
    }

    html += escapeHtml(code.slice(last));

    setHighlighted(html);
    setIdents(found);
  }

  function goToNext() {
    localStorage.setItem("phase5Code", code);
    router.push("/operators");
  }

  const hasOutput = highlighted.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <div className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-6">
        {/* Header */}
        <h1 className="text-lg sm:text-xl md:text-2xl text-white font-semibold mb-4">
          Phase 5: Recognize Identifiers
        </h1>

        {/* Input Box */}
        <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
          <textarea
            className="w-full h-56 sm:h-64 md:h-72 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm sm:text-base resize-y"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            onClick={recognizeIdentifiers}
            className="mt-3 w-full sm:w-auto px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Recognize Identifiers
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
              Click “Recognize Identifiers” to see the result.
            </p>
          )}
        </div>

        {/* Summary */}
        {hasOutput && (
          <div className="mt-4 p-4 bg-green-500 rounded-lg shadow border overflow-x-auto">
            <h3 className="font-semibold mb-2">
              Detected identifiers ({idents.length})
            </h3>
            {idents.length === 0 ? (
              <p className="text-gray-700">No identifiers found.</p>
            ) : (
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Identifier</th>
                    <th className="py-2 pr-4">Index</th>
                  </tr>
                </thead>
                <tbody>
                  {idents.map((it, i) => (
                    <tr
                      key={`${it.name}-${it.index}-${i}`}
                      className="border-b last:border-0"
                    >
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
      </div>

      {/* Sticky Footer */}
      {hasOutput && (
        <div className="sticky bottom-0 inset-x-0 z-50 border-t border-yellow-600 bg-yellow-500/95 backdrop-blur">
          <div className="mx-auto max-w-4xl px-3 sm:px-6 py-3 flex justify-center sm:justify-end">
            <button
              onClick={goToNext}
              className="w-full sm:w-auto px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90 transition"
            >
              Next Phase → Operators & punctuation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
