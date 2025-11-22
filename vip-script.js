// Configuration - Replace these with your actual values
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw9We4ozZkFB3YoqDOUZJhLMpcZm7JcobClrinXpC7z4tqPTqGlP2O5kpvCUHhYwoE_/exec',
    EMAIL_SERVICE_URL: 'https://script.google.com/macros/s/AKfycbw9We4ozZkFB3YoqDOUZJhLMpcZm7JcobClrinXpC7z4tqPTqGlP2O5kpvCUHhYwoE_/exec' // Can use same Google Apps Script or separate service
};

// Event Details
const EVENT_DETAILS = {
    name: 'Ladies Night Launch - VIP Dinner + Social',
    date: 'December 10, 2025',
    dinnerStart: '6:00 PM',
    dinnerEnd: '8:00 PM',
    socialStart: '8:00 PM',
    socialEnd: '12:00 AM',
    location: 'Lobby Hamilton, Hamilton, ON',
    description: 'Exclusive VIP dinner service followed by the Ladies Night launch celebration at Lobby Hamilton.'
};

// Time slot capacity tracking
const TIME_SLOTS = {
    '6:00 PM': { capacity: 20, booked: 0 },
    '6:15 PM': { capacity: 20, booked: 0 },
    '6:30 PM': { capacity: 20, booked: 0 }
};

// DOM Elements
const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const successMessage = document.getElementById('successMessage');
const addToAppleBtn = document.getElementById('addToApple');
const addToGoogleBtn = document.getElementById('addToGoogle');
const dinnerTimeSelect = document.getElementById('dinnerTime');
const capacityInfo = document.getElementById('capacityInfo');
const reservationDetails = document.getElementById('reservationDetails');

// Initialize - Load capacity data
async function initializeCapacity() {
    try {
        // Fetch current capacity from Google Sheets
        const response = await fetch(`${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=getCapacity`, {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.capacity) {
                Object.assign(TIME_SLOTS, data.capacity);
                updateTimeSlotOptions();
            }
        }
    } catch (error) {
        console.error('Error loading capacity:', error);
        // Continue with default capacity values
    }
}

// Update time slot options based on capacity
function updateTimeSlotOptions() {
    const options = dinnerTimeSelect.querySelectorAll('option[value]');
    
    options.forEach(option => {
        if (option.value) {
            const slot = TIME_SLOTS[option.value];
            const remaining = slot.capacity - slot.booked;
            
            if (remaining <= 0) {
                option.disabled = true;
                option.textContent = `${option.value} - FULL`;
            } else if (remaining <= 5) {
                option.textContent = `${option.value} - Only ${remaining} spots left`;
            } else {
                option.textContent = `${option.value} - ${remaining} spots available`;
            }
        }
    });
}

// Show capacity info when time slot is selected
dinnerTimeSelect.addEventListener('change', (e) => {
    const selectedTime = e.target.value;
    if (selectedTime && TIME_SLOTS[selectedTime]) {
        const slot = TIME_SLOTS[selectedTime];
        const remaining = slot.capacity - slot.booked;
        
        if (remaining > 0) {
            capacityInfo.textContent = `${remaining} of ${slot.capacity} spots remaining for this time slot`;
            capacityInfo.classList.remove('capacity-full');
        } else {
            capacityInfo.textContent = 'This time slot is full. Please select another time.';
            capacityInfo.classList.add('capacity-full');
        }
    } else {
        capacityInfo.textContent = '';
    }
});

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        instagram: document.getElementById('instagram').value.trim(),
        guests: document.getElementById('guests').value,
        dinnerTime: document.getElementById('dinnerTime').value,
        notes: document.getElementById('notes').value.trim(),
        eventType: 'VIP Dinner + Social',
        timestamp: new Date().toISOString()
    };

    // Validate form
    if (!validateForm(formData)) {
        return;
    }

    // Check capacity before submission
    const slot = TIME_SLOTS[formData.dinnerTime];
    const guestCount = parseInt(formData.guests);
    
    if (slot.booked + guestCount > slot.capacity) {
        showError(`Sorry, only ${slot.capacity - slot.booked} spots remain for this time slot. Please select a different time.`);
        return;
    }

    // Show loading state
    setLoading(true);

    try {
        // Submit to Google Sheets
        await submitToGoogleSheets(formData);
        
        // Update local capacity
        TIME_SLOTS[formData.dinnerTime].booked += guestCount;
        updateTimeSlotOptions();
        
        // Send confirmation email
        await sendConfirmationEmail(formData);
        
        // Show success message
        showSuccess(formData);
        
        // Reset form
        form.reset();
        capacityInfo.textContent = '';
    } catch (error) {
        console.error('Error submitting RSVP:', error);
        showError('There was an error submitting your RSVP. Please try again or contact us directly.');
    } finally {
        setLoading(false);
    }
});

