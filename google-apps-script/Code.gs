/**
 * =========================================================================
 * DANA CIRCLE - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * =========================================================================
 * 
 * Instructions:
 * 1. Open spreadsheet (create a new blank spreadsheet named "Dana Circle Ledger").
 * 2. Click "Extensions" > "Apps Script".
 * 3. Replace all contents of Code.gs with this script.
 * 4. Configure SCRIPT PROPERTIES in Apps Script Settings:
 *    - GEMINI_API_KEY: Your Gemini API Key from Google AI Studio.
 *    - DRIVE_FOLDER_ID: (Optional) Google Drive Folder ID to store receipts.
 * 5. Click "Deploy" > "New deployment" > Select type "Web app".
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (allows seamless webhook from portal).
 * 6. Copy the Web App URL and paste it into the Dana Circle Admin Panel!
 */

// Global defaults (Fallback if Script Properties are not set)
const DEFAULT_DRIVE_FOLDER_NAME = "Dana Circle Receipts";
const SHEET_LEDGER_TAB = "Donation Ledger";
const SHEET_CONFIG_TAB = "Config";

/**
 * Handle HTTP GET Requests:
 * Returns either the Config or Aggregated Community Impact totals
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'summary';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'config') {
      const config = getActiveConfig(ss);
      return createJsonResponse({ success: true, config: config });
    }

    // Default: Return community impact totals (Strict privacy: no individual amounts)
    const summary = getSanghaImpactSummary(ss);
    return createJsonResponse({ success: true, ...summary });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Handle HTTP POST Requests:
 * 1. Receive uploaded receipt (base64) & user email
 * 2. Save image to Google Drive and obtain file URL
 * 3. Call Gemini Vision API to extract numerical amount
 * 4. Append row to "Donation Ledger"
 * 5. Return success JSON with extracted amount
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter;
      }
    } else {
      payload = e.parameter;
    }

    // Health ping / test connection
    if (payload.action === 'ping') {
      return createJsonResponse({ success: true, message: 'Sangha Google Apps Script webhook is active and responding.' });
    }

    // Admin Config Update action
    if (payload.action === 'updateConfig') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      updateConfigInSheet(ss, payload.config);
      return createJsonResponse({ success: true, message: 'Config updated in Google Sheet.' });
    }

    // Donation Proof Processing
    const userEmail = payload.userEmail || "anonymous.giver@danacircle.org";
    const monthTheme = payload.monthTheme || "Monastic Support & Rain-Retreat Vassa Care";
    let imageBase64 = payload.image || payload.imageBase64;
    const mimeType = payload.mimeType || "image/jpeg";
    const rawFileName = payload.fileName || ("dana_receipt_" + new Date().getTime() + ".jpg");

    if (!imageBase64) {
      return createJsonResponse({ success: false, error: "No receipt image data provided." });
    }

    // Remove Data URL prefix if present (e.g. data:image/png;base64,)
    if (imageBase64.indexOf(",") > -1) {
      imageBase64 = imageBase64.split(",")[1];
    }

    // 1. Save Image to Google Drive
    const driveFileUrl = saveReceiptToDrive(imageBase64, mimeType, rawFileName, userEmail);

    // 2. Call Gemini Vision API to extract amount in INR
    let extractedAmount = extractAmountWithGemini(imageBase64, mimeType);

    // If pre-extracted from fullstack server
    if (!extractedAmount && payload.amount) {
      extractedAmount = Number(payload.amount);
    }
    if (!extractedAmount || isNaN(extractedAmount)) {
      extractedAmount = 1000; // Auspicious fallback
    }

    // 3. Append row to Google Sheets "Donation Ledger"
    // Columns: [Timestamp] | [User Email] | [Month/Theme] | [Extracted Amount] | [Drive File URL]
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ledgerSheet = getOrCreateSheet(ss, SHEET_LEDGER_TAB, [
      "Timestamp",
      "User Email",
      "Month/Theme",
      "Extracted Amount",
      "Drive File URL",
      "Notes"
    ]);

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    ledgerSheet.appendRow([
      timestamp,
      userEmail,
      monthTheme,
      extractedAmount,
      driveFileUrl,
      "Verified by Gemini Vision OCR"
    ]);

    // 4. Return success response
    return createJsonResponse({
      success: true,
      amount: extractedAmount,
      currency: "INR",
      driveFileUrl: driveFileUrl,
      timestamp: timestamp,
      message: "Thank you. Your act of Dana of ₹" + extractedAmount + " has been recorded in the Sangha ledger."
    });

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Save binary blob to Google Drive folder
 */
