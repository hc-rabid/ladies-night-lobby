// Configuration - Replace with your Google Apps Script URL
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxdz_zh7e57sZ0sMayu1YSRzEllMSrmpA7eKwme5N0S1PZXn41_6hJWsgmiMx3KdGYb/exec'
};

// State
let allRSVPs = [];
let vipRSVPs = [];
let socialRSVPs = [];
let capacityData = {};
let currentWeekFilter = 'all';
let filteredRSVPs = [];

// Load all data on page load
document.addEventListener('DOMContentLoaded', () => {
    populateWeekFilter();
    loadAllData();
    updateDinnerStatusDisplay();
    // Auto-refresh every 30 seconds
    setInterval(loadAllData, 30000);
});

// Load all data
async function loadAllData() {
    try {
        await Promise.all([
            loadVIPData(),
            loadSocialData(),
            loadCapacityData()
        ]);
        
        // Combine all RSVPs
        allRSVPs = [
            ...vipRSVPs.map(r => ({ ...r, type: 'VIP' })),
            ...socialRSVPs.map(r => ({ ...r, type: 'Social' }))
        ];
        
        // Sort by timestamp (most recent first)
        allRSVPs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply current filter
        applyWeekFilter();
        
        updateLastUpdated();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please refresh the page.');
    }
}

// Load VIP RSVPs
async function loadVIPData() {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=getVIPRSVPs`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            vipRSVPs = data.data;
        }
    } catch (error) {
        console.error('Error loading VIP data:', error);
        vipRSVPs = [];
    }
}

// Load Social RSVPs
async function loadSocialData() {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=getSocialRSVPs`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            socialRSVPs = data.data;
        }
    } catch (error) {
        console.error('Error loading social data:', error);
        socialRSVPs = [];
    }
}

