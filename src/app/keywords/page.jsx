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
  ,"fun","println"
]);

export default function KeywordsPhase() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState(""); // HTML
  const [keywords, setKeywords] = useState([]);       // [{value,index}]
  const router = useRouter();

  // Load output from Phase 3 and auto-run recognition
  useEffect(() => {
    const prev = localStorage.getItem("phase3Code");
    if (prev) {
      // Load input from previous phase but do NOT auto-run recognition.
      // User should click the button to run recognition.
      setCode(prev);
    } else {
      alert("No output from previous phase found. Please complete Phase 3 first.");
      router.push("/constants");
    }
  }, [router]);

  function recognizeKeywords(input) {
    // We'll scan only word tokens ([A-Za-z_]\w*) and match against the keyword set.
    const WORD_RE = /[A-Za-z_]\w*/g;
    const src = typeof input === "string" ? input : code;

    let html = "";
    let last = 0;
    const found = [];

    for (const m of src.matchAll(WORD_RE)) {
      const word = m[0];
      const start = m.index ?? 0;
      const end = start + word.length;

      // Append plain text before this token (escaped)
      html += escapeHtml(src.slice(last, start));

      if (CPP_KEYWORDS.has(word)) {
        found.push({ value: word, index: start });
        // use the same light-green highlight as constants
        html += `<mark class="rounded px-1 font-semibold" style="background:#bbf7d0;color:#064e3b;padding:0.125rem 0.25rem;border-radius:0.25rem;">${escapeHtml(
          word
        )}</mark>`;
      } else {
        html += escapeHtml(word);
      }
      last = end;
    }
    // Tail
    html += escapeHtml(src.slice(last));

    setHighlighted(html);
    setKeywords(found);
    try {
      alert("Keywords recognized successfully!");
    } catch (e) {
      // ignore
    }
  }
  function goToIdentifiers() {
    // Save code for the next phase (you can also save highlighted if needed)
    localStorage.setItem("phase4Code", code);
    router.push("/identifiers"); // create this page next
  }

  const hasOutput = highlighted.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto transition-all">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-green-700 mb-6">Lexical Analyzer – Phase 4: Recognize Keywords</h1>

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
              <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">Output (Keywords Highlighted)</h2>
              <div className="flex items-center justify-center mb-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold">{keywords.length}</div>
              </div>
              <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
            </div>
          )}
        </div>

        {/* Recognize button (outside input card) */}
        {!hasOutput && code && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => recognizeKeywords()}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Recognize Keywords
            </button>
          </div>
        )}

        {/* Next Step Button (after recognition) */}
        {hasOutput && (
          <div className="flex justify-center mt-8">
            <button onClick={goToIdentifiers} className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200">Next Phase → Recognize Identifiers</button>
          </div>
        )}
      </div>
    </div>
  );
}
