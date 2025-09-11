# HappyWeds — GitHub Pages + Google Drive (Apps Script)

Static frontend on **GitHub Pages**, serverless backend on **Google Apps Script** saving uploads to **Google Drive**.

## 1) Backend (Apps Script)
- Create a Drive folder (e.g., “HappyWeds Uploads”), copy its **Folder ID**.
- In [script.google.com](https://script.google.com), create a new project and paste `apps-script/Code.gs`.
- Set `FOLDER_ID` and `ADMIN_TOKEN` in the script.
- (Optional) enable Advanced Drive API in **Services** for `thumbnailLink`.
- **Deploy** → **Web app** → Execute as **Me**, Who has access **Anyone**.
- Copy the **Web App URL**.

## 2) Frontend (this repo)
Edit `js/config.js`:
```js
window.HW_CONFIG = {
  WEB_APP_URL: 'https://script.google.com/macros/s/.../exec',
  ADMIN_TOKEN: 'same-secret-as-in-Apps-Script'
};