// Load capacity data
async function loadCapacityData() {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=getCapacity`);
        const data = await response.json();
        
        if (data.status === 'success' && data.capacity) {
            capacityData = data.capacity;
        }
    } catch (error) {
        console.error('Error loading capacity data:', error);
        capacityData = {};
    }
}

// Update statistics
function updateStats() {
    const filtered = filteredRSVPs.length > 0 ? filteredRSVPs : allRSVPs;
    const filteredVIP = filtered.filter(r => r.type === 'VIP');
    const filteredSocial = filtered.filter(r => r.type === 'Social');
    
    const totalVIPGuests = filteredVIP.reduce((sum, r) => sum + parseInt(r.guests || 0), 0);
    const totalSocialGuests = filteredSocial.reduce((sum, r) => sum + parseInt(r.guests || 0), 0);
    
    document.getElementById('totalRSVPs').textContent = filtered.length;
    document.getElementById('vipRSVPs').textContent = filteredVIP.length;
    document.getElementById('socialRSVPs').textContent = filteredSocial.length;
    document.getElementById('totalGuests').textContent = totalVIPGuests + totalSocialGuests;
}

// Render all RSVPs table
function renderAllTable() {
    const tbody = document.getElementById('allTableBody');
    const dataToRender = filteredRSVPs.length > 0 ? filteredRSVPs : allRSVPs;
    
    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No RSVPs yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = dataToRender.map(rsvp => `
        <tr>
            <td data-col="type">${rsvp.type}</td>
            <td data-col="name">${escapeHtml(rsvp.name)}</td>
            <td data-col="email">${escapeHtml(rsvp.email)}</td>
            <td data-col="phone">${escapeHtml(rsvp.phone)}</td>
            <td data-col="instagram">${escapeHtml(rsvp.instagram)}</td>
            <td data-col="guests">${rsvp.guests}</td>
            <td data-col="time">${rsvp.dinnertime ? escapeHtml(rsvp.dinnertime) : '-'}</td>
            <td data-col="notes">${rsvp.notes ? escapeHtml(rsvp.notes) : '-'}</td>
            <td data-col="timestamp">${formatTimestamp(rsvp.timestamp)}</td>
        </tr>
    `).join('');
}

// Render VIP table
function renderVIPTable() {
    const tbody = document.getElementById('vipTableBody');
    const dataToRender = filteredRSVPs.length > 0 ? filteredRSVPs.filter(r => r.type === 'VIP') : vipRSVPs;
    
    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No VIP RSVPs yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = dataToRender.map(rsvp => `
        <tr>
            <td>${escapeHtml(rsvp.name)}</td>
            <td>${escapeHtml(rsvp.email)}</td>
            <td>${escapeHtml(rsvp.phone)}</td>
            <td>${escapeHtml(rsvp.instagram)}</td>
            <td>${rsvp.guests}</td>
            <td><span class="time-slot">${escapeHtml(rsvp.dinnertime)}</span></td>
            <td>${rsvp.notes ? escapeHtml(rsvp.notes) : '-'}</td>
            <td>${formatTimestamp(rsvp.timestamp)}</td>
        </tr>
    `).join('');
}

// Render social table
function renderSocialTable() {
    const tbody = document.getElementById('socialTableBody');
    const dataToRender = filteredRSVPs.length > 0 ? filteredRSVPs.filter(r => r.type === 'Social') : socialRSVPs;
    
    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No late night RSVPs yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = socialRSVPs.map(rsvp => `
        <tr>
            <td>${escapeHtml(rsvp.name)}</td>
            <td>${escapeHtml(rsvp.email)}</td>
            <td>${escapeHtml(rsvp.phone)}</td>
            <td>${escapeHtml(rsvp.instagram)}</td>
            <td>${rsvp.guests}</td>
            <td>${formatTimestamp(rsvp.timestamp)}</td>
        </tr>
    `).join('');
}

// Render capacity table
function renderCapacityTable() {
    const tbody = document.getElementById('capacityTableBody');
    
    const timeSlots = ['6:00 PM', '6:15 PM', '6:30 PM'];
    
    tbody.innerHTML = timeSlots.map(slot => {
        const slotData = capacityData[slot] || { booked: 0, capacity: 20 };
        const remaining = slotData.capacity - slotData.booked;
        const percentage = (slotData.booked / slotData.capacity) * 100;
        
        let statusColor = 'green';
        let statusText = 'Available';
        
        if (percentage >= 100) {
            statusColor = 'red';
            statusText = 'Full';
        } else if (percentage >= 80) {
            statusColor = 'orange';
            statusText = 'Almost Full';
        }
        
        return `
            <tr>
                <td><span class="time-slot">${slot}</span></td>
                <td>${slotData.booked}</td>
                <td>${slotData.capacity}</td>
                <td>${remaining}</td>
                <td><span style="color: ${statusColor}; font-weight: 600;">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

// Switch tabs
function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '-';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = 
        `Last updated: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.admin-container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}
// Toggle dinner availability
function toggleDinnerAvailability() {
    const currentStatus = localStorage.getItem('dinnerAvailable') === 'true';
    const newStatus = !currentStatus;
    
    localStorage.setItem('dinnerAvailable', newStatus.toString());
    
    updateDinnerStatusDisplay();
    
    // Show confirmation
    const message = newStatus ? 'Dinner reservations are now ENABLED' : 'Dinner reservations are now DISABLED';
    alert(message);
}

// Update dinner status display in admin
function updateDinnerStatusDisplay() {
    const isDinnerAvailable = localStorage.getItem('dinnerAvailable') === 'true';
    const statusText = document.getElementById('dinnerStatusText');
    const statusIndicator = document.getElementById('dinnerStatusIndicator');
    
    if (isDinnerAvailable) {
        statusText.textContent = 'Disable Dinner Reservations';
        statusIndicator.textContent = '● Currently Enabled';
        statusIndicator.style.color = '#4CAF50';
    } else {
        statusText.textContent = 'Enable Dinner Reservations';
        statusIndicator.textContent = '● Currently Disabled';
        statusIndicator.style.color = '#c75450';
    }
}
// Get next Wednesday from a given date
function getNextWednesday(date) {
    const result = new Date(date);
    const day = result.getDay();
    const daysUntilWednesday = (3 - day + 7) % 7 || 7; // 3 = Wednesday
    result.setDate(result.getDate() + daysUntilWednesday);
    result.setHours(0, 0, 0, 0);
    return result;
}

// Populate week filter dropdown
function populateWeekFilter() {
    const select = document.getElementById('weekFilter');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First event date: December 10, 2025 (Wednesday)
    const firstEventDate = new Date(2025, 11, 10); // Month is 0-indexed
    firstEventDate.setHours(0, 0, 0, 0);
    
    // Get the next upcoming Wednesday
    const nextWed = getNextWednesday(today);
    
    // Generate all event dates from Dec 10 to next week
    const weeks = [];
    
    // Add all past events starting from Dec 10
    let currentEventDate = new Date(firstEventDate);
    while (currentEventDate <= today) {
        weeks.push(new Date(currentEventDate));
        currentEventDate.setDate(currentEventDate.getDate() + 7);
    }
    
    // Add current week's event if not already added
    if (!weeks.some(d => d.getTime() === nextWed.getTime())) {
        weeks.push(new Date(nextWed));
    }
    
    // Add next week's event
    const nextNextWed = new Date(nextWed);
    nextNextWed.setDate(nextNextWed.getDate() + 7);
    weeks.push(nextNextWed);
    
    // Clear existing options except 'All RSVPs'
    select.innerHTML = '<option value="all">All RSVPs</option>';
    
    // Add week options
    weeks.forEach(eventDate => {
        const option = document.createElement('option');
        const dateStr = eventDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        // Calculate the cutoff date (day after previous Wednesday)
        const cutoffDate = new Date(eventDate);
        cutoffDate.setDate(cutoffDate.getDate() - 6); // 6 days before = day after previous Wednesday
        cutoffDate.setHours(0, 0, 0, 0); // Start of day
        
        option.value = cutoffDate.toISOString();
        option.textContent = `${dateStr} Event`;
        
        // Mark current/next event
        if (eventDate.getTime() === nextWed.getTime()) {
            option.textContent += ' (Next Event)';
            option.selected = true;
            currentWeekFilter = option.value;
        }
        
        select.appendChild(option);
    });
}

// Apply week filter
function applyWeekFilter() {
    const select = document.getElementById('weekFilter');
    currentWeekFilter = select.value;
    
    if (currentWeekFilter === 'all') {
        filteredRSVPs = [...allRSVPs];
    } else {
        const cutoffDate = new Date(currentWeekFilter);
        filteredRSVPs = allRSVPs.filter(rsvp => {
            const rsvpDate = new Date(rsvp.timestamp);
            return rsvpDate >= cutoffDate;
        });
    }
    
    // Update displays with filtered data
    updateStats();
    renderAllTable();
    renderVIPTable();
    renderSocialTable();
    renderCapacityTable();
}

// Column visibility toggle functions
function toggleColumnControls() {
    const panel = document.getElementById('columnToggles');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleColumn(checkbox) {
    const colName = checkbox.dataset.col;
    const isVisible = checkbox.checked;
    
    // Toggle visibility for headers and cells
    const headers = document.querySelectorAll(`th[data-col="${colName}"]`);
    const cells = document.querySelectorAll(`td[data-col="${colName}"]`);
    
    headers.forEach(header => {
        header.style.display = isVisible ? '' : 'none';
    });
    
    cells.forEach(cell => {
        cell.style.display = isVisible ? '' : 'none';
    });
}
