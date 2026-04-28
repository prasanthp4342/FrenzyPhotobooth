/**
 * Google Apps Script — Photobooth Website Contact Form Backend
 *
 * SETUP:
 * 1. Go to https://script.google.com and create a new project.
 * 2. Replace the default Code.gs content with this file.
 * 3. Create (or open) a Google Sheet — the script will append rows to the active sheet.
 * 4. Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Set NOTIFICATION_EMAIL below to your inbox.
 * 6. Copy the deployment URL and paste it into js/config/integrations.ts as GOOGLE_APPS_SCRIPT_URL.
 */

var NOTIFICATION_EMAIL = 'prasanthp4342@gmail.com';
var SHEET_ID = 'YOUR_GOOGLESHEET_ID';
var SHEET_NAME = ''; // optional: set a tab name, else first sheet is used
var BUSINESS_TIMEZONE = 'America/Denver';
var MAX_FIELD_LENGTH = 1000;
var TURNSTILE_SECRET_KEY = 'YOUR_TURNSTILE_SECRET_KEY';
var MAX_REQUESTS_PER_MINUTE = 30;
var PER_CONTACT_COOLDOWN_SECONDS = 60;

function sanitizeInput(value) {
  var text = (value || '').toString().trim();
  if (text.length > MAX_FIELD_LENGTH) {
    text = text.slice(0, MAX_FIELD_LENGTH);
  }
  return text;
}

function sanitizeForSheetCell(value) {
  var text = sanitizeInput(value);
  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }
  return text;
}

function enforceRateLimit(email, phone) {
  var cache = CacheService.getScriptCache();
  var contactKey = 'rl:contact:' + email.toLowerCase() + ':' + phone;
  if (cache.get(contactKey)) {
    throw new Error('Too many requests. Please wait before submitting again.');
  }
  cache.put(contactKey, '1', PER_CONTACT_COOLDOWN_SECONDS);

  var minuteBucket = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHHmm');
  var globalKey = 'rl:global:' + minuteBucket;
  var lock = LockService.getScriptLock();
  lock.waitLock(3000);
  try {
    var count = parseInt(cache.get(globalKey) || '0', 10) + 1;
    cache.put(globalKey, String(count), 60);
    if (count > MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Too many requests right now. Please try again later.');
    }
  } finally {
    lock.releaseLock();
  }
}

function verifyTurnstileToken(token) {
  if (!TURNSTILE_SECRET_KEY || TURNSTILE_SECRET_KEY === 'YOUR_TURNSTILE_SECRET_KEY') {
    throw new Error('Turnstile secret key is not configured.');
  }
  if (!token) return false;

  var response = UrlFetchApp.fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'post',
      payload: {
        secret: TURNSTILE_SECRET_KEY,
        response: token,
      },
      muteHttpExceptions: true,
    },
  );

  if (response.getResponseCode() !== 200) return false;
  var data = JSON.parse(response.getContentText() || '{}');
  return !!data.success;
}

function getTargetSheet() {
  if (SHEET_ID && SHEET_ID !== 'PASTE_GOOGLE_SHEET_ID_HERE') {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    if (SHEET_NAME) {
      var namedSheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!namedSheet) {
        throw new Error('Sheet tab not found: ' + SHEET_NAME);
      }
      return namedSheet;
    }
    return spreadsheet.getSheets()[0];
  }

  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSpreadsheet) {
    throw new Error('No active spreadsheet found. Set SHEET_ID for standalone deployments.');
  }
  if (SHEET_NAME) {
    var activeNamedSheet = activeSpreadsheet.getSheetByName(SHEET_NAME);
    if (!activeNamedSheet) {
      throw new Error('Sheet tab not found: ' + SHEET_NAME);
    }
    return activeNamedSheet;
  }
  return activeSpreadsheet.getActiveSheet();
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'Photobooth form backend is running.' }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse((e.postData && e.postData.contents) || '{}');
    var name = sanitizeInput(data.name);
    var email = sanitizeInput(data.email);
    var phone = sanitizeInput(data.phone);
    var eventDate = sanitizeInput(data.eventDate);
    var message = sanitizeInput(data.message);
    var turnstileToken = sanitizeInput(data.turnstileToken);

    if (!name || !email || !phone || !eventDate || !message) {
      throw new Error(
        'Missing required fields: name, email, phone, eventDate, and message are required.',
      );
    }
    if (!verifyTurnstileToken(turnstileToken)) {
      throw new Error('Security verification failed.');
    }
    enforceRateLimit(email, phone);

    var sheet = getTargetSheet();
    var timestamp = Utilities.formatDate(
      new Date(),
      BUSINESS_TIMEZONE,
      'yyyy-MM-dd HH:mm:ss z',
    );

    sheet.appendRow([
      sanitizeForSheetCell(name),
      sanitizeForSheetCell(email),
      sanitizeForSheetCell(phone),
      sanitizeForSheetCell(eventDate),
      sanitizeForSheetCell(message),
      timestamp,
    ]);

    if (NOTIFICATION_EMAIL && NOTIFICATION_EMAIL !== 'you@example.com') {
      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: 'New Frenzy Photobooth Inquiry: ' + name,
        htmlBody:
          '<h3>New Contact Form Submission</h3>' +
          '<p><b>Name:</b> ' + name + '</p>' +
          '<p><b>Email:</b> ' + email + '</p>' +
          '<p><b>Phone:</b> ' + phone + '</p>' +
          '<p><b>Event Date:</b> ' + eventDate + '</p>' +
          '<p><b>Message:</b><br>' + message.replace(/\n/g, '<br>') + '</p>' +
          '<p><b>Submitted At:</b> ' + timestamp + '</p>',
        replyTo: email,
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok', message: 'Submission received.' }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