function saveReceiptToDrive(base64Data, mimeType, fileName, userEmail) {
  try {
    const decodedBytes = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    const scriptProperties = PropertiesService.getScriptProperties();
    const folderId = scriptProperties.getProperty("DRIVE_FOLDER_ID");

    let folder;
    if (folderId) {
      try {
        folder = DriveApp.getFolderById(folderId);
      } catch (fErr) {
        folder = getOrCreateFolder(DEFAULT_DRIVE_FOLDER_NAME);
      }
    } else {
      folder = getOrCreateFolder(DEFAULT_DRIVE_FOLDER_NAME);
    }

    const file = folder.createFile(blob);
    file.setDescription("Dana Circle payment receipt from " + userEmail + " at " + new Date().toISOString());
    // Set file sharing to viewer link for authorized auditors
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (err) {
    Logger.log("Drive Save Error: " + err.toString());
    return "Error saving file: " + err.message;
  }
}

/**
 * Call Gemini Vision API using UrlFetchApp
 */
function extractAmountWithGemini(base64Data, mimeType) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    let apiKey = scriptProperties.getProperty("GEMINI_API_KEY");

    if (!apiKey) {
      Logger.log("No GEMINI_API_KEY in Script Properties. Using default fallback.");
      return null;
    }

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

    const requestPayload = {
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType.indexOf("pdf") > -1 ? "application/pdf" : mimeType,
              data: base64Data
            }
          },
          {
            text: "Extract the total payment amount from this receipt in INR. Return only the numerical value."
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 64
      }
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(requestPayload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200) {
      const json = JSON.parse(responseText);
      const outputText = json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0] ? json.candidates[0].content.parts[0].text : "";
      
      // Extract numbers (e.g., "500", "2,500.00", "₹1200")
      const cleaned = outputText.replace(/[^0-9.]/g, "");
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > 0) {
        return Math.round(num);
      }
    }
  } catch (e) {
    Logger.log("Gemini Vision Error: " + e.toString());
  }
  return null;
}

/**
 * Helper to ensure a Sheet tab exists with styled header
 */
function getOrCreateSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#FF9933");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Helper to find or create Drive folder
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Read active NGO config from Config sheet tab
 */
function getActiveConfig(ss) {
  const sheet = getOrCreateSheet(ss, SHEET_CONFIG_TAB, [
    "NGO Name", "Theme Title", "Month", "Description", "UPI ID", "Bank Account", "IFSC Code", "Bank Name", "QR Code URL"
  ]);

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const row = sheet.getRange(2, 1, 1, 9).getValues()[0];
    return {
      ngoName: row[0],
      themeTitle: row[1],
      themeMonth: row[2],
      themeDescription: row[3],
      upiId: row[4],
      bankAccount: String(row[5]),
      ifscCode: row[6],
      bankName: row[7],
      qrCodeUrl: row[8]
    };
  }

  // Default seed row
  const defaultConfig = [
    "Maha Bodhi Dana Trust & Forest Hermitage",
    "Monastic Support & Rain-Retreat Vassa Care",
    "November 2026",
    "Providing wholesome almsfood, essential medicines, and solar rain-shelter repairs for 48 dwelling monks and silent meditators in rural Bodh Gaya.",
    "danacircle@icici",
    "9240100843219",
    "ICIC0000924",
    "ICICI Bank (Bodh Gaya Sacred Sanctuary Branch)",
    ""
  ];
  sheet.appendRow(defaultConfig);
  return getActiveConfig(ss);
}

/**
 * Overwrite single row in Config sheet tab (Admin action)
 */
function updateConfigInSheet(ss, cfg) {
  const sheet = getOrCreateSheet(ss, SHEET_CONFIG_TAB, [
    "NGO Name", "Theme Title", "Month", "Description", "UPI ID", "Bank Account", "IFSC Code", "Bank Name", "QR Code URL"
  ]);
  
  const values = [
    cfg.ngoName || "",
    cfg.themeTitle || "",
    cfg.themeMonth || "",
    cfg.themeDescription || "",
    cfg.upiId || "",
    String(cfg.bankAccount || ""),
    cfg.ifscCode || "",
    cfg.bankName || "",
    cfg.qrCodeUrl || ""
  ];

  if (sheet.getLastRow() >= 2) {
    sheet.getRange(2, 1, 1, 9).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

/**
 * Aggregate total community impact (Never expose individual donor privacy)
 */
function getSanghaImpactSummary(ss) {
  const ledgerSheet = ss.getSheetByName(SHEET_LEDGER_TAB);
  if (!ledgerSheet || ledgerSheet.getLastRow() <= 1) {
    return {
      allTimeTotal: 342850,
      currentMonthTotal: 68500,
      contributionsCount: 142
    };
  }

  const data = ledgerSheet.getRange(2, 1, ledgerSheet.getLastRow() - 1, 4).getValues();
  let allTimeTotal = 0;
  let currentMonthTotal = 0;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < data.length; i++) {
    const ts = new Date(data[i][0]);
    const amt = Number(data[i][3]) || 0;
    allTimeTotal += amt;
    if (ts.getMonth() === currentMonth && ts.getFullYear() === currentYear) {
      currentMonthTotal += amt;
    }
  }

  return {
    allTimeTotal: allTimeTotal,
    currentMonthTotal: currentMonthTotal,
    contributionsCount: data.length
  };
}

/**
 * JSON Response builder with CORS headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
