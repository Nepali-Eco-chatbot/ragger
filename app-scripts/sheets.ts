function updateDataset() {
	const sheet = SpreadsheetApp.getActiveSpreadsheet();
	const fileId = sheet.getId();

	let userEmail = Session.getActiveUser().getEmail().toLowerCase();
	if (!userEmail) {
		SpreadsheetApp.getUi().alert("Access Denied", "You are not authenticated to update the dataset!", SpreadsheetApp.getUi().ButtonSet.OK);
		return;
	}

	try {
		var dfile = DriveApp.getFileById(fileId);
	} catch (e) {
		SpreadsheetApp.getUi().alert("Access Denied", "You are not authorized to update the dataset!", SpreadsheetApp.getUi().ButtonSet.OK);
	}
	//TODO: no file is found.

	const isEditor = dfile.getEditors().some(e => e.getEmail() === userEmail);
	const isOwner = dfile.getOwner().getEmail() === userEmail;

	const hasEditPermission = isEditor || isOwner;
	if (!hasEditPermission) {
		SpreadsheetApp.getUi().alert("Access Denied", "You are not authorized to update the dataset!", SpreadsheetApp.getUi().ButtonSet.OK);
		return;
	}

	SpreadsheetApp.getUi().alert("Permission check successful", "Updating the dataset now!", SpreadsheetApp.getUi().ButtonSet.OK);
	// to trigger github action.
}
