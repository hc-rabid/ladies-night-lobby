# Quick Reference Card

## 🔗 Important URLs

### Your Website URLs (After Deployment)
```
Late Night (Public):  https://YOUR-DOMAIN/
VIP Dinner (Hidden):  https://YOUR-DOMAIN/vip.html
```

### Google Services
```
Google Sheets:        [Your Sheet URL]
Apps Script:          [Your Script URL]
```

---

## 📊 At-a-Glance Stats

### Current Capacity (Check Google Sheet > Capacity Tab)
```
6:00 PM:  [ __ / 20 ] guests
6:15 PM:  [ __ / 20 ] guests  
6:30 PM:  [ __ / 20 ] guests
```

### Total RSVPs (Check Google Sheets)
```
Late Night:  [ ___ ] reservations
VIP Dinner:  [ ___ ] reservations
Total:       [ ___ ] expected guests
```

---

## 🚀 Quick Commands

### View RSVPs
1. Open Google Sheets
2. Check tabs: LateNightRSVPs or VIPRSVPs

### Export Data
1. Open Google Sheet
2. File > Download > Microsoft Excel (.xlsx)

### Check Capacity
1. Open Google Sheet
2. Go to "Capacity" tab
3. See booked numbers for each time slot

### View Email Logs
1. Open Google Apps Script
2. Click "Executions"
3. Review sent emails and errors

---

## 🎨 Common Customizations

### Change Event Date
```
File: script.js (line 10) and vip-script.js (line 10)
Change: date: 'December 10, 2025'
```

### Change Event Time
```
File: script.js (line 11-12) and vip-script.js (line 11-14)
```

### Change Colors
```
File: styles.css (lines 10-18)
--primary-color: #1a1a1a
--secondary-color: #d4af37
--accent-color: #8b7355
```

### Update Location
```
Files: Both HTML files
Search for: "Lobby Hamilton, Hamilton, ON"
Replace with your location
```

---

## 🔧 Troubleshooting Quick Fixes

### RSVPs Not Recording
```
1. Check CONFIG object in script.js and vip-script.js
2. Verify Google Apps Script URL is correct
3. Test URL in browser (should return JSON)
```

### Emails Not Sending
```
1. Check spam/junk folder
2. Verify Gmail daily limit not exceeded (500/day)
3. Check Apps Script > Executions for errors
4. Confirm sender email is authorized
```

### Capacity Not Updating
```
1. Open Google Sheet
2. Verify "Capacity" tab exists
3. Check columns: Time Slot | Booked
4. Manually reset if needed
```

### Calendar Not Downloading
```
1. Disable popup blocker
2. Try different browser
3. Check browser console (F12) for errors
```

---

## 📧 Email Response Templates

### For Late Night Guests
```
Subject: Invitation to Ladies Night Launch

Hi [Name],

You're invited to the exclusive launch of Ladies Night 
at Lobby Hamilton!

📅 December 10th, 2025
⏰ 8:00 PM - Late
📍 Lobby Hamilton, Hamilton, ON

RSVP here: [YOUR-LATE-NIGHT-URL]

Looking forward to seeing you there!
```

### For VIP Guests
```
Subject: VIP Invitation - Ladies Night Launch

Hi [Name],

You've been selected for an exclusive VIP experience 
at the Ladies Night launch!

📅 December 10th, 2025
🍽️ Dinner: 6:00 PM - 8:00 PM
🎉 Social: 8:00 PM - Late
📍 Lobby Hamilton, Hamilton, ON

Reserve your spot: [YOUR-VIP-URL]

This is an exclusive invite - limited seating available.

See you there!
```

---

## 📱 Social Media Templates

### Instagram Caption (Late Night)
```
✨ You're invited! ✨

Join us for the launch of Ladies Night at Lobby Hamilton

📅 December 10th • 8 PM
📍 @lobbyhamilton

RSVP: [Link in bio]

#LadiesNight #HamiltonNightlife #LobbyHamilton
```

### Instagram Caption (VIP)
```
💎 VIP INVITATION 💎

You've been selected for an exclusive dinner + 
celebration for Ladies Night launch

📅 Dec 10 • Dinner 6-8PM • Social 8PM-Late
📍 @lobbyhamilton

Limited seating. RSVP: [Link in bio]

#VIPExperience #LadiesNight #HamiltonEvents
```

---

## 🎯 Day-of-Event Checklist

### Day Before (December 9th)
- [ ] Export final guest list from Google Sheets
- [ ] Send reminder emails to all confirmed guests
- [ ] Verify dinner seating arrangements
- [ ] Print guest list for check-in

### Day Of (December 10th)
- [ ] Print guest lists for door
- [ ] Have tablet/phone to check Google Sheet live
- [ ] Prepare check-in area
- [ ] Brief staff on VIP vs. regular guests

### Dinner Service (6:00-8:00 PM)
- [ ] Check guests in by time slot
- [ ] Note dietary restrictions
- [ ] Welcome VIP guests

### Late Night (8:00 PM - Late)
- [ ] Welcome all guests
- [ ] Check-in late night arrivals
- [ ] Enjoy the event!

---

## 📞 Emergency Contacts

```
Technical Issues:
- Google Support: https://support.google.com
- GitHub Support: https://support.github.com

Venue:
Lobby Hamilton: [PHONE NUMBER]

Event Coordinator:
[YOUR NAME]: [YOUR PHONE]
[YOUR EMAIL]
```

---

## 💾 Backup Procedures

### Before Event
1. Export Google Sheets to Excel
2. Save email list separately
3. Take screenshots of capacity tracker

### After Event
1. Archive all data
2. Save final guest count
3. Keep for future events

---

## 📈 Analytics to Track

### Pre-Event
- RSVPs per day
- Late Night vs. VIP ratio
- Most popular dinner time slot
- Solo vs. +1 percentage

### Post-Event
- Actual attendance vs. RSVPs
- No-show rate
- Guest feedback
- Photos/social media engagement

---

## 🔄 For Future Events

### Things to Update Next Time
```
1. Event dates (HTML files, JS files)
2. Event times
3. Create new Google Sheet
4. Update Google Apps Script URL
5. Reset capacity tracker
6. Test all functionality
```

### What to Keep the Same
```
✓ Design and layout
✓ Form structure
✓ Google Apps Script code
✓ Email templates (update dates only)
```

---

## 📝 Notes Section

```
_________________________________________

_________________________________________

_________________________________________

_________________________________________

_________________________________________
```

---

**Print this card and keep it handy! 📄**

Last Updated: [Today's Date]
Event Date: December 10, 2025
