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
  ,"fun","println","include","isostram"
]);

const STRING_OR_CHAR_RE = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'/g;
const IDENT_RE = /[A-Za-z_][A-Za-z0-9_]*/g;

export default function IdentifiersPhase() {
  const [code, setCode] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [idents, setIdents] = useState([]);
  const router = useRouter();

  // Load Phase 4 output and auto-run recognition
  useEffect(() => {
    const prev = localStorage.getItem("phase4Code");
    if (prev) {
      // Load input from previous phase but do NOT auto-run recognition.
      // User should click the button to run recognition.
      setCode(prev);
    } else {
      alert("No output from previous phase found. Please complete Phase 4 first.");
      router.push("/keywords");
    }
  }, [router]);

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
        // light green highlight (match constants/keywords style)
        html += `<mark class="rounded px-1" style="background:#bbf7d0;color:#064e3b;padding:0.125rem 0.25rem;border-radius:0.25rem;">${escapeHtml(
          name
        )}</mark>`;
      }
      last = end;
    }

    html += escapeHtml(code.slice(last));

    setHighlighted(html);
    setIdents(found);
    try {
      alert("Identifiers recognized successfully!");
    } catch (e) {
      // ignore
    }
  }

  function goToNext() {
    localStorage.setItem("phase5Code", code);
    router.push("/operators");
  }

  const hasOutput = highlighted.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl p-6 md:p-10 bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto transition-all">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-green-700 mb-6">Lexical Analyzer – Phase 5: Recognize Identifiers</h1>

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
              <h2 className="text-lg font-semibold text-green-700 mb-3 text-center">Output (Identifiers Highlighted)</h2>
              <div className="flex items-center justify-center mb-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold">{idents.length}</div>
              </div>
              <pre className="font-mono text-xs md:text-sm text-gray-800 whitespace-pre-wrap break-words"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
            </div>
          )}
        </div>

        {/* Recognize Button (moved outside input card) */}
        {code && !hasOutput && (
          <div className="flex justify-center mt-6">
            <button
              onClick={recognizeIdentifiers}
              className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Recognize Identifiers
            </button>
          </div>
        )}

        {/* Next Step Button (after recognition) */}
        {hasOutput && (
          <div className="flex justify-center mt-8">
            <button onClick={goToNext} className="px-8 py-3 bg-green-300 hover:bg-green-400 text-gray-800 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200">Next Phase → Operators & punctuation</button>
          </div>
        )}
      </div>
    </div>
  );
}
