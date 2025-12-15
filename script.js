// Configuration - Replace these with your actual values
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxdz_zh7e57sZ0sMayu1YSRzEllMSrmpA7eKwme5N0S1PZXn41_6hJWsgmiMx3KdGYb/exec',
    EMAIL_SERVICE_URL: 'https://script.google.com/macros/s/AKfycbxdz_zh7e57sZ0sMayu1YSRzEllMSrmpA7eKwme5N0S1PZXn41_6hJWsgmiMx3KdGYb/exec' // Can use same Google Apps Script or separate service
};

// Event Details
const EVENT_DETAILS = {
    name: 'Ladies Night Launch - Late Night Mingle',
    date: 'December 10, 2025',
    startTime: '8:00 PM',
    endTime: '12:00 AM',
    location: 'Lobby Hamilton, Hamilton, ON',
    description: 'Join us for an exclusive late night mingle and networking event to celebrate the launch of Ladies Night at Lobby Hamilton.'
};

// DOM Elements
const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const successMessage = document.getElementById('successMessage');
const addToAppleBtn = document.getElementById('addToApple');
const addToGoogleBtn = document.getElementById('addToGoogle');

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
        eventType: 'Late Night Mingle',
        timestamp: new Date().toISOString()
    };

    // Validate form
    if (!validateForm(formData)) {
        return;
    }

    // Show loading state
    setLoading(true);

    try {
        // Submit to Google Sheets
        await submitToGoogleSheets(formData);
        
        // Show success message
        showSuccess(formData);
        
        // Reset form
        form.reset();
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
            sheet: 'LateNightRSVPs',
            data: data
        })
    });
    
    // Note: no-cors mode doesn't allow reading the response
    // We assume success if no error is thrown
    return response;
}

// Send confirmation email
async function sendConfirmationEmail(data) {
    const emailData = {
        to: data.email,
        subject: 'RSVP Confirmed - Ladies Night at Lobby Hamilton',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 15px;">
                    LOBBY HAMILTON
                </h1>
                <h2 style="color: #d4af37;">Your RSVP is Confirmed!</h2>
                <p>Dear ${data.name},</p>
                <p>Thank you for confirming your attendance at our exclusive Ladies Night Launch event.</p>
                
                <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
                    <h3 style="margin-top: 0; color: #1a1a1a;">Event Details</h3>
                    <p><strong>Event:</strong> ${EVENT_DETAILS.name}</p>
                    <p><strong>Date:</strong> Wednesday, ${EVENT_DETAILS.date}</p>
                    <p><strong>Time:</strong> ${EVENT_DETAILS.startTime} - Late</p>
                    <p><strong>Location:</strong> ${EVENT_DETAILS.location}</p>
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
    
    // Store data for calendar downloads
    successMessage.dataset.guestName = data.name;
    successMessage.dataset.guests = data.guests;
}

// Calendar button handlers
addToAppleBtn.addEventListener('click', () => {
    downloadICSFile();
});

addToGoogleBtn.addEventListener('click', () => {
    openGoogleCalendar();
});

// Generate ICS file for Apple Calendar
function downloadICSFile() {
    const startDate = '20251210T200000'; // December 10, 2025, 8:00 PM
    const endDate = '20251211T000000';   // December 11, 2025, 12:00 AM
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lobby Hamilton//Ladies Night//EN
BEGIN:VEVENT
UID:${Date.now()}@lobbyhamilton.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Ladies Night Launch - Late Night Mingle
DESCRIPTION:${EVENT_DETAILS.description}
LOCATION:${EVENT_DETAILS.location}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Reminder: Ladies Night event in 2 hours
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'ladies-night-lobby-hamilton.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Open Google Calendar
function openGoogleCalendar() {
    const startDate = '20251210T200000';
    const endDate = '20251211T000000';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EVENT_DETAILS.name)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(EVENT_DETAILS.description)}&location=${encodeURIComponent(EVENT_DETAILS.location)}`;
    
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

// Bottom banner click handler
document.getElementById('bottomBanner').addEventListener('click', () => {
    const rsvpSection = document.querySelector('.rsvp-section');
    rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

