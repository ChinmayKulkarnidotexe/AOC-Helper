const { exec } = require("child_process");
const path = require("path");

function getCommandForFile(filePath) {
  const ext = path.extname(filePath);

  switch (ext) {
    case ".js":  return `node "${filePath}"`;
    case ".py":  return process.platform === "win32" ? `python "${filePath}"` : `python3 "${filePath}`;
    case ".ts":  return `ts-node "${filePath}"`;
    case ".cpp": return `g++ "${filePath}" -o run && ./run`;
    case ".java": return `javac "${filePath}" && java ${path.basename(filePath, ".java")}`;
    default:
      throw new Error("Unsupported file extension: " + ext);
  }
}

function runSolution(filePath) {
  return new Promise((resolve, reject) => {
    const cmd = getCommandForFile(filePath);

    exec(cmd, { cwd: path.dirname(filePath) }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}

module.exports = { runSolution };
