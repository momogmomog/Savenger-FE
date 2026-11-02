const fs = require("fs");
const path = require("path");

// --- Configuration ---
// Run like: node bundle-for-llm.js [folder_path] [output_file]
const TARGET_DIR = process.argv[2] || "./src/app";
const OUTPUT_FILE = process.argv[3] || "./llm-context.md";
const ALLOWED_EXTENSIONS = [".ts", ".html", ".scss"];
const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".angular",
  "./src/app/ui/template-history/template/template-payload-playground-dialog/generated-editor-lib.ts",
];

/**
 * Recursively fetches all files in a directory that match the allowed extensions.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getFilesRecursive(dirPath) {
  let results = [];

  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dirPath}`);
    return results;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        results = results.concat(getFilesRecursive(fullPath));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (
        ALLOWED_EXTENSIONS.includes(ext) &&
        !entry.name.includes(".spec.ts")
      ) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getMarkdownLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
      return "typescript";
    case ".html":
      return "html";
    case ".scss":
      return "scss";
    default:
      return "";
  }
}

console.log(`Scanning directory: ${TARGET_DIR}...`);
const filesToBundle = getFilesRecursive(path.resolve(__dirname, TARGET_DIR));

if (filesToBundle.length === 0) {
  console.log("No matching files found. Exiting.");
  // eslint-disable-next-line n/no-process-exit
  process.exit(0);
}

let bundledContent = "";
let processedFilesCount = 0;

filesToBundle.forEach((file) => {
  try {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(__dirname, file).replace(/\\/g, "/"); // Normalize slashes
    const mdLang = getMarkdownLanguage(file);

    // Format for LLM readability: Path header + Code block
    bundledContent += `### File: ${relativePath}\n`;
    bundledContent += `\`\`\`${mdLang}\n`;
    bundledContent += content.trim() + "\n";
    bundledContent += "```\n\n";

    processedFilesCount++;
  } catch (error) {
    console.warn(`Could not read file ${file}:`, error.message);
  }
});

fs.writeFileSync(path.resolve(__dirname, OUTPUT_FILE), bundledContent, "utf8");

console.log(
  `Successfully bundled ${processedFilesCount} files into ${OUTPUT_FILE}`,
);
