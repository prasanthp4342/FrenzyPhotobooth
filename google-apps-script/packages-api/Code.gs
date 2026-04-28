/**
 * Google Apps Script — Packages API
 *
 * Returns photo booth package data as JSON, including Google Drive image URLs.
 * Images are looked up dynamically by filename from a shared Drive folder,
 * so you can replace images without changing any code.
 *
 * SETUP:
 * 1. Go to https://script.google.com and create a new project.
 * 2. Replace the default Code.gs content with this file.
 * 3. Create a Google Drive folder for package images.
 *    - Share the folder: "Anyone with the link" → Viewer.
 *    - Upload images named: basic.png, advanced.png, premier.png
 *      (any image format works — just update the names below to match).
 * 4. Replace FOLDER_ID below with your folder's ID
 *    (the long string in the folder's URL after /folders/).
 * 5. Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the deployment URL into js/config.js as PACKAGES_API_URL.
 *
 * To update an image: just replace the file in the folder (keep the same name).
 * The API will automatically serve the latest version.
 */

var FOLDER_ID = 'YOUR_FOLDER_ID';

function getImageUrl(fileName) {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    var file = files.next();
    return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w800';
  }
  return '';
}

function doGet() {
  var packages = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for small gatherings and intimate celebrations.',
      price: '$299',
      features: ['2 hours', 'Unlimited prints', 'Digital gallery', 'Standard props'],
      imageUrl: getImageUrl('basic.png'),
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'Great for medium events like birthdays and corporate parties.',
      price: '$499',
      features: ['4 hours', 'Unlimited prints', 'Premium props', 'Digital gallery', 'Custom backdrop'],
      imageUrl: getImageUrl('advanced.png'),
    },
    {
      id: 'premier',
      name: 'Premier',
      description: 'The ultimate experience for weddings and large events.',
      price: '$799',
      features: ['6 hours', 'Unlimited prints', 'Premium props', '360° video booth', 'Digital gallery', 'Custom branding', 'On-site attendant'],
      imageUrl: getImageUrl('premier.png'),
    },
  ];

  return ContentService.createTextOutput(JSON.stringify({ packages: packages })).setMimeType(
    ContentService.MimeType.JSON,
  );
}
