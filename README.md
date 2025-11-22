# Ladies Night at Lobby Hamilton - RSVP Website

A sophisticated dual-page invitation system for the Ladies Night launch event at Lobby Hamilton, featuring separate RSVP pages for late night mingle and VIP dinner guests.

## 🎯 Features

### Two Distinct Pages
- **Public Page** (`index.html`): Late Night Mingle event starting at 8 PM
- **VIP Page** (`vip.html`): Exclusive dinner (6-8 PM) + late night social event

### Core Functionality
- ✅ Beautiful, clean design with elegant styling
- ✅ Mobile-responsive layout
- ✅ Form validation with real-time feedback
- ✅ Google Sheets integration for RSVP tracking
- ✅ Automatic email confirmations
- ✅ Calendar integration (Apple & Google Calendar)
- ✅ Time slot capacity management (VIP only - 20 guests per slot)
- ✅ Dynamic time slot availability updates

## 📋 Setup Instructions

### 1. Google Sheets Setup

#### Create Your Spreadsheets
You'll need two separate Google Sheets:

1. **Late Night RSVPs Sheet**
2. **VIP RSVPs Sheet**

#### Sheet Columns

**Late Night RSVPs:**
- Timestamp
- Name
- Email
- Phone
- Number of Guests
- Event Type

**VIP RSVPs:**
- Timestamp
- Name
- Email
- Phone
- Number of Guests
- Dinner Time
- Notes
- Event Type

#### Google Apps Script Setup

1. Open your Google Sheet
2. Go to **Extensions** > **Apps Script**
3. Delete any existing code and paste the following:

```javascript
// Google Apps Script for RSVP Management

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheet);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const row = [
      data.data.timestamp,
      data.data.name,
      data.data.email,
      data.data.phone,
      data.data.guests,
      data.data.dinnerTime || 'N/A',
      data.data.notes || 'N/A',
      data.data.eventType
    ];
    
    sheet.appendRow(row);
    
    // Update capacity tracking for VIP reservations
    if (data.sheet === 'VIPRSVPs' && data.data.dinnerTime) {
      updateCapacity(data.data.dinnerTime, parseInt(data.data.guests));
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'RSVP recorded successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e.parameter.action === 'getCapacity') {
    const capacity = getCapacity();
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      capacity: capacity
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getCapacity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let capacitySheet = ss.getSheetByName('Capacity');
  
  if (!capacitySheet) {
    capacitySheet = ss.insertSheet('Capacity');
    capacitySheet.appendRow(['Time Slot', 'Booked']);
    capacitySheet.appendRow(['6:00 PM', 0]);
    capacitySheet.appendRow(['6:15 PM', 0]);
    capacitySheet.appendRow(['6:30 PM', 0]);
  }
  
  const data = capacitySheet.getDataRange().getValues();
  const capacity = {};
  
  for (let i = 1; i < data.length; i++) {
    capacity[data[i][0]] = {
      capacity: 20,
      booked: data[i][1]
    };
  }
  
  return capacity;
}

function updateCapacity(timeSlot, guestCount) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let capacitySheet = ss.getSheetByName('Capacity');
  
  if (!capacitySheet) {
    capacitySheet = ss.insertSheet('Capacity');
    capacitySheet.appendRow(['Time Slot', 'Booked']);
    capacitySheet.appendRow(['6:00 PM', 0]);
    capacitySheet.appendRow(['6:15 PM', 0]);
    capacitySheet.appendRow(['6:30 PM', 0]);
  }
  
  const data = capacitySheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === timeSlot) {
      const currentBooked = data[i][1];
      capacitySheet.getRange(i + 1, 2).setValue(currentBooked + guestCount);
      break;
    }
  }
}
```

4. Click **Deploy** > **New deployment**
5. Choose **Web app** as deployment type
6. Configure:
   - Description: "RSVP Handler"
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**
8. Copy the **Web app URL** - you'll need this for your website configuration

### 2. Email Service Setup

You can use the same Google Apps Script for email sending, or use a service like SendGrid, Mailgun, or EmailJS.

#### Option A: Google Apps Script (Recommended for simplicity)

Add this function to your Apps Script:

```javascript
function sendEmail(recipient, subject, htmlBody) {
  GmailApp.sendEmail(recipient, subject, '', {
    htmlBody: htmlBody
  });
}

// Modify doPost to include email sending
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ... existing sheet code ...
    
    // Send confirmation email
    if (data.emailData) {
      sendEmail(data.emailData.to, data.emailData.subject, data.emailData.html);
    }
    
    // ... rest of function ...
  } catch (error) {
    // ... error handling ...
  }
}
```

