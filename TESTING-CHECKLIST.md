# Testing Checklist

Use this checklist to ensure everything works perfectly before going live.

## Pre-Launch Testing

### ✅ Configuration Verification

- [ ] Google Apps Script URL updated in `script.js`
- [ ] Google Apps Script URL updated in `vip-script.js`
- [ ] Google Sheets created with correct tab names:
  - [ ] LateNightRSVPs
  - [ ] VIPRSVPs
  - [ ] Capacity
- [ ] Google Sheets headers match the template
- [ ] Google Apps Script deployed as Web App
- [ ] Apps Script permissions set to "Anyone"

---

## Late Night Page Testing (index.html)

### Form Validation
- [ ] Submit empty form → Shows validation errors
- [ ] Enter invalid email → Shows error
- [ ] Enter invalid phone → Shows error
- [ ] Enter short name → Shows error
- [ ] All validations show clear error messages

### Form Submission
- [ ] Fill out complete form
- [ ] Click "Confirm RSVP"
- [ ] Button shows loading state
- [ ] Success message appears
- [ ] Form hides after submission

### Data Recording
- [ ] Open Google Sheets
- [ ] Check LateNightRSVPs tab
- [ ] New row appears with correct data:
  - [ ] Timestamp is correct
  - [ ] Name is correct
  - [ ] Email is correct
  - [ ] Phone is correct
  - [ ] Guest count is correct
  - [ ] Event Type = "Late Night Mingle"

### Email Confirmation
- [ ] Check email inbox
- [ ] Confirmation email received
- [ ] Email contains correct event details:
  - [ ] Name is personalized
  - [ ] Date: December 10, 2025
  - [ ] Time: 8:00 PM - Late
  - [ ] Location: Lobby Hamilton
  - [ ] Guest count is correct
- [ ] Email is well-formatted (not broken HTML)
- [ ] Check spam folder if not in inbox

### Calendar Integration
- [ ] Click "Apple Calendar" button
- [ ] .ics file downloads
- [ ] Open .ics file
- [ ] Event details are correct:
  - [ ] Title: Ladies Night Launch - Late Night Mingle
  - [ ] Date: December 10, 2025
  - [ ] Time: 8:00 PM - 12:00 AM
  - [ ] Location: Lobby Hamilton
- [ ] Click "Google Calendar" button
- [ ] Opens in new tab
- [ ] Pre-filled with correct details
- [ ] Can save to Google Calendar

### Mobile Testing
- [ ] Open on mobile device
- [ ] Page displays correctly
- [ ] Form is easy to fill out
- [ ] Buttons are easy to tap
- [ ] Success message displays properly
- [ ] Calendar buttons work on mobile

---

## VIP Page Testing (vip.html)

### Page Access
- [ ] Direct URL works (yourdomain.com/vip.html)
- [ ] Page loads correctly
- [ ] VIP badge displays properly

### Form Validation
- [ ] Submit empty form → Shows validation errors
- [ ] Submit without dinner time → Shows error
- [ ] All standard validations work (email, phone, name)

### Dinner Time Slot Selection
- [ ] Dropdown shows all three time slots:
  - [ ] 6:00 PM
  - [ ] 6:15 PM
  - [ ] 6:30 PM
- [ ] Select each time slot
- [ ] Capacity info updates below dropdown
- [ ] Shows "X of 20 spots remaining"

### Form Submission
- [ ] Fill out complete form including notes
- [ ] Select dinner time
- [ ] Click "Confirm RSVP"
- [ ] Button shows loading state
- [ ] Success message appears
- [ ] Reservation details display:
  - [ ] Shows selected dinner time
  - [ ] Shows guest count
  - [ ] Shows date and location

### Data Recording
- [ ] Open Google Sheets
- [ ] Check VIPRSVPs tab
- [ ] New row appears with all data:
  - [ ] Timestamp
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Guest count
  - [ ] Dinner time
  - [ ] Notes (if entered)
  - [ ] Event Type = "VIP Dinner + Social"

### Capacity Tracking
- [ ] Check Capacity tab in Google Sheets
- [ ] Find row for selected time slot
- [ ] "Booked" number increased by guest count
- [ ] Reload VIP page
- [ ] Check time slot dropdown
- [ ] Available spots decreased correctly
- [ ] Shows updated availability

