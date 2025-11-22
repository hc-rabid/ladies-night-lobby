# Instagram Field Update Guide

## ✅ What Was Changed

An Instagram Username field has been added to both RSVP forms (Late Night and VIP) with automatic tracking.

## 📋 Updated Google Sheets Structure

### LateNightRSVPs Sheet
**NEW Headers (Row 1):**
```
Timestamp | Name | Email | Phone | Instagram | Guests | Event Type
```

### VIPRSVPs Sheet  
**NEW Headers (Row 1):**
```
Timestamp | Name | Email | Phone | Instagram | Guests | Dinner Time | Notes | Event Type
```

### Capacity Sheet (No Changes)
```
Time Slot | Booked
```

## 🔧 Required Google Sheets Update

**IMPORTANT:** You must update your Google Sheets headers to match the new structure!

### Step-by-Step:

1. **Open your Google Sheet:** Ladies Night RSVPs

2. **Update LateNightRSVPs tab:**
   - Click on cell E1
   - Type: `Instagram`
   - The headers should now read: Timestamp | Name | Email | Phone | **Instagram** | Guests | Event Type

3. **Update VIPRSVPs tab:**
   - Click on cell E1
   - Type: `Instagram`
   - The headers should now read: Timestamp | Name | Email | Phone | **Instagram** | Guests | Dinner Time | Notes | Event Type

4. **Save your sheet** (it auto-saves, but verify changes are there)

## ✨ New Features

### Form Field Added
- **Label:** "Instagram Username *"
- **Required:** Yes
- **Placeholder:** "@yourusername"
- **Auto-formatting:** Automatically adds @ if user forgets

### Validation
- Checks for valid Instagram username format
- Accepts alphanumeric characters, dots, and underscores
- Automatically adds @ symbol if not included
- Shows error if invalid format

### Email Confirmations
Both confirmation emails now include:
```
Instagram: @username
```

### Data Tracking
Instagram usernames are now captured in both Google Sheets with proper formatting

## 🧪 Testing the Update

After updating your Google Sheets headers:

1. **Test Late Night Form:**
   - Go to index.html
   - Fill out form with Instagram username (with or without @)
   - Submit
   - Check LateNightRSVPs sheet - Instagram should appear in column E
   - Check confirmation email - should show Instagram handle

2. **Test VIP Form:**
   - Go to vip.html  
   - Fill out form with Instagram username
   - Submit
   - Check VIPRSVPs sheet - Instagram should appear in column E
   - Check confirmation email - should show Instagram handle

## 📊 Visual Sheet Layout

### LateNightRSVPs
```
| A         | B    | C     | D     | E         | F      | G          |
|-----------|------|-------|-------|-----------|--------|------------|
| Timestamp | Name | Email | Phone | Instagram | Guests | Event Type |
|-----------|------|-------|-------|-----------|--------|------------|
| [data]    | ...  | ...   | ...   | @username | 2      | Late Night |
```

### VIPRSVPs
```
| A         | B    | C     | D     | E         | F      | G           | H     | I          |
|-----------|------|-------|-------|-----------|--------|-------------|-------|------------|
| Timestamp | Name | Email | Phone | Instagram | Guests | Dinner Time | Notes | Event Type |
|-----------|------|-------|-------|-----------|--------|-------------|-------|------------|
| [data]    | ...  | ...   | ...   | @username | 1      | 6:00 PM     | ...   | VIP Dinner |
```

## ⚠️ Important Notes

1. **Existing RSVPs:** If you already have RSVPs in your sheet, you'll need to insert a column:
   - Right-click on column E (Guests)
   - Select "Insert 1 column left"
   - Add "Instagram" header in the new column E

2. **Google Apps Script:** The `google-apps-script.js` has been updated to handle the new Instagram field. If you've already deployed, you'll need to:
   - Copy the updated `google-apps-script.js` code
   - Paste it in Apps Script editor (replacing old code)
   - Click Save
   - No need to redeploy - it will use the existing deployment

3. **Already Configured?** If you already have the CONFIG URLs set in `script.js` and `vip-script.js`, you're good to go! The URLs don't change.

## 🎯 Quick Checklist

- [ ] Google Sheets headers updated in LateNightRSVPs tab
- [ ] Google Sheets headers updated in VIPRSVPs tab  
- [ ] Google Apps Script code updated (if already deployed)
- [ ] Test submission on Late Night page
- [ ] Test submission on VIP page
- [ ] Verify Instagram appears in both sheets
- [ ] Check confirmation emails include Instagram

## 💡 Usage Tips

### For Guest Management
- Use Instagram handles to tag guests in event photos
- Build social media engagement list
- Follow up with influencers on Instagram
- Create custom Instagram story for attendees

### Exporting Data
When you export to Excel:
- Instagram column will include the @ symbol
- Easy to copy/paste for social media outreach
- Can use for creating Instagram Lists

## 🔄 If You Need to Revert

To remove the Instagram field:
1. Delete the Instagram column from both sheets
2. Use the original backup files (if you kept them)
3. Redeploy the original code

---

**Last Updated:** November 22, 2025  
**Change:** Added Instagram username field to both forms
