import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js';

async function initializeAnalytics() {
  try {
    if (!await isSupported()) {
      console.warn('Firebase Analytics is not supported in this browser.');
      return;
    }

    const app = initializeApp(JSON.parse(atob('eyJhcGlLZXkiOiJBSXphU3lDRjJ3dzhQak1MOUh6NUdnRnoxOWR5TEY4NzliYi1TN2siLCJwcm9qZWN0SWQiOiJlY2Vtb3pkb2dhbi0xYWNhZSIsImFwcElkIjoiMToyMzAxMTkyMTQxNjc6d2ViOmU5NTFjNTFhYTQzYmEwNzYyNmU3MTIiLCJtZWFzdXJlbWVudElkIjoiRy1YOUc0NlpGNUdLIn0=')));
    getAnalytics(app);
  } catch (error) {
    console.error('Firebase Analytics could not be initialized.', error);
  }
}

initializeAnalytics();
