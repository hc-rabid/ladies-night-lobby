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
      
      // Prepare row data based on sheet type
      let row;
      if (data.sheet === 'VIPRSVPs') {
        row = [
          data.data.timestamp,
          data.data.name,
          data.data.email,
          data.data.phone,
          data.data.instagram || 'N/A',
          data.data.guests,
          data.data.dinnerTime || 'N/A',
          data.data.notes || '',
          data.data.eventType
        ];
        
        // Update capacity for VIP reservations
        if (data.data.dinnerTime) {
          updateCapacity(data.data.dinnerTime, parseInt(data.data.guests));
        }
      } else {
        row = [
          data.data.timestamp,
          data.data.name,
          data.data.email,
          data.data.phone,
          data.data.instagram || 'N/A',
          data.data.guests,
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

// Handle GET requests (capacity check)
function doGet(e) {
  try {
    if (e.parameter.action === 'getCapacity') {
      const capacity = getCapacity();
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        capacity: capacity
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return createResponse('error', 'Invalid action');
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createResponse('error', error.toString());
  }
}

// Get current capacity for all time slots
function getCapacity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let capacitySheet = ss.getSheetByName('Capacity');
  
  // Create capacity sheet if it doesn't exist
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
      booked: parseInt(data[i][1]) || 0
    };
  }
  
  return capacity;
}

// Update capacity when a VIP reservation is made
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
      const currentBooked = parseInt(data[i][1]) || 0;
      capacitySheet.getRange(i + 1, 2).setValue(currentBooked + guestCount);
      Logger.log('Updated capacity for ' + timeSlot + ': ' + (currentBooked + guestCount));
      break;
    }
  }
}

// Send confirmation email
function sendConfirmationEmail(data, sheetType) {
  try {
    const isVIP = sheetType === 'VIPRSVPs';
    
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
          <p>Thank you for confirming your attendance at our exclusive VIP Ladies Night Launch event. Your dinner reservation has been confirmed.</p>
          
          <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Your Reservation Details</h3>
            <p><strong>Event:</strong> Ladies Night Launch - VIP Dinner + Social</p>
            <p><strong>Date:</strong> Wednesday, December 10th, 2025</p>
            <p><strong>Dinner Seating Time:</strong> ${data.dinnerTime}</p>
            <p><strong>Dinner Service:</strong> 6:00 PM - 8:00 PM</p>
            <p><strong>Late Night Social:</strong> 8:00 PM - Late</p>
            <p><strong>Location:</strong> Lobby Hamilton, Hamilton, ON</p>
            <p><strong>Number of Guests:</strong> ${data.guests}</p>
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
          <p>Thank you for confirming your attendance at our exclusive Ladies Night Launch event.</p>
          
          <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Event Details</h3>
            <p><strong>Event:</strong> Ladies Night Launch - Late Night Mingle</p>
            <p><strong>Date:</strong> Wednesday, December 10th, 2025</p>
            <p><strong>Time:</strong> 8:00 PM - Late</p>
            <p><strong>Location:</strong> Lobby Hamilton, Hamilton, ON</p>
            <p><strong>Number of Guests:</strong> ${data.guests}</p>
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
