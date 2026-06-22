import Submission from "../models/submissions.js";
import Problem from "../models/problem.js";
import axios from "axios";

// Static mapping to keep track of file extensions needed by Glot.io
const EXTENSION_MAP = {
  javascript: "js",
  python: "py",
  cpp: "cpp",
  java: "java",
};


export const submitCode = async (req, res) => {
  let submission = null;

  try {
    const problemId = req.params.problemId;
    const user = req.user;
    const { language_name, code, runOrSubmit } = req.body;

    if (!language_name || !code) {
      return res
        .status(400)
        .json({ message: "Language and code fields are required." });
    }

    const langKey = language_name.toLowerCase();
    const fileExtension = EXTENSION_MAP[langKey];

    if (!fileExtension) {
      return res
        .status(400)
        .json({ message: `Language ${language_name} is not supported yet.` });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Fetch the corresponding starter code object to find the target compiler version
    const targetTemplateObj = problem.startCode.find(
      (item) => item.language.toLowerCase() === langKey,
    );

    if (!targetTemplateObj) {
      return res
        .status(400)
        .json({
          message: `Starter code template for ${language_name} not configured on this problem.`,
        });
    }

    const lang_version = targetTemplateObj.version;

    // Extract the customized testing harness/wrapper provided by the problem creator
    const rawWrapper = problem.wrapperCode.get(langKey);
    if (!rawWrapper) {
      return res
        .status(400)
        .json({
          message: `Execution driver wrapper missing for ${language_name} on this problem.`,
        });
    }

    // Stitch the user's code directly inside the creator's wrapper architecture
    const placeholderToken =
      langKey === "python" ? "# {{USER_CODE}}" : "// {{USER_CODE}}";

    const executableCode = rawWrapper.replace(placeholderToken, code);
    const problemDifficulty = problem.difficulty;

    let testCases = problem.visibleTestCases;
    if (runOrSubmit==="submit") {
      testCases = testCases.concat(problem.hiddenTestCases);

      // Initialize the submission tracking record in the database
      submission = new Submission({
        problemId: problemId,
        userId: user._id,
        language: language_name,
        code: code,
        status: "Pending",
        outputs: [],
      });
      await submission.save();
    }

    let finalStatus = "Accepted";
    const recordedOutputs = [];
    const recordedUserDebugLogs = [];
    let maxExecutionTime = 0;

    const fileName = langKey === "java" ? "Main.java" : `main.${fileExtension}`;
    let testCasesPassed = 0;

    // Grade the submission against test cases sequentially
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      const startTime = performance.now();

      // Ship code payload to Glot.io execution environment
      const response = await axios.post(
        `https://glot.io/api/run/${langKey}/${lang_version}`,
        {
          files: [
            {
              name: fileName,
              content: executableCode,
            },
          ],
          stdin: testCase.input, // Input is cleanly streamed straight through standard input
        },
        {
          headers: {
            Authorization: `Token ${process.env.GLOT_IO_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      const endTime = performance.now();
      const runDuration = Math.round(endTime - startTime);
      if (runDuration > maxExecutionTime) {
        maxExecutionTime = runDuration;
      }

      const { stdout, stderr, error } = response.data;
      let cleanOutput = stdout ? stdout.trim() : "";
      let userDebugLogs = "";

      // 🚀 DELIMITER LOGIC: Split the output if our secret judge string exists
      const DELIMITER = "---JUDGE_RESULT---";
      if (cleanOutput.includes(DELIMITER)) {
        const parts = cleanOutput.split(DELIMITER);
        userDebugLogs = parts[0].trim(); // Everything the user printed
        cleanOutput = parts[1].trim(); // The actual answer from the wrapper
      }

      const cleanError = stderr || error;

      // Handle structural or runtime errors cleanly
      if (cleanError) {
        finalStatus = "Runtime Error";
        recordedOutputs.push(
          cleanError.trim() || `Runtime Error on test case ${i + 1}`,
        );
        break;
      }

      recordedUserDebugLogs.push(userDebugLogs);

      recordedOutputs.push(cleanOutput);

      // Standardize Windows line breaks (\r\n vs \n) to ensure cross-platform evaluation consistency
      const normalizedOutput = cleanOutput.replace(/\r\n/g, "\n").trim();
      const normalizedExpected = testCase.output.replace(/\r\n/g, "\n").trim();

      // Optimize grading cycle with an early exit if evaluation fails
      if (normalizedOutput !== normalizedExpected) {
        finalStatus = "Wrong Answer";
        break;
      }

      testCasesPassed++;
    }

    if (runOrSubmit === "submit") {
      // Persist finalized operational results
      submission.status = finalStatus;
      submission.outputs = recordedOutputs;
      submission.executionTime = maxExecutionTime;
      submission.testCasesPassed = testCasesPassed;

      if (finalStatus === "Accepted") {
        const noOfSubmissionsForProblem = await Submission.countDocuments({
          problemId: problemId,
          userId: user._id,
          status: "Accepted",
        });
        if (noOfSubmissionsForProblem === 0) {
          user.solvedCounts[problemDifficulty] += 1;
          await user.save();
        }
        await submission.save();
      }
    }


    return res.status(200).json({
      message: "Submission evaluated successfully",
      status: finalStatus,
      outputs: recordedOutputs,
      executionTime: maxExecutionTime,
      testCasesPassed: testCasesPassed,
      totalTestCases: testCases.length,
    });
  } catch (error) {
    console.error("Critical submission workflow failure:", error);

    // Guard fallback routine to protect user experience status visibility
    if (submission && submission.save) {
      submission.status = "Runtime Error";
      await submission.save();
    }

    const statusCode = error.response?.status === 401 ? 401 : 500;
    const errorMsg =
      statusCode === 401
        ? "Invalid Glot.io API token configuration."
        : "An internal compilation infrastructure error occurred.";

    return res.status(statusCode).json({ message: errorMsg });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.problemId;

    const submissions = await Submission.find({ userId, problemId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Failed to retrieve submissions:", error);
    return res.status(500).json({ message: "Failed to retrieve submissions." });
  }
};

export const getSubmissionDetail = async (req, res) => {
  try {
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    return res.status(200).json(submission);
  } catch (error) {
    console.error("Failed to retrieve submission detail:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve submission detail." });
  }
};
