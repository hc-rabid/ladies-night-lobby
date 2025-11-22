# Quick Setup Guide

Follow these steps to get your Ladies Night RSVP website up and running:

## Step 1: Google Sheets Setup (15 minutes)

### 1.1 Create Your Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: "Ladies Night RSVPs - Lobby Hamilton"

### 1.2 Create Sheet Tabs
Create three tabs in your spreadsheet:

**Tab 1: LateNightRSVPs**
Add these headers in Row 1:
```
Timestamp | Name | Email | Phone | Guests | Event Type
```

**Tab 2: VIPRSVPs**
Add these headers in Row 1:
```
Timestamp | Name | Email | Phone | Guests | Dinner Time | Notes | Event Type
```

**Tab 3: Capacity**
Add these headers and data:
```
Time Slot | Booked
6:00 PM   | 0
6:15 PM   | 0
6:30 PM   | 0
```

### 1.3 Install Google Apps Script
1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code
3. Copy the ENTIRE contents of `google-apps-script.js` file
4. Paste it into the Apps Script editor
5. Click the Save icon (💾)
6. Name your project: "RSVP Handler"

### 1.4 Deploy as Web App
1. Click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure settings:
   - **Description:** "RSVP Handler"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** > **Go to RSVP Handler (unsafe)**
9. Click **Allow**
10. **COPY THE WEB APP URL** - you'll need this!

Example URL format:
```
https://script.google.com/macros/s/AKfycbx.../exec
```

## Step 2: Configure Website (5 minutes)

### 2.1 Update script.js
1. Open `script.js`
2. Find lines 2-5 (CONFIG object)
3. Replace both URLs with your Web App URL:

```javascript
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_WEB_APP_URL_HERE',
    EMAIL_SERVICE_URL: 'YOUR_WEB_APP_URL_HERE'
};
```

### 2.2 Update vip-script.js
1. Open `vip-script.js`
2. Find lines 2-5 (CONFIG object)
3. Replace both URLs with your Web App URL:

```javascript
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_WEB_APP_URL_HERE',
    EMAIL_SERVICE_URL: 'YOUR_WEB_APP_URL_HERE'
};
```

## Step 3: Deploy Website (10 minutes)

### Option A: GitHub Pages (Recommended)

1. **Create GitHub Account**
   - Go to [github.com](https://github.com) and sign up (if you don't have an account)

2. **Create New Repository**
   - Click the "+" icon > "New repository"
   - Name: `ladies-night-lobby`
   - Make it Public
   - Click "Create repository"

3. **Upload Files**
   - Click "uploading an existing file"
   - Drag and drop ALL your files:
     - index.html
     - vip.html
     - styles.css
     - script.js
     - vip-script.js
   - Click "Commit changes"

4. **Enable GitHub Pages**
   - Go to Settings > Pages
   - Under "Source", select "main" branch
   - Click Save
   - Wait 1-2 minutes

5. **Get Your URLs**
   - Late Night Page: `https://YOUR-USERNAME.github.io/ladies-night-lobby/`
   - VIP Page: `https://YOUR-USERNAME.github.io/ladies-night-lobby/vip.html`

### Option B: Netlify (Alternative)

1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up (free)
3. Drag your entire project folder to Netlify
4. Get your URLs immediately!

## Step 4: Test Everything (10 minutes)

### 4.1 Test Late Night Page
1. Open your late night page URL
2. Fill out the form with test data
3. Submit the form
4. Check:
   - ✅ Form submits successfully
   - ✅ Success message appears
   - ✅ Data appears in Google Sheet (LateNightRSVPs tab)
   - ✅ Confirmation email received
   - ✅ Calendar buttons work

### 4.2 Test VIP Page
1. Open your VIP page URL (add /vip.html to your domain)
2. Fill out the form with test data
3. Select a dinner time (e.g., 6:00 PM)
4. Submit the form
5. Check:
   - ✅ Form submits successfully
   - ✅ Success message shows reservation details
   - ✅ Data appears in Google Sheet (VIPRSVPs tab)
   - ✅ Capacity sheet updates (Booked count increases)
   - ✅ Confirmation email received with dinner details
   - ✅ Calendar buttons work with specific dinner time

### 4.3 Test Capacity Limits
1. Submit multiple VIP reservations for the same time slot
2. Verify capacity tracking:
   - After 20 guests total, time slot should show "FULL"
   - Time slot should be disabled in dropdown
3. Other time slots should still be available

## Step 5: Share Your Links

### For Late Night Guests
Send them: `your-domain.com` or `your-domain.com/index.html`

### For VIP Dinner Guests
Send them: `your-domain.com/vip.html` or `your-domain.com/vip`

## Troubleshooting

### "RSVP not submitting"
- Check browser console (F12) for errors
- Verify Web App URL is correct in both .js files
- Make sure Apps Script deployment is set to "Anyone"

### "Email not received"
- Check spam/junk folder
- Verify Gmail sending limits (500/day)
- Check Google Apps Script logs for errors

### "Capacity not updating"
- Verify Capacity sheet exists in Google Sheets
- Check Apps Script execution logs
- Manually verify the updateCapacity function

### "Calendar downloads not working"
- Disable popup blockers
- Try different browser
- Check browser console for errors

## Customization Tips

### Change Colors
Edit `styles.css` lines 10-18:
```css
:root {
    --primary-color: #1a1a1a;      /* Main dark color */
    --secondary-color: #d4af37;     /* Gold accent */
    --accent-color: #8b7355;        /* Brown accent */
}
```

### Change Event Details
- Late night: Edit `script.js` lines 8-15
- VIP: Edit `vip-script.js` lines 8-17

### Update Logo
Replace "LOBBY HAMILTON" text in both HTML files with your logo image or custom text.

## Need Help?

1. Check the browser console for error messages (Press F12)
2. Review Google Apps Script execution logs
3. Verify all URLs are correctly configured
4. Test with different browsers

## Security Notes

- VIP page is hidden by URL only (not password protected)
- Consider adding password protection for extra security
- All data is stored in YOUR private Google Sheet
- Use HTTPS for all deployments (automatic with GitHub Pages/Netlify)

---

**Estimated Total Setup Time: 40 minutes**

Once configured, your RSVP system will:
- ✅ Automatically collect RSVPs in Google Sheets
- ✅ Send confirmation emails instantly
- ✅ Track dinner time slot capacity
- ✅ Allow guests to add events to their calendars
- ✅ Work on all devices (mobile-responsive)
