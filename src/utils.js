const vscode = require('vscode');

async function pickYear() {
	const years = Array.from({ length: 2025 - 2015 + 1 }, (_, i) => (2015 + i).toString());

	const selection = await vscode.window.showQuickPick(years, {
		placeHolder: "Select year (2015–2025)",
		canPickMany: false,
		matchOnDescription: true,
		matchOnDetail: true
	});

	return selection;
}

async function pickDay(year) {
	let maxDay = 25;

	if (year === "2025") {
		maxDay = 12;
	}

	const days = Array.from({ length: maxDay }, (_, i) => `${i + 1}`);

	const selection = await vscode.window.showQuickPick(days, {
		placeHolder: `Select day (1–${maxDay})`,
		canPickMany: false,
		matchOnDescription: true,
		matchOnDetail: true
	});

	return selection;
}

module.exports = { pickYear, pickDay };