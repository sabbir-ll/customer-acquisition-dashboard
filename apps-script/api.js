// ============================================================
// CUSTOMER ACQUISITION DASHBOARD — Google Apps Script API
// ============================================================
// HOW TO DEPLOY:
//   1. Open your Google Sheet
//   2. Extensions → Apps Script
//   3. Delete any existing code, paste this entire file
//   4. Click "Deploy" → "New Deployment"
//   5. Type: Web App
//      Execute as: Me
//      Who has access: Anyone
//   6. Click Deploy → copy the Web App URL
//   7. Add that URL as SHEET_API_URL in Vercel environment variables
//
// After any code change: Deploy → Manage Deployments → edit the
// existing deployment (don't create a new one, URL stays the same).
// ============================================================

var SHEET_NAME = "Customer Acquisition Dash";

function doGet(e) {
  try {
    var result = getData();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error("Sheet not found: " + SHEET_NAME);
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  // getDisplayValues returns the visible text exactly as in the cell
  // (handles %, $, comma formatting, #DIV/0! errors, etc.)
  var display = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();

  // Row index 1 = period headers (row 2 in the sheet)
  var headerRow = display[1] || [];
  var periods = [];
  for (var c = 1; c < headerRow.length; c++) {
    var h = trim(headerRow[c]);
    if (h) periods.push(h);
  }

  var facebook = [];
  var googleRows = [];
  var section = "none";

  for (var i = 2; i < display.length; i++) {
    var row = display[i];
    var label = trim(row[0]);
    if (!label) continue;

    if (label === "Facebook Spend") section = "fb";
    else if (label === "Google Spend") section = "goog";

    if (section === "none") continue;

    var values = [];
    for (var j = 0; j < periods.length; j++) {
      values.push(parseVal(row[j + 1]));
    }

    var entry = { label: label, values: values };
    if (section === "fb") facebook.push(entry);
    else googleRows.push(entry);
  }

  return {
    periods: periods,
    facebook: facebook,
    google: googleRows,
    lastUpdated: new Date().toISOString()
  };
}

function parseVal(raw) {
  if (raw === null || raw === undefined) return null;
  var s = trim(String(raw));
  if (s === "" || s === "#DIV/0!" || s === "#VALUE!" || s === "#N/A" || s === "#REF!" || s === "#NAME?") {
    return null;
  }
  // Remove $ and commas
  var cleaned = s.replace(/[$,]/g, "");
  // Percentage  e.g. "29%"
  if (cleaned.charAt(cleaned.length - 1) === "%") {
    var pct = parseFloat(cleaned);
    return isNaN(pct) ? null : pct;
  }
  // Multiplier  e.g. "7406.8x"
  if (cleaned.charAt(cleaned.length - 1) === "x") {
    var mult = parseFloat(cleaned);
    return isNaN(mult) ? null : mult;
  }
  var n = parseFloat(cleaned);
  return isNaN(n) ? s : n;
}

function trim(s) {
  if (!s) return "";
  return String(s).replace(/^\s+|\s+$/g, "");
}