### Capacity Limit Testing
- [ ] Submit multiple RSVPs for same time slot
- [ ] Continue until 20 guests booked
- [ ] Reload page
- [ ] Check that time slot shows "FULL"
- [ ] Try to select it → Should be disabled
- [ ] Other time slots still available

### Email Confirmation
- [ ] Check email inbox
- [ ] VIP confirmation email received
- [ ] Email has VIP branding
- [ ] Email contains:
  - [ ] Personalized name
  - [ ] Confirmed dinner time
  - [ ] Dinner service: 6:00 PM - 8:00 PM
  - [ ] Social event: 8:00 PM - Late
  - [ ] Guest count
  - [ ] Special requests (if entered)
  - [ ] Arrival instructions
- [ ] Email is well-formatted

### Calendar Integration (VIP)
- [ ] Click "Apple Calendar"
- [ ] .ics file downloads with dinner time in filename
- [ ] Open .ics file
- [ ] Event shows correct dinner time as start
- [ ] Event title includes "VIP Dinner"
- [ ] Description mentions dinner time
- [ ] Click "Google Calendar"
- [ ] Opens with dinner time as start time
- [ ] Event goes until midnight
- [ ] All details correct

### Mobile Testing (VIP)
- [ ] Test on mobile device
- [ ] VIP badge displays correctly
- [ ] Dinner time dropdown works
- [ ] Notes textarea is usable
- [ ] All functionality works on mobile

---

## Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

### Mobile Browsers
- [ ] iOS Safari: All features work
- [ ] Android Chrome: All features work
- [ ] Mobile design is responsive

---

## Load Testing

### Multiple Simultaneous RSVPs
- [ ] Have 3-5 people submit at same time
- [ ] All submissions recorded
- [ ] No data conflicts
- [ ] Capacity tracking accurate
- [ ] All emails sent

---

## Error Handling

### Network Issues
- [ ] Disable internet mid-submission
- [ ] Appropriate error message shows
- [ ] Form data not lost
- [ ] User can retry

### Invalid Data
- [ ] Try submitting with missing fields
- [ ] Clear error messages appear
- [ ] Form doesn't submit until valid
- [ ] No console errors

### Google Sheets Issues
- [ ] Temporarily break Google Script URL
- [ ] Error message displays
- [ ] User isn't left hanging
- [ ] Fix URL and retry works

---

## Final Pre-Launch Checks

### Content Review
- [ ] All text is spelled correctly
- [ ] Event dates are correct
- [ ] Times are correct (8 PM for late night, 6-8 PM for dinner)
- [ ] Location is correct
- [ ] Contact information is included (if applicable)

### Links and URLs
- [ ] Late night page URL is correct
- [ ] VIP page URL is correct
- [ ] Both URLs are shareable
- [ ] URLs are easy to type/remember

### Google Apps Script
- [ ] Script is deployed and active
- [ ] Execution logs show no errors
- [ ] Test submissions appear in logs
- [ ] Email sending works consistently

### Documentation
- [ ] Setup guide is clear
- [ ] README has all necessary info
- [ ] Instructions match actual setup
- [ ] Support/contact info included

---

## Post-Launch Monitoring

### First 24 Hours
- [ ] Check Google Sheets regularly
- [ ] Monitor for any error patterns
- [ ] Verify all emails being sent
- [ ] Check capacity tracking accuracy

### Ongoing
- [ ] Monitor capacity approaching limits
- [ ] Check for any user-reported issues
- [ ] Ensure emails aren't going to spam
- [ ] Track RSVP numbers

---

## Emergency Contacts

**If something breaks:**

1. Check Google Apps Script execution logs
2. Verify deployment is still active
3. Check Google Sheets permissions
4. Test with different browser
5. Review browser console errors

**Quick Fixes:**

- RSVPs not recording → Check Apps Script URL in .js files
- Emails not sending → Check Gmail sending limits (500/day)
- Capacity not updating → Check Capacity sheet exists and has correct format
- Form not submitting → Check browser console for JavaScript errors

---

## Sign-Off

Once all items are checked:

- [ ] All late night page tests passed
- [ ] All VIP page tests passed
- [ ] Mobile testing completed
- [ ] Cross-browser testing done
- [ ] Load testing successful
- [ ] Ready for launch! 🚀

**Tested by:** _________________

**Date:** _________________

**Notes:**
_________________________________
_________________________________
_________________________________
