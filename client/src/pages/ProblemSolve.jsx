import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Play, Send, BookOpen, ChevronDown, Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import axiosClient from "../utils/axiosClient";
import { useAuth } from "../context/AuthContext";

const SUPPORTED_LANGUAGES = [
  { id: "cpp", name: "C++" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "javascript", name: "JavaScript" },
];

export default function ProblemSolve() {
  const { id } = useParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Workspace States
  const [activeLang, setActiveLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [consoleOutput, setConsoleOutput] = useState(null); // Now stores the actual JSON object/response data

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

  // Update the ref on change (0ms React render overhead)
  const handleEditorChange = (value) => {
    codeCacheRef.current[activeLang.id] = value || "";
  };

  const handleExecutionRoute = async (actionType) => {
    if (!user) {
      const confirmed = window.confirm(
        "Please log in to submit your solution.",
      );
      if (!confirmed) return;
      return navigate("/auth#login", { state: { from: `/problems/${id}` } });
    }
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      // Put placeholder status while judging
      setConsoleOutput({
        isSystemStatus: true,
        text: "Judging... Please wait.",
      });

      const res = await axiosClient.post(`/problems/${id}/submissions`, {
        language_name: activeLang.id,
        code: codeCacheRef.current[activeLang.id] || "", // Read straight from the ref
        runOrSubmit: actionType,
      });

      if (res.status === 200) {
        // Direct response object assignment so our engine can parse out statuses elegantly
        setConsoleOutput(res.data);
      }
    } catch (err) {
      console.error(`Failed to process execution action (${actionType}):`, err);
      const serverErrorMsg =
        err.response?.data?.message || "An error occurred during evaluation.";

      setConsoleOutput({
        isSystemStatus: true,
        isError: true,
        text: `Execution Error:\n${serverErrorMsg}`,
      });
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

        {/* 🚀 OPTIMIZED CONSOLE UI COMPONENT */}
        {consoleOutput &&
          (() => {
            let data = consoleOutput;
            if (typeof consoleOutput === "string") {
              try {
                data = JSON.parse(consoleOutput);
              } catch (e) {
                data = null;
              }
            }

            // Handle plaintext processing messages or raw runtime errors cleanly
            if (!data || data.isSystemStatus) {
              return (
                <div className="h-56 border-t border-zinc-800 bg-[#121214] p-4 font-mono text-xs text-zinc-300 overflow-y-auto light:bg-zinc-50 light:border-zinc-200 light:text-zinc-800 transition-colors duration-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 light:border-zinc-200 select-none">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">
                      Console Output
                    </span>
                    <button
                      onClick={() => setConsoleOutput(null)}
                      className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <pre
                    className={`whitespace-pre-wrap break-all ${data?.isError ? "text-rose-400" : "text-zinc-400"}`}
                  >
                    <code>{data ? data.text : String(consoleOutput)}</code>
                  </pre>
                </div>
              );
            }

            const isAccepted = data.status === "Accepted";
            const passedCount = data.testCasesPassed ?? 0;
            const totalCount = data.totalTestCases ?? data.outputs?.length ?? 0;
            const runOrSubmitText =
              data.runOrSubmit === "submit" ? "Submit" : "Run";

            return (
              <div className="h-64 border-t border-zinc-800 bg-[#121214] font-mono text-xs text-zinc-300 overflow-y-auto light:bg-zinc-50 light:border-zinc-200 light:text-zinc-800 transition-colors duration-200 flex flex-col">
                {/* Sticky Meta Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-[#1a1a1e] light:bg-zinc-100 light:border-zinc-200 sticky top-0 z-10 select-none">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-sm ${isAccepted ? "text-emerald-400" : "text-rose-400 light:text-rose-600"}`}
                    >
                      {data.status || "Evaluated"}
                    </span>
                    <span className="text-zinc-700 light:text-zinc-300">|</span>
                    <span className="text-zinc-400 text-[11px] font-semibold light:text-zinc-600">
                      Passed:{" "}
                      <span
                        className={
                          isAccepted
                            ? "text-emerald-400"
                            : "text-zinc-200 light:text-zinc-800"
                        }
                      >
                        {passedCount}
                      </span>
                      /{totalCount}
                    </span>
                    {data.executionTime !== undefined && (
                      <>
                        <span className="text-zinc-700 light:text-zinc-300">
                          |
                        </span>
                        <span className="text-zinc-500 text-[11px] light:text-zinc-400">
                          Runtime:{" "}
                          <span className="text-amber-400/90 font-medium light:text-amber-600">
                            {data.executionTime}ms
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setConsoleOutput(null)}
                    className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded hover:bg-zinc-800 light:hover:bg-zinc-200 light:text-zinc-400"
                  >
                    ✕
                  </button>
                </div>

                {/* Layout Content Body */}
                <div className="p-4 space-y-4 flex-1 bg-[#121214] light:bg-zinc-50">
                  {/* Banner Announcement */}
                  <div
                    className={`p-3 rounded border text-[13px] ${
                      isAccepted
                        ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300 light:bg-emerald-50 light:border-emerald-200 light:text-emerald-700"
                        : "bg-rose-950/20 border-rose-800/40 text-rose-300 light:bg-rose-50 light:border-rose-200 light:text-rose-700"
                    }`}
                  >
                    {data.message}
                  </div>

                  {/* Condition Panel: Render explicit breakdown cards if a testcase failed */}

                  {data.testCaseNotPassed && (
                    <div className="rounded border border-zinc-800 bg-[#18181c] overflow-hidden light:bg-white light:border-zinc-200">
                      <div className="bg-rose-950/30 border-b border-zinc-800 px-3 py-1.5 text-rose-400 font-bold text-[11px] uppercase tracking-wider light:bg-rose-50 light:border-zinc-200 light:text-rose-600">
                        Failed Test Case Details
                      </div>
                      <div className="p-3 space-y-3 font-mono text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-0.5 light:text-zinc-400">
                            Input Parameters:
                          </span>
                          <pre className="bg-[#222226] p-2 rounded text-amber-200/90 overflow-x-auto whitespace-pre-wrap light:bg-zinc-100 light:text-zinc-800">
                            {typeof data.testCaseNotPassed.input === "object"
                              ? JSON.stringify(
                                  data.testCaseNotPassed.input,
                                  null,
                                  2,
                                )
                              : String(
                                  data.testCaseNotPassed.input ||
                                    data.testCaseNotPassed,
                                )}
                          </pre>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-0.5 light:text-zinc-400">
                              Expected Output:
                            </span>
                            <pre className="bg-emerald-950/10 border border-emerald-900/30 p-2 rounded text-emerald-400 overflow-x-auto light:bg-emerald-50/50 light:border-emerald-200 light:text-emerald-600">
                              {String(
                                data.testCaseNotPassed.expectedOutput || "N/A",
                              )}
                            </pre>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-0.5 light:text-zinc-400">
                              Your Actual Output:
                            </span>
                            <pre className="bg-rose-950/10 border border-rose-900/30 p-2 rounded text-rose-400 overflow-x-auto light:bg-rose-50/50 light:border-rose-200 light:text-rose-600">
                              {data.outputs &&
                              data.outputs[passedCount] !== undefined
                                ? String(data.outputs[passedCount])
                                : "No output / Runtime Error"}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Condition Panel: Success / Informational Outputs */}
                  {/* Condition Panel: Success Outputs Grid */}
                  {isAccepted &&
                    data.outputs &&
                    data.outputs.length > 0 &&
                    runOrSubmitText === "Run" && (
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-1.5 tracking-wide light:text-zinc-400">
                          Recorded Execution Outputs:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {data.outputs.map((out, idx) => (
                            <div
                              key={idx}
                              className="bg-[#18181c] border border-zinc-800 p-2 rounded flex flex-col justify-between light:bg-white light:border-zinc-200"
                            >
                              <span className="text-[9px] text-zinc-600 block font-bold light:text-zinc-400">
                                CASE {idx + 1}
                              </span>
                              <span
                                className="text-emerald-400 font-medium truncate mt-0.5 light:text-emerald-600"
                                title={String(out)}
                              >
                                {String(out)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {isAccepted && runOrSubmitText === "Submit" && (
                    <div className="text-zinc-400 text-xs font-mono py-1">
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold mb-1 tracking-wide light:text-zinc-400">
                        Execution Summary:
                      </span>
                      <p className="text-zinc-300 light:text-zinc-600">
                        All test cases passed successfully. Your solution is
                        optimized and accepted.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

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
