// Configuration - Replace these with your actual values
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxFHgM_gHXWMeh_8ActKl7cMI36fYuYiY-ur-86RL2DAv1aEV6aCL9PINNsPKQTXNZ_/exec',
    EMAIL_SERVICE_URL: 'https://script.google.com/macros/s/AKfycbxFHgM_gHXWMeh_8ActKl7cMI36fYuYiY-ur-86RL2DAv1aEV6aCL9PINNsPKQTXNZ_/exec' // Can use same Google Apps Script or separate service
};

// Helper function to get next Wednesday
function getNextWednesday() {
    const today = new Date();
    const day = today.getDay();
    // Calculate days until next Wednesday (3 = Wednesday)
    const daysUntilWednesday = (3 - day + 7) % 7 || 7;
    const nextWed = new Date(today);
    nextWed.setDate(today.getDate() + daysUntilWednesday);
    return nextWed;
}

// Helper function to format event date
function formatEventDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to get calendar date string (YYYYMMDD format)
function getCalendarDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Event Details
const EVENT_DETAILS = {
    name: 'Ladies Night - Social Evening',
    date: formatEventDate(getNextWednesday()),
    startTime: '8:00 PM',
    endTime: '12:00 AM',
    location: 'Lobby Hamilton, Hamilton, ON',
    description: 'Join us every Wednesday for an unforgettable evening at Lobby Hamilton. Enjoy $10 cocktails all night, 50% off rosé, live entertainment, and more!'
};

// Update event date on page load
document.addEventListener('DOMContentLoaded', () => {
    const eventDateElement = document.getElementById('eventDate');
    if (eventDateElement) {
        eventDateElement.textContent = formatEventDate(getNextWednesday());
    }
});

// Guest management
let guests = [];
const MAX_GUESTS = 5;

// DOM Elements
const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const successMessage = document.getElementById('successMessage');
const addToAppleBtn = document.getElementById('addToApple');
const addToGoogleBtn = document.getElementById('addToGoogle');
const addGuestBtn = document.getElementById('addGuestBtn');
const guestsList = document.getElementById('guestsList');
const guestCount = document.getElementById('guestCount');

// Add Guest Button Handler
addGuestBtn.addEventListener('click', () => {
    if (guests.length < MAX_GUESTS) {
        addGuest();
    }
});

// Add a new guest
function addGuest() {
    const guestId = Date.now();
    guests.push({
        id: guestId,
        name: '',
        email: '',
        phone: '',
        instagram: ''
    });
    
    renderGuests();
    updateGuestCount();
}

// Remove a guest
function removeGuest(guestId) {
    guests = guests.filter(g => g.id !== guestId);
    renderGuests();
    updateGuestCount();
}

// Update guest count display
function updateGuestCount() {
    guestCount.textContent = `(${guests.length}/${MAX_GUESTS})`;
    addGuestBtn.disabled = guests.length >= MAX_GUESTS;
}

// Render all guests
function renderGuests() {
    guestsList.innerHTML = '';
    
    guests.forEach((guest, index) => {
        const guestCard = document.createElement('div');
        guestCard.className = 'guest-card';
        guestCard.innerHTML = `
            <div class="guest-card-header">
                <span class="guest-card-title">Guest ${index + 1}</span>
                <button type="button" class="remove-guest-btn" onclick="removeGuest(${guest.id})">Remove</button>
            </div>
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" class="guest-input" data-guest-id="${guest.id}" data-field="name" value="${guest.name}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" class="guest-input" data-guest-id="${guest.id}" data-field="email" value="${guest.email}" placeholder="optional">
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" class="guest-input" data-guest-id="${guest.id}" data-field="phone" value="${guest.phone}" placeholder="optional">
            </div>
            <div class="form-group">
                <label>Instagram</label>
                <input type="text" class="guest-input" data-guest-id="${guest.id}" data-field="instagram" value="${guest.instagram}" placeholder="@username (optional)">
            </div>
        `;
        guestsList.appendChild(guestCard);
    });
    
    // Add event listeners to guest inputs
    document.querySelectorAll('.guest-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const guestId = parseInt(e.target.dataset.guestId);
            const field = e.target.dataset.field;
            const guest = guests.find(g => g.id === guestId);
            if (guest) {
                guest[field] = e.target.value;
            }
        });
    });
}

// Make removeGuest available globally
window.removeGuest = removeGuest;

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all guest names are filled
    const emptyGuestNames = guests.some(g => !g.name.trim());
    if (emptyGuestNames) {
        showError('Please fill in all guest names or remove empty guests');
        return;
    }
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        instagram: document.getElementById('instagram').value.trim(),
        totalGuests: guests.length + 1, // Including main guest
        guests: guests,
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
    // Calculate next Wednesday dynamically when sending email
    const nextWed = getNextWednesday();
    const eventDate = formatEventDate(nextWed);
    
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
                    <p><strong>Date:</strong> Wednesday, ${eventDate}</p>
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
    const eventDate = getNextWednesday();
    const dateStr = getCalendarDateString(eventDate);
    const startDate = `${dateStr}T200000`; // 8:00 PM
    const endDate = `${dateStr}T235900`;   // 11:59 PM (same day)
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lobby Hamilton//Ladies Night//EN
BEGIN:VEVENT
UID:${Date.now()}@lobbyhamilton.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Ladies Night - Social Evening
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
    const eventDate = getNextWednesday();
    const dateStr = getCalendarDateString(eventDate);
    const startDate = `${dateStr}T200000`;
    const endDate = `${dateStr}T235900`;
    
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