// Validate form data
function validateForm(data) {
    // Clear previous errors
    clearErrors();
    
    let isValid = true;
    
    // Validate name
    if (data.name.length < 2) {
        showFieldError('name', 'Please enter your full name');
        isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(data.phone) || data.phone.length < 10) {
        showFieldError('phone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate Instagram
    let instagram = data.instagram.trim();
    if (!instagram.startsWith('@')) {
        instagram = '@' + instagram;
    }
    // Remove @ for validation, check if valid username format
    const instagramUsername = instagram.substring(1);
    const instagramRegex = /^[a-zA-Z0-9._]+$/;
    if (instagramUsername.length < 1 || !instagramRegex.test(instagramUsername)) {
        showFieldError('instagram', 'Please enter a valid Instagram username');
        isValid = false;
    }
    // Update the data with formatted Instagram
    data.instagram = instagram;
    
    // Validate dinner time
    if (!data.dinnerTime) {
        showFieldError('dinnerTime', 'Please select a dinner time slot');
        isValid = false;
    }
    
    return isValid;
}

// Submit to Google Sheets
async function submitToGoogleSheets(data) {
    const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sheet: 'VIPRSVPs',
            data: data
        })
    });
    
    return response;
}

// Send confirmation email
async function sendConfirmationEmail(data) {
    const emailData = {
        to: data.email,
        subject: 'VIP Reservation Confirmed - Ladies Night at Lobby Hamilton',
        html: `
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
                    <p><strong>Event:</strong> ${EVENT_DETAILS.name}</p>
                    <p><strong>Date:</strong> Wednesday, ${EVENT_DETAILS.date}</p>
                    <p><strong>Dinner Seating Time:</strong> ${data.dinnerTime}</p>
                    <p><strong>Dinner Service:</strong> ${EVENT_DETAILS.dinnerStart} - ${EVENT_DETAILS.dinnerEnd}</p>
                    <p><strong>Social Event:</strong> ${EVENT_DETAILS.socialStart} - ${EVENT_DETAILS.socialEnd}</p>
                    <p><strong>Location:</strong> ${EVENT_DETAILS.location}</p>
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
        `
    };
    
    const response = await fetch(CONFIG.EMAIL_SERVICE_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
    });
    
    return response;
}

// Show success message
function showSuccess(data) {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Display reservation details
    reservationDetails.innerHTML = `
        <p><strong>Date:</strong> Wednesday, December 10th, 2025</p>
        <p><strong>Dinner Seating:</strong> ${data.dinnerTime}</p>
        <p><strong>Number of Guests:</strong> ${data.guests}</p>
        <p><strong>Location:</strong> Lobby Hamilton, Hamilton, ON</p>
    `;
    
    // Store data for calendar downloads
    successMessage.dataset.dinnerTime = data.dinnerTime;
    successMessage.dataset.guestName = data.name;
    successMessage.dataset.guests = data.guests;
}

// Calendar button handlers
addToAppleBtn.addEventListener('click', () => {
    const dinnerTime = successMessage.dataset.dinnerTime;
    downloadICSFile(dinnerTime);
});

addToGoogleBtn.addEventListener('click', () => {
    const dinnerTime = successMessage.dataset.dinnerTime;
    openGoogleCalendar(dinnerTime);
});

// Generate ICS file for Apple Calendar
function downloadICSFile(dinnerTime) {
    // Convert dinner time to 24-hour format for ICS
    let startHour = '18'; // Default 6 PM
    if (dinnerTime === '6:15 PM') startHour = '1815';
    else if (dinnerTime === '6:30 PM') startHour = '1830';
    else startHour = '1800';
    
    const startDate = `20251210T${startHour}00`;
    const endDate = '20251211T000000'; // Until midnight
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lobby Hamilton//Ladies Night VIP//EN
BEGIN:VEVENT
UID:${Date.now()}@lobbyhamilton.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Ladies Night VIP - Dinner + Social
DESCRIPTION:VIP Dinner reservation at ${dinnerTime} followed by the Ladies Night launch celebration. ${EVENT_DETAILS.description}
LOCATION:${EVENT_DETAILS.location}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: VIP Dinner reservation in 2 hours
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'ladies-night-vip-lobby-hamilton.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Open Google Calendar
function openGoogleCalendar(dinnerTime) {
    // Convert dinner time to format Google Calendar expects
    let startTime = '180000';
    if (dinnerTime === '6:15 PM') startTime = '181500';
    else if (dinnerTime === '6:30 PM') startTime = '183000';
    
    const startDate = `20251210T${startTime}`;
    const endDate = '20251211T000000';
    
    const eventTitle = `Ladies Night VIP - Dinner at ${dinnerTime}`;
    const eventDescription = `VIP Dinner reservation at ${dinnerTime} followed by the Ladies Night launch celebration. ${EVENT_DETAILS.description}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(EVENT_DETAILS.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
}

// UI Helper Functions
function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        submitBtn.classList.add('loading');
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.classList.remove('loading');
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('form-error');
    
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.textContent = message;
    field.parentNode.appendChild(errorSpan);
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.classList.remove('form-error');
    });
    document.querySelectorAll('.field-error').forEach(el => {
        el.remove();
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
}

// Phone number formatting
document.getElementById('phone').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    if (value.length > 6) {
        e.target.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length > 3) {
        e.target.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
        e.target.value = `(${value}`;
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCapacity();
});
