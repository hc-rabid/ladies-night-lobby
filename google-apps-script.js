/**
 * Google Apps Script for Ladies Night RSVP Management
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with two tabs: "LateNightRSVPs" and "VIPRSVPs"
 * 2. Add headers to each sheet:
 *    - LateNightRSVPs: Timestamp | Name | Email | Phone | Instagram | Guests | Event Type
 *    - VIPRSVPs: Timestamp | Name | Email | Phone | Instagram | Guests | Dinner Time | Notes | Event Type
 * 3. Copy this entire script to your Google Apps Script editor
 * 4. Deploy as Web App with "Anyone" access
 * 5. Copy the Web App URL to your script.js and vip-script.js files
 */

// Helper function to get next Wednesday
function getNextWednesday() {
  const today = new Date();
  const day = today.getDay();
  const daysUntilWednesday = (3 - day + 7) % 7 || 7; // 3 = Wednesday
  const nextWed = new Date(today);
  nextWed.setDate(today.getDate() + daysUntilWednesday);
  return nextWed;
}

// Helper function to format date for emails
function formatEventDate(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  
  // Add ordinal suffix (st, nd, rd, th)
  let suffix = 'th';
  if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = 'st';
  else if (dayNum === 2 || dayNum === 22) suffix = 'nd';
  else if (dayNum === 3 || dayNum === 23) suffix = 'rd';
  
  return `${dayName}, ${monthName} ${dayNum}${suffix}, ${year}`;
}

// Handle POST requests (form submissions)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Handle form submission
    if (data.sheet && data.data) {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheet);
      
      if (!sheet) {
        return createResponse('error', 'Sheet not found: ' + data.sheet);
      }
      
      // Format guests info as a string
      let guestsInfo = '';
      if (data.data.guests && data.data.guests.length > 0) {
        guestsInfo = data.data.guests.map((g, i) => {
          let info = `Guest ${i + 1}: ${g.name}`;
          if (g.email) info += ` (${g.email})`;
          if (g.phone) info += ` | ${g.phone}`;
          if (g.instagram) info += ` | ${g.instagram}`;
          return info;
        }).join('; ');
      }
      
      // Prepare row data based on sheet type
      let row;
      if (data.sheet === 'VIPRSVPs') {
        row = [
          data.data.timestamp,
          data.data.name,
          data.data.email,
          data.data.phone,
          data.data.instagram || 'N/A',
          data.data.totalGuests || 1,
          guestsInfo || 'No additional guests',
          data.data.dinnerTime || 'N/A',
          data.data.notes || '',
          data.data.eventType
        ];
        
        // Update capacity for VIP reservations
        if (data.data.dinnerTime) {
          updateCapacity(data.data.dinnerTime, parseInt(data.data.totalGuests || 1));
        }
      } else {
        row = [
          data.data.timestamp,
          data.data.name,
          data.data.email,
          data.data.phone,
          data.data.instagram || 'N/A',
          data.data.totalGuests || 1,
          guestsInfo || 'No additional guests',
          data.data.eventType
        ];
      }
      
      sheet.appendRow(row);
      
      // Send confirmation email
      if (data.data.email && data.data.name) {
        sendConfirmationEmail(data.data, data.sheet);
      }
      
      return createResponse('success', 'RSVP recorded successfully');
    }
    
    // Handle email sending
    if (data.to && data.subject && data.html) {
      GmailApp.sendEmail(data.to, data.subject, '', {
        htmlBody: data.html
      });
      return createResponse('success', 'Email sent successfully');
    }
    
    return createResponse('error', 'Invalid request format');
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse('error', error.toString());
  }
}

// Handle GET requests (capacity check and data fetching)
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getCapacity') {
      const capacity = getCapacity();
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        capacity: capacity
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getVIPRSVPs') {
      const data = getRSVPData('VIPRSVPs');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: data
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getSocialRSVPs') {
      const data = getRSVPData('LateNightRSVPs');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: data
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return createResponse('error', 'Invalid action');
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createResponse('error', error.toString());
  }
}

// Get RSVP data from a specific sheet
function getRSVPData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return []; // No data (only headers)
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  // Convert to array of objects
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.toLowerCase().replace(/\s+/g, '')] = row[index];
    });
    return obj;
  });
}

