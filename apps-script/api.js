// ============================================================
// CUSTOMER ACQUISITION DASHBOARD — Google Apps Script API
// ============================================================
// HOW TO DEPLOY:
//   1. Open your Google Sheet
//   2. Extensions → Apps Script
//   3. Delete any existing code, paste this entire file
//   4. Click "Deploy" → "New Deployment"
//   5. Type: Web App | Execute as: Me | Who has access: Anyone
//   6. Click Deploy → copy the Web App URL
//   7. Add that URL as SHEET_API_URL in Vercel environment variables
//
// To update after code changes:
//   Deploy → Manage Deployments → edit existing (URL stays same)
// ============================================================

var SHEET_NAME = "Customer Acquisition Dash";

// Row ranges (1-indexed, matching your actual sheet rows)
var SECTIONS = [
  { key: "facebook",    startRow: 3,   endRow: 28  },
  { key: "google",      startRow: 30,  endRow: 45  },
  { key: "email",       startRow: 47,  endRow: 62  },
  { key: "conference",  startRow: 64,  endRow: 76  },
  { key: "bullseyeAds", startRow: 95,  endRow: 110 },
  { key: "bullseyeAll", startRow: 113, endRow: 124 },
];

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
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  // getDisplayValues returns visible text (handles $, %, #DIV/0!, etc.)
  var display = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();

  // Row 2 (index 1) = period headers
  var headerRow = display[1] || [];
  var periods = [];
  for (var c = 1; c < headerRow.length; c++) {
    var h = trim(headerRow[c]);
    if (h) periods.push(h);
  }

  var result = {
    periods: periods,
    lastUpdated: new Date().toISOString()
  };

  // Parse each section by fixed row range
  for (var s = 0; s < SECTIONS.length; s++) {
    var sec = SECTIONS[s];
    var rows = [];

    for (var r = sec.startRow; r <= sec.endRow; r++) {
      var rowIdx = r - 1; // convert to 0-indexed
      if (rowIdx >= display.length) break;

      var row = display[rowIdx];
      var label = trim(row[0]);
      if (!label) continue;

      var values = [];
      for (var j = 0; j < periods.length; j++) {
        values.push(parseVal(row[j + 1]));
      }

      rows.push({ label: label, values: values });
    }

    result[sec.key] = rows;
  }

  return result;
}

function parseVal(raw) {
  if (raw === null || raw === undefined) return null;
  var s = trim(String(raw));
  if (s === "" || s === "#DIV/0!" || s === "#VALUE!" || s === "#N/A" || s === "#REF!" || s === "#NAME?") {
    return null;
  }
  var cleaned = s.replace(/[$,]/g, "");
  if (cleaned.charAt(cleaned.length - 1) === "%") {
    var pct = parseFloat(cleaned);
    return isNaN(pct) ? null : pct;
  }
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
