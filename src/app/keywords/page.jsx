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

/* C++ keyword set (C++11+ core + common) */
const CPP_KEYWORDS = new Set([
  // types & storage
  "auto","bool","char","char16_t","char32_t","char8_t","double","float","int","long","short",
  "signed","unsigned","void","wchar_t","decltype","nullptr_t",
  "extern","mutable","register","static","thread_local","volatile","const",
  // flow
  "break","case","continue","default","do","else","for","goto","if","return","switch","while",
  // classes & funcs
  "class","struct","union","enum","template","typename","using","namespace",
  "inline","virtual","explicit","friend","operator","this","new","delete",
  // exceptions
  "try","catch","throw","noexcept",
  // casts
  "const_cast","static_cast","dynamic_cast","reinterpret_cast",
  // literals/bools
  "true","false","nullptr",
  // misc
  "sizeof","typeid","alignof","alignas","constexpr","consteval","constinit",
  "export","import","requires","concept","co_await","co_yield","co_return"
]);

export default function KeywordsPhase() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState(""); // HTML
  const [keywords, setKeywords] = useState([]);       // [{value,index}]
  const router = useRouter();

  // Load output from Phase 3
  useEffect(() => {
    const prev = localStorage.getItem("phase3Code");
    if (prev) setCode(prev);
  }, []);

  function recognizeKeywords() {
    // We'll scan only word tokens ([A-Za-z_]\w*) and match against the keyword set.
    const WORD_RE = /[A-Za-z_]\w*/g;

    let html = "";
    let last = 0;
    const found = [];

    for (const m of code.matchAll(WORD_RE)) {
      const word = m[0];
      const start = m.index ?? 0;
      const end = start + word.length;

      // Append plain text before this token (escaped)
      html += escapeHtml(code.slice(last, start));

      if (CPP_KEYWORDS.has(word)) {
        found.push({ value: word, index: start });
        html += `<mark class="rounded px-1 font-semibold" style="background:#34d399;">${escapeHtml(
          word
        )}</mark>`;
      } else {
        html += escapeHtml(word);
      }
      last = end;
    }
    // Tail
    html += escapeHtml(code.slice(last));

    setHighlighted(html);
    setKeywords(found);
  }

  function goToIdentifiers() {
    // Save code for the next phase (you can also save highlighted if needed)
    localStorage.setItem("phase4Code", code);
    router.push("/identifiers"); // create this page next
  }

  const hasOutput = highlighted.length > 0;

  return (
    <>
      {/* Top card (same layout as earlier phases) */}
      <div className="p-4 bg-gray-900 text-green-200 rounded-lg shadow-lg">
        <h1 className="text-white font-semibold">Phase 4: Recognize Keywords</h1>
        <textarea
          className="w-full h-56 bg-gray-800 text-green-200 rounded p-3 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={recognizeKeywords}
          className="mt-2 px-4 py-2 rounded bg-purple-600 text-white"
        >
          Recognize Keywords
        </button>
      </div>

      {/* Output card (same green style as Phase 1/3) */}
      <div className="mt-6 p-4 bg-green-300 rounded-lg shadow-lg">
        <h2 className="font-semibold">Output</h2>
        {hasOutput ? (
          <pre className="bg-green-600 rounded p-3 text-white text-sm overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        ) : (
          <p className="text-gray-700">Click “Recognize Keywords” to see the result.</p>
        )}
      </div>

      {/* Summary table */}
      {hasOutput && (
        <div className="mt-4 p-4 bg-green-400 rounded-lg shadow border overflow-x-auto">
          <h3 className="font-semibold mb-2">Detected keywords ({keywords.length})</h3>
          {keywords.length === 0 ? (
            <p className="text-gray-600">No keywords found.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Keyword</th>
                  <th className="py-2 pr-4">Index</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k, i) => (
                  <tr key={`${k.value}-${k.index}-${i}`} className="border-b">
                    <td className="py-2 pr-4">{i + 1}</td>
                    <td className="py-2 pr-4 font-mono">{k.value}</td>
                    <td className="py-2 pr-4">{k.index}</td>
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
              onClick={goToIdentifiers}
              className="px-6 py-2 rounded bg-blue-600 text-white hover:opacity-90"
            >
              Next Phase → Recognize Identifiers
            </button>
          </div>
        </div>
      )}
    </>
  );
}