// Get current capacity for all time slots
function getCapacity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let capacitySheet = ss.getSheetByName('Capacity');
  
  // Create capacity sheet if it doesn't exist
  if (!capacitySheet) {
    capacitySheet = ss.insertSheet('Capacity');
    capacitySheet.appendRow(['Time Slot', 'Booked']);
    
    // Add time slots with text formatting to prevent date conversion
    const timeSlots = [
      ['6:00 PM', 0],
      ['6:15 PM', 0],
      ['6:30 PM', 0]
    ];
    
    timeSlots.forEach((slot, index) => {
      capacitySheet.getRange(index + 2, 1).setNumberFormat('@STRING@'); // Force text format
      capacitySheet.getRange(index + 2, 1).setValue(slot[0]);
      capacitySheet.getRange(index + 2, 2).setValue(slot[1]);
    });
  }
  
  const data = capacitySheet.getDataRange().getValues();
  const capacity = {};
  
  for (let i = 1; i < data.length; i++) {
    // Convert date objects to time string if needed
    let timeSlot = data[i][0];
    if (timeSlot instanceof Date) {
      const hours = timeSlot.getHours();
      const mins = timeSlot.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMins = mins.toString().padStart(2, '0');
      timeSlot = `${displayHours}:${displayMins} ${ampm}`;
    }
    
    capacity[timeSlot] = {
      capacity: 20,
      booked: parseInt(data[i][1]) || 0
    };
  }
  
  return capacity;
}

// Update capacity when a VIP reservation is made
function updateCapacity(timeSlot, guestCount) {
  try {
    Logger.log('updateCapacity called with timeSlot: ' + timeSlot + ', guestCount: ' + guestCount);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let capacitySheet = ss.getSheetByName('Capacity');
    
    if (!capacitySheet) {
      Logger.log('Capacity sheet not found, creating new one');
      capacitySheet = ss.insertSheet('Capacity');
      capacitySheet.appendRow(['Time Slot', 'Booked']);
      
      // Add time slots with text formatting
      const timeSlots = [
        ['6:00 PM', 0],
        ['6:15 PM', 0],
        ['6:30 PM', 0]
      ];
      
      timeSlots.forEach((slot, index) => {
        capacitySheet.getRange(index + 2, 1).setNumberFormat('@STRING@');
        capacitySheet.getRange(index + 2, 1).setValue(slot[0]);
        capacitySheet.getRange(index + 2, 2).setValue(slot[1]);
      });
    }
    
    const data = capacitySheet.getDataRange().getValues();
    Logger.log('Capacity sheet data: ' + JSON.stringify(data));
    
    let found = false;
    for (let i = 1; i < data.length; i++) {
      // Convert date object to time string if needed for comparison
      let cellTimeSlot = data[i][0];
      if (cellTimeSlot instanceof Date) {
        const hours = cellTimeSlot.getHours();
        const mins = cellTimeSlot.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMins = mins === 0 ? '00' : mins.toString().padStart(2, '0');
        cellTimeSlot = `${displayHours}:${displayMins} ${ampm}`;
      }
      
      Logger.log('Checking row ' + i + ': "' + cellTimeSlot + '" vs "' + timeSlot + '"');
      
      if (cellTimeSlot === timeSlot) {
        const currentBooked = parseInt(data[i][1]) || 0;
        const newTotal = currentBooked + guestCount;
        capacitySheet.getRange(i + 1, 2).setValue(newTotal);
        
        Logger.log('✓ Updated capacity for ' + timeSlot + ': ' + currentBooked + ' + ' + guestCount + ' = ' + newTotal);
        found = true;
        break;
      }
    }
    
    if (!found) {
      Logger.log('⚠️ WARNING: Time slot "' + timeSlot + '" not found in Capacity sheet');
      Logger.log('Available slots: ' + JSON.stringify(data.slice(1).map(row => {
        let slot = row[0];
        if (slot instanceof Date) {
          const hours = slot.getHours();
          const mins = slot.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          const displayMins = mins === 0 ? '00' : mins.toString().padStart(2, '0');
          slot = `${displayHours}:${displayMins} ${ampm}`;
        }
        return slot;
      })));
    }
    
    // Force save
    SpreadsheetApp.flush();
    
  } catch (error) {
    Logger.log('❌ Error in updateCapacity: ' + error.toString());
  }
}

