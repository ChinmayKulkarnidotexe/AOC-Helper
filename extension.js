
const vscode = require('vscode');
const path = require("path");
const fs = require("fs");

const { fetchInput, submitAnswer } = require("./src/api");
const { runSolution } = require("./src/runSolution");
const { pickYear, pickDay } = require("./src/utils");

/**
 * @param {vscode.ExtensionContext} context
 */

async function configure(context) {
	const cookie = await vscode.window.showInputBox({
		prompt: "Enter your Advent of Code session cookie",
		password: true
	});

	if (!cookie) {
		vscode.window.showErrorMessage("Cookie required.");
		return;
	}

	if (await context.secrets.get("aoc-session")) {
		const overwrite = await vscode.window.showQuickPick(["Yes", "No"], {
			placeHolder: "A session cookie is already configured. Overwrite?"
		});

		if (overwrite !== "Yes") {
			vscode.window.showInformationMessage("Configuration cancelled.");
			return;
		}
	}

	await context.secrets.store("aoc-session", cookie);
	vscode.window.showInformationMessage("AoC configuration saved.");
}

async function fetchInputCmd(context) {
	const cookie = await context.secrets.get("aoc-session");
	if (!cookie) return vscode.window.showErrorMessage("Run AoC: Configure first");

	const year = await pickYear();
	const day = await pickDay(year);
	if (!day || !year) return;

	vscode.window.showInformationMessage(`Selected Year: ${year}, Day: ${day}`);

	const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const folder = path.join(root, `${year}`, `day${day}`);

	fs.mkdirSync(folder, { recursive: true });

	const inputPath = path.join(folder, "input.txt");

	if (fs.existsSync(inputPath)) {
		vscode.window.showInformationMessage(
			`Input already exists at : ${inputPath}`
		);
		return;
	}

	const input = await fetchInput(year, day, cookie);
	fs.writeFileSync(inputPath, input);

	vscode.window.showInformationMessage(`Saved input to ${folder}/input.txt`);
}

async function runSolutionCmd() {
	const day = await vscode.window.showInputBox({ prompt: "Day?" });
	const year = await vscode.window.showInputBox({ prompt: "Year?" });

	const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const folder = path.join(root, `${year}`, `day${day}`);

	const files = fs.readdirSync(folder);

	const part1 = files.find(f =>
		f.toLowerCase().includes("1") && (f.startsWith("solution") || f.startsWith("part"))
	);

	const part2 = files.find(f =>
		f.toLowerCase().includes("2") && (f.startsWith("solution") || f.startsWith("part"))
	);

	const single = files.find(f =>
		(f.startsWith("solution") || f.startsWith("part")) &&
		!f.toLowerCase().includes("1") &&
		!f.toLowerCase().includes("2")
	);

	let fileToRun = null;

	if (part1 || part2) {
		const choice = await vscode.window.showQuickPick(
			[
				part1 ? "Run Part 1" : null,
				part2 ? "Run Part 2" : null
			].filter(Boolean),
			{ placeHolder: "Select which part to run" }
		);

		if (!choice) return;

		if (choice === "Run Part 1") fileToRun = part1;
		if (choice === "Run Part 2") fileToRun = part2;
	}
	else if (single) {
		fileToRun = single;
	} else {
		return vscode.window.showErrorMessage("No solution file found.");
	}

	const output = await runSolution(path.join(folder, fileToRun));
	vscode.window.showInformationMessage(`Output: ${output}`);
	return output;
}

async function submitAnswerCmd(context) {
	const cookie = await context.secrets.get("aoc-session");
	if (!cookie) return;

	const day = await vscode.window.showInputBox({ prompt: "Day?" });
	const year = await vscode.window.showInputBox({ prompt: "Year?" });

	const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const folder = path.join(root, `${year}`, `day${day}`);
	const files = fs.readdirSync(folder);

	const part1 = files.find(f => f.toLowerCase().includes("1") && (f.startsWith("solution") || f.startsWith("part")));
	const part2 = files.find(f => f.toLowerCase().includes("2") && (f.startsWith("solution") || f.startsWith("part")));
	const single = files.find(f => (f.startsWith("solution") || f.startsWith("part")) && !f.toLowerCase().includes("1") && !f.toLowerCase().includes("2"));

	let fileToRun = null;
	let level = 1;

	if (part1 || part2) {
		const choice = await vscode.window.showQuickPick(
			[
				part1 ? "Submit Part 1" : null,
				part2 ? "Submit Part 2" : null
			].filter(Boolean),
			{ placeHolder: "Select which part to submit" }
		);

		if (!choice) return;

		if (choice === "Submit Part 1") {
			fileToRun = part1;
			level = 1;
		}
		if (choice === "Submit Part 2") {
			fileToRun = part2;
			level = 2;
		}

	} else if (single) {
		fileToRun = single;
		level = 1;
	} else {
		return vscode.window.showErrorMessage("No solution file found.");
	}

	const answer = await runSolution(path.join(folder, fileToRun));
	const result = await submitAnswer(year, day, level, answer, cookie);

	vscode.window.showInformationMessage(result.status);
	vscode.env.openExternal(`https://adventofcode.com/${year}/day/${day}/answer`);
}


function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand("aoc-helper.configure", () => configure(context)));
	context.subscriptions.push(vscode.commands.registerCommand("aoc-helper.fetchInput", () => fetchInputCmd(context)));
	context.subscriptions.push(vscode.commands.registerCommand("aoc-helper.runSolution", () => runSolutionCmd(context)));
	context.subscriptions.push(vscode.commands.registerCommand("aoc-helper.submitAnswer", () => submitAnswerCmd(context)));
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
