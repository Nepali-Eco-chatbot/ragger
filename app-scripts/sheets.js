function updateDataset() {
	const sheet = SpreadsheetApp.getActiveSpreadsheet();
	const fileId = sheet.getId();

	let userEmail = Session.getActiveUser().getEmail().toLowerCase();
	if (!userEmail) {
		SpreadsheetApp.getUi().alert(
			"Access Denied",
			"You are not authenticated to update the dataset!",
			SpreadsheetApp.getUi().ButtonSet.OK,
		);
		return;
	}

	try {
		var dfile = DriveApp.getFileById(fileId);
	} catch (e) {
		SpreadsheetApp.getUi().alert(
			"Access Denied",
			"You are not authorized to update the dataset!",
			SpreadsheetApp.getUi().ButtonSet.OK,
		);
	}

	const isEditor = dfile.getEditors().some((e) => e.getEmail() === userEmail);
	const isOwner = dfile.getOwner().getEmail() === userEmail;

	const hasEditPermission = isEditor || isOwner;
	if (!hasEditPermission) {
		SpreadsheetApp.getUi().alert(
			"Access Denied",
			"You are not authorized to update the dataset!",
			SpreadsheetApp.getUi().ButtonSet.OK,
		);
		return;
	}

	Logger.log("Access Granted, Proceeding with processing data!!");

	const table = sheet.getSheetValues(1, 1, sheet.getLastRow(), sheet.getLastColumn());

	const jsonData = [];
	const heading = table[0].map((h) => h.toLowerCase());
	table.forEach((row, index) => {
		if (index == 0) return;
		const entry = {};
		row.forEach((column, index) => {
			if (!heading[index]) return;
			entry[heading[index]] = column;
		});

		jsonData.push(entry);
	});

	Logger.log("Parsed all the data");
	// Logger.log(JSON.stringify(jsonData, null, 2));

	const properties = PropertiesService.getScriptProperties();

	const GITHUB_REPO = properties.getProperty("GITHUB_REPO");
	const WORKFLOW_ID = properties.getProperty("WORKFLOW_ID");
	const GITHUB_PAT_TOKEN = properties.getProperty("GITHUB_PAT_TOKEN");

	const dataLen = JSON.stringify(jsonData).length;
	Logger.log(dataLen);

	Logger.log(GITHUB_REPO);
	Logger.log(GITHUB_PAT_TOKEN);
	Logger.log(WORKFLOW_ID);

	const response = UrlFetchApp.fetch(
		`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
		{
			method: "post",
			contentType: "application/json",
			headers: {
				"X-GitHub-Api-Version": "2026-03-10",
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${GITHUB_PAT_TOKEN}`,
				"Content-Type": "application/json",
			},
			payload: JSON.stringify({
				ref: "main",
				inputs: {
					jsonData: JSON.stringify(jsonData),
				},
			}),
		},
	);
	Logger.log(JSON.stringify(response, null, 2));
}
