import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Play, Send, BookOpen, ChevronDown, Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import axiosClient from "../utils/axiosClient";

const SUPPORTED_LANGUAGES = [
  { id: "cpp", name: "C++" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "javascript", name: "JavaScript" },
];

export default function ProblemSolve() {
  const { id } = useParams();
  const { theme } = useTheme();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Workspace States
  const [activeLang, setActiveLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [consoleOutput, setConsoleOutput] = useState("");

  const codeCacheRef = useRef({});

  // Fetch Data & Initialize Start Codes
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const data = await axiosClient
          .get(`/problems/get/${id}`)
          .then((res) => res.data);

        setProblem(data);

        const initialCodeState = {};
        data.startCode.forEach((sc) => {
          const langMatch = SUPPORTED_LANGUAGES.find(
            (l) => l.id === sc.language.toLowerCase(),
          );

          if (langMatch) {
            initialCodeState[langMatch.id] = sc.code;
          }
        });

        // Seed the mutable ref container
        codeCacheRef.current = initialCodeState;
      } catch (err) {
        console.error("Failed to fetch problem:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  // 🚀 OPTIMIZATION: Directly update the ref on change (0ms React render overhead)
  const handleEditorChange = (value) => {
    codeCacheRef.current[activeLang.id] = value || "";
  };

  const handleExecutionRoute = async (actionType) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      setConsoleOutput("Judging... Please wait.");

      const res = await axiosClient.post(`/problems/${id}/submissions`, {
        language_name: activeLang.id,
        code: codeCacheRef.current[activeLang.id] || "", // Read straight from the ref
        runOrSubmit: actionType,
      });

      if (res.status === 200) {
        const passed = res.data.testCasesPassed ?? 0;
        const outputsArray = res.data.outputs || [];
        const total = res.data.totalTestCases || outputsArray.length || "N/A";

        setConsoleOutput(
          `Submission Result:\nStatus: ${res.data.status}\nRuntime: ${res.data.executionTime ?? 0}ms\nTest Cases Passed: ${passed}/${total}`,
        );
      }
    } catch (err) {
      console.error(`Failed to process execution action (${actionType}):`, err);
      const serverErrorMsg =
        err.response?.data?.message || "An error occurred during evaluation.";
      setConsoleOutput(`Execution Error:\n${serverErrorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-100 bg-[#1e1e1e] light:text-zinc-800 light:bg-zinc-50">
        Loading Workspace...
      </div>
    );
  }

  const diffColor =
    problem.difficulty === "easy"
      ? "text-emerald-400 bg-emerald-500/10 light:text-emerald-700 light:bg-emerald-100"
      : problem.difficulty === "medium"
        ? "text-amber-400 bg-amber-500/10 light:text-amber-700 light:bg-amber-100"
        : "text-rose-400 bg-rose-500/10 light:text-rose-700 light:bg-rose-100";

  return (
    <div className="flex h-[calc(100vh-50px)] w-full overflow-hidden bg-[#1e1e1e] text-zinc-100 light:bg-zinc-50 light:text-zinc-900 transition-colors duration-300">
      {/* 🧩 LEFT PANEL: Description, Test Cases & Constraints */}
      <div className="w-1/2 h-full flex flex-col border-r border-zinc-700/60 light:border-zinc-200">
        <div className="flex items-center gap-4 px-4 h-10 border-b border-zinc-700/60 bg-[#252526] light:bg-zinc-100 light:border-zinc-200">
          <button
            type="button"
            className="flex items-center gap-1.5 h-full text-xs font-semibold border-b-2 border-amber-500 text-zinc-100 light:text-zinc-900"
          >
            <BookOpen className="w-3.5 h-3.5" /> Description
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div>
            <h1 className="text-2xl font-bold mb-3">{problem.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span
                className={`px-2.5 py-0.5 rounded-full capitalize ${diffColor}`}
              >
                {problem.difficulty}
              </span>
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 light:bg-zinc-200 light:text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="text-sm leading-relaxed text-zinc-300 light:text-zinc-700 whitespace-pre-wrap">
            {problem.description}
          </div>

          <div className="space-y-5 pt-2 border-t border-zinc-800 light:border-zinc-200">
            {problem.visibleTestCases.map((tc, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Example {idx + 1}:
                </h3>
                <div className="p-4 rounded-xl font-mono text-xs bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 light:bg-zinc-100 light:border-zinc-200 light:text-zinc-800">
                  <p>
                    <strong className="text-zinc-400">Input:</strong> {tc.input}
                  </p>
                  <p>
                    <strong className="text-zinc-400">Output:</strong>{" "}
                    {tc.output}
                  </p>
                  {tc.explanation && (
                    <p className="mt-2 text-zinc-500 italic">
                      <strong className="not-italic text-zinc-400">
                        Explanation:
                      </strong>{" "}
                      {tc.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Constraints UI Layout block */}
          {problem.constraints && (
            <div className="space-y-2 pt-2 border-t border-zinc-800 light:border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 select-none">
                Constraints:
              </h3>
              <div className="text-xs leading-relaxed font-mono text-zinc-400 bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-lg whitespace-pre-wrap light:bg-zinc-100/50 light:border-zinc-200 light:text-zinc-600">
                {problem.constraints}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🧩 RIGHT PANEL: Monaco Editor Workspace */}
      <div className="w-1/2 h-full flex flex-col bg-[#1e1e1e] overflow-hidden light:bg-white">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 h-10 border-b border-zinc-700/60 bg-[#252526] light:bg-zinc-100 light:border-zinc-200">
          <div className="relative group">
            <select
              value={activeLang.id}
              disabled={isProcessing}
              onChange={(e) => {
                const selected = SUPPORTED_LANGUAGES.find(
                  (l) => l.id === e.target.value,
                );
                setActiveLang(selected);
              }}
              className="appearance-none bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold py-1 pl-3 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer disabled:opacity-50 light:bg-white light:border-zinc-300 light:text-zinc-700"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1.5 pointer-events-none text-zinc-400" />
          </div>
        </div>

        {/* Monaco Editor Instance */}
        <div className="flex-1 min-h-0 relative py-2">
          <Editor
            height="100%"
            language={activeLang.id}
            theme={theme === "light" ? "light" : "vs-dark"}
            value={codeCacheRef.current[activeLang.id] || ""}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              padding: { top: 16 },
              readOnly: isProcessing,
            }}
            loading={
              <div className="text-zinc-500 text-sm p-4">
                Initializing IDE...
              </div>
            }
          />
        </div>

        {/* Console Output Block */}
        {consoleOutput && (
          <div className="h-48 border-t border-zinc-700/60 bg-[#1e1e1e] p-4 font-mono text-xs text-zinc-300 overflow-y-auto light:bg-zinc-50 light:border-zinc-200 light:text-zinc-800 transition-colors duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 light:border-zinc-200 select-none">
              <span className="text-zinc-500 font-bold uppercase tracking-wider light:text-zinc-400">
                Console Output
              </span>
              <button
                type="button"
                onClick={() => setConsoleOutput("")}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-0.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 light:text-zinc-400 light:hover:text-zinc-600 light:focus:ring-zinc-300"
                aria-label="Clear console output"
              >
                ✕
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all text-zinc-200 light:text-zinc-700 selection:bg-amber-500/30">
              <code>{consoleOutput}</code>
            </pre>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="flex items-center justify-end gap-3 px-4 h-14 border-t border-zinc-700/60 bg-[#252526] light:bg-zinc-100 light:border-zinc-200">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleExecutionRoute("run")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-800 font-semibold text-xs text-zinc-300 hover:bg-zinc-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none light:bg-white light:border light:border-zinc-300 light:text-zinc-700 light:hover:bg-zinc-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            Run
          </button>
          <button
            type="button"
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-emerald-600 font-bold text-xs text-white hover:bg-emerald-700 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => handleExecutionRoute("submit")}
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}