// Send confirmation email
function sendConfirmationEmail(data, sheetType) {
  try {
    const isVIP = sheetType === 'VIPRSVPs';
    
    // Calculate next Wednesday dynamically
    const nextWednesday = getNextWednesday();
    const eventDate = formatEventDate(nextWednesday);
    
    // Format guest list for email
    let guestListHTML = '';
    if (data.guests && data.guests.length > 0) {
      guestListHTML = '<p><strong>Additional Guests:</strong></p><ul style="margin-top: 5px;">';
      data.guests.forEach((guest, index) => {
        guestListHTML += `<li>${guest.name}`;
        if (guest.email || guest.phone) {
          guestListHTML += ' (';
          if (guest.email) guestListHTML += guest.email;
          if (guest.email && guest.phone) guestListHTML += ', ';
          if (guest.phone) guestListHTML += guest.phone;
          guestListHTML += ')';
        }
        guestListHTML += '</li>';
      });
      guestListHTML += '</ul>';
    }
    
    let htmlBody;
    
    if (isVIP) {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 15px;">
            LOBBY HAMILTON
          </h1>
          <div style="background: linear-gradient(135deg, #d4af37, #8b7355); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0;">VIP RESERVATION CONFIRMED</h2>
          </div>
          <p>Dear ${data.name},</p>
          <p>Thank you for confirming your attendance at Ladies Night this Wednesday! We're thrilled to have you as our VIP guest.</p>
          
          <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Your Reservation Details</h3>
            <p><strong>Event:</strong> Ladies Night at Lobby Hamilton - VIP Dinner + Social</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Dinner Seating Time:</strong> ${data.dinnerTime}</p>
            <p><strong>Dinner Service:</strong> 6:00 PM - 8:00 PM</p>
            <p><strong>Social Event:</strong> 8:00 PM - Late</p>
            <p><strong>Location:</strong> Lobby Hamilton, Hamilton, ON</p>
            <p><strong>Total Party Size:</strong> ${data.totalGuests || 1} ${(data.totalGuests || 1) === 1 ? 'person' : 'people'}</p>
            ${guestListHTML}
            <p><strong>Instagram:</strong> ${data.instagram}</p>
            ${data.notes ? `<p><strong>Special Requests:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background: #fff4e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Important:</strong> Please arrive 5-10 minutes before your seating time. Your table will be held for 15 minutes past your reservation time.</p>
          </div>
          
          <p>We look forward to hosting you for this exclusive evening!</p>
          <p>If you have any questions or need to modify your reservation, please don't hesitate to contact us.</p>
          
          <p style="margin-top: 40px; color: #666; font-size: 14px;">
            Best regards,<br>
            The Lobby Hamilton Team
          </p>
        </div>
      `;
    } else {
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 15px;">
            LOBBY HAMILTON
          </h1>
          <h2 style="color: #d4af37;">Your RSVP is Confirmed!</h2>
          <p>Dear ${data.name},</p>
          <p>Thank you for confirming your attendance at Ladies Night this Wednesday!</p>
          
          <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Event Details</h3>
            <p><strong>Event:</strong> Ladies Night at Lobby Hamilton - Social Evening</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Time:</strong> 8:00 PM - Late</p>
            <p><strong>Location:</strong> Lobby Hamilton, Hamilton, ON</p>
            <p><strong>Total Party Size:</strong> ${data.totalGuests || 1} ${(data.totalGuests || 1) === 1 ? 'person' : 'people'}</p>
            ${guestListHTML}
            <p><strong>Instagram:</strong> ${data.instagram}</p>
          </div>
          
          <p>We look forward to seeing you there!</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p style="margin-top: 40px; color: #666; font-size: 14px;">
            Best regards,<br>
            The Lobby Hamilton Team
          </p>
        </div>
      `;
    }
    
    const subject = isVIP 
      ? 'VIP Reservation Confirmed - Ladies Night at Lobby Hamilton'
      : 'RSVP Confirmed - Ladies Night at Lobby Hamilton';
    
    GmailApp.sendEmail(data.email, subject, '', {
      htmlBody: htmlBody,
      name: 'Lobby Hamilton - Ladies Night',
      replyTo: 'noreply@example.com'
    });
    
    Logger.log('Confirmation email sent to: ' + data.email);
  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
    // Don't throw error - we still want to record the RSVP even if email fails
  }
}

// Helper function to create JSON response
function createResponse(status, message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: status,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

// Test function - run this to verify setup
function testSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('Testing Google Apps Script Setup...');
  Logger.log('Spreadsheet Name: ' + ss.getName());
  
  // Check for required sheets
  const lateNightSheet = ss.getSheetByName('LateNightRSVPs');
  const vipSheet = ss.getSheetByName('VIPRSVPs');
  
  if (!lateNightSheet) {
    Logger.log('⚠️ WARNING: LateNightRSVPs sheet not found!');
  } else {
    Logger.log('✓ LateNightRSVPs sheet found');
  }
  
  if (!vipSheet) {
    Logger.log('⚠️ WARNING: VIPRSVPs sheet not found!');
  } else {
    Logger.log('✓ VIPRSVPs sheet found');
  }
  
  // Test capacity tracking
  const capacity = getCapacity();
  Logger.log('Current Capacity: ' + JSON.stringify(capacity));
  
  Logger.log('Setup test complete!');
}

// Test capacity update function
function testCapacityUpdate() {
  Logger.log('=== Testing Capacity Update ===');
  
  // Test updating 6:00 PM slot with 2 guests
  updateCapacity('6:00 PM', 2);
  
  Logger.log('Test complete. Check the Capacity sheet to see if the value increased.');
  
  // Show current capacity
  const capacity = getCapacity();
  Logger.log('Current capacity after test: ' + JSON.stringify(capacity));
}
