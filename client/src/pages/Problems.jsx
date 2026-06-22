import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpDown, SlidersHorizontal, Lock, CheckCircle2 } from "lucide-react";
import axiosClient from "../utils/axiosClient.js";


const topicTags = [
  { name: "Array", count: 2189 },
  { name: "String", count: 878 },
  { name: "Hash Table", count: 823 },
  { name: "Math", count: 681 },
  { name: "Dynamic Programming", count: 663 },
  { name: "Sorting", count: 525 },
  { name: "Greedy", count: 462 },
];

const Problems = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [problemListData, setProblemListData] = useState([]);


  useEffect(() => {
    function getProblems() {
      axiosClient.get("/problems/get-all").then((response) => {
        setProblemListData(response.data);
      });
    }

    getProblems();
  }, []);

  // Filtering helper
  const filteredProblems = problemListData.filter((prob) =>
    prob.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#1a1a1a] text-zinc-100 light:bg-zinc-50 light:text-zinc-900 px-4 py-8 md:px-12 transition-colors duration-300">
      <div className="max-w-6xl m-auto space-y-6">

        {/* 🏷️ SECTION 1: Horizontal Topic Badges Container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none text-xs">
          {topicTags.map((tag) => (
            <button
              key={tag.name}
              className="flex items-center gap-1.5 px-3 py-1.5 shrink-0 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700/80 cursor-pointer transition-colors light:bg-zinc-200 light:text-zinc-700 light:hover:bg-zinc-300"
            >
              <span>{tag.name}</span>
              <span className="text-zinc-500 font-mono text-[11px]">{tag.count}</span>
            </button>
          ))}
        </div>



        {/* 🔍 SECTION 3: Filter controls toolbar banner row layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-zinc-800 border border-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 light:bg-zinc-200/60 light:text-zinc-900 light:placeholder-zinc-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 text-zinc-400">
            <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer light:bg-zinc-200 light:text-zinc-700"><ArrowUpDown className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer light:bg-zinc-200 light:text-zinc-700"><SlidersHorizontal className="w-4 h-4" /></button>
            <span className="text-xs font-medium ml-2 font-mono text-zinc-500">0/3972 Solved</span>
          </div>
        </div>

        {/* 📊 SECTION 4: List Table Stack Container Viewport */}
        <div className="w-full space-y-[2px] pt-2">
          {filteredProblems.map((prob, index) => {
            // Mapping dynamic text color properties according to difficulty tags safely
            const diffColor = 
              prob.difficulty === "easy" ? "text-emerald-400 light:text-emerald-600" :
              prob.difficulty === "medium" ? "text-amber-400 light:text-amber-600" : "text-rose-500";

            return (
              <div
                key={prob._id}
                className={`flex items-center justify-between px-4 py-3.5 rounded-lg text-sm transition-colors duration-150 ${
                  index % 2 === 0 
                    ? "bg-[#272727] light:bg-[#EDEDEF]" 
                    : "bg-transparent"
                }`}
              >
                {/* ID & Title */}
                <div className="flex items-center gap-3 w-11/12 truncate pr-4">
                  <span className="text-zinc-600 font-mono text-xs select-none w-8 shrink-0">{index + 1}.</span>
                  <Link
                    to={`/problems/${prob._id}`}
                    className="font-medium text-zinc-200 hover:text-blue-400 transition-colors truncate light:text-zinc-800 light:hover:text-blue-600"
                  >
                    {prob.title}
                  </Link>
                </div>

                {/* Difficulty Tag Badge */}
                <div className={`w-1/12 font-semibold text-xs pr-4 ${diffColor}`}>
                  {prob.difficulty.charAt(0).toUpperCase() + prob.difficulty.slice(1)}
                </div>
              </div>
            );
          })}

          {filteredProblems.length === 0 && (
            <div className="text-center py-12 text-sm text-zinc-500">
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Problems;