#### Option B: EmailJS (Free tier available)

1. Sign up at [EmailJS.com](https://www.emailjs.com/)
2. Create an email service
3. Create email templates for both event types
4. Get your Service ID, Template IDs, and Public Key
5. Update the email configuration in the JavaScript files

### 3. Website Configuration

#### Update Configuration URLs

In both `script.js` and `vip-script.js`, update the CONFIG object:

```javascript
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_DEPLOYED_WEB_APP_URL_HERE',
    EMAIL_SERVICE_URL: 'YOUR_DEPLOYED_WEB_APP_URL_HERE' // Or separate email service URL
};
```

### 4. Deployment

#### Option A: GitHub Pages (Free & Easy)

1. Create a GitHub repository
2. Push your files to the repository
3. Go to Settings > Pages
4. Select main branch as source
5. Your site will be available at: `https://yourusername.github.io/repository-name/`
6. Access VIP page at: `https://yourusername.github.io/repository-name/vip.html`

#### Option B: Netlify (Free & Easy)

1. Sign up at [Netlify](https://www.netlify.com/)
2. Drag and drop your project folder
3. Your site will be deployed with a custom URL
4. Configure custom domain if desired

#### Option C: Custom Domain/Hosting

Upload files to your web hosting service:
- Main page: `yourdomain.com` → `index.html`
- VIP page: `yourdomain.com/vip` → `vip.html`

### 5. Testing

Before going live:

1. **Test Late Night Page**:
   - Fill out form with test data
   - Verify submission appears in Google Sheet
   - Check email confirmation is received
   - Test calendar downloads (both Apple and Google)

2. **Test VIP Page**:
   - Test each time slot selection
   - Verify capacity tracking updates
   - Test notes field
   - Verify separate Google Sheet receives data
   - Check email with dinner details
   - Test calendar downloads with specific dinner time

3. **Mobile Testing**:
   - Test on various mobile devices
   - Verify responsive design works properly

## 🎨 Customization

### Colors
Edit `styles.css` to change the color scheme:

```css
:root {
    --primary-color: #1a1a1a;      /* Main dark color */
    --secondary-color: #d4af37;     /* Gold accent */
    --accent-color: #8b7355;        /* Brown accent */
}
```

### Event Details
Update event information in the JavaScript files:

- **script.js**: Lines 8-15 (Late night event details)
- **vip-script.js**: Lines 8-17 (VIP event details)

### Logo/Branding
Replace "LOBBY HAMILTON" in both HTML files with your logo or updated text.

## 📊 Tracking RSVPs

### Google Sheets Access
- **Late Night Sheet**: Track all late night mingle RSVPs
- **VIP Sheet**: Track all dinner + social RSVPs with time slots and notes
- **Capacity Sheet**: Automatically tracks dinner time slot availability

### Export Data
You can export your Google Sheets data at any time:
- File > Download > CSV or Excel

## 🔒 Security Notes

- The VIP page (`vip.html`) is "hidden" by URL only
- Consider adding password protection for true security
- Google Sheets data is private to your Google account
- Use HTTPS for all deployments (automatic with GitHub Pages/Netlify)

## 📱 Features Breakdown

### Late Night Page (index.html)
- Event details section
- RSVP form (name, email, phone, guest count)
- Email confirmation
- Calendar integration for 8 PM - 12 AM event

### VIP Page (vip.html)
- VIP-branded event details
- Extended RSVP form including:
  - Dinner time slot selection (6:00, 6:15, 6:30 PM)
  - Real-time capacity tracking
  - Notes/dietary restrictions field
- Time-specific calendar entries
- Separate Google Sheet tracking

## 🛠️ Troubleshooting

### RSVPs Not Submitting
- Check browser console for errors
- Verify Google Apps Script URL is correct
- Ensure Apps Script deployment is set to "Anyone"

### Emails Not Sending
- Check Gmail sending limits (500 per day)
- Verify email service configuration
- Check spam folder

### Capacity Not Updating
- Verify "Capacity" sheet exists in Google Sheets
- Check Apps Script has proper permissions
- Manually verify capacity sheet structure

### Calendar Downloads Not Working
- Ensure popup blockers are disabled
- Test in different browsers
- Verify date format is correct

## 📞 Support

For technical issues or questions:
1. Check browser console for error messages
2. Verify all configuration URLs are correct
3. Test Google Apps Script independently
4. Check Google Sheets permissions

## 📄 License

This project is provided as-is for your event management needs. Feel free to customize and modify as needed.

---

**Built with ❤️ for Lobby Hamilton's Ladies Night Launch Event**
