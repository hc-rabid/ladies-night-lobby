// Configuration - Replace with your Google Apps Script URL
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxdz_zh7e57sZ0sMayu1YSRzEllMSrmpA7eKwme5N0S1PZXn41_6hJWsgmiMx3KdGYb/exec'
};

// State
let allRSVPs = [];
let vipRSVPs = [];
let socialRSVPs = [];
let capacityData = {};

// Load all data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
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
        
        updateStats();
        renderAllTable();
        renderVIPTable();
        renderSocialTable();
        renderCapacityTable();
        
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
    const totalVIPGuests = vipRSVPs.reduce((sum, r) => sum + parseInt(r.guests || 0), 0);
    const totalSocialGuests = socialRSVPs.reduce((sum, r) => sum + parseInt(r.guests || 0), 0);
    
    document.getElementById('totalRSVPs').textContent = allRSVPs.length;
    document.getElementById('vipRSVPs').textContent = vipRSVPs.length;
    document.getElementById('socialRSVPs').textContent = socialRSVPs.length;
    document.getElementById('totalGuests').textContent = totalVIPGuests + totalSocialGuests;
}

// Render all RSVPs table
function renderAllTable() {
    const tbody = document.getElementById('allTableBody');
    
    if (allRSVPs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No RSVPs yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = allRSVPs.map(rsvp => `
        <tr>
            <td><span class="badge ${rsvp.type.toLowerCase()}">${rsvp.type}</span></td>
            <td>${escapeHtml(rsvp.name)}</td>
            <td>${escapeHtml(rsvp.email)}</td>
            <td>${escapeHtml(rsvp.phone)}</td>
            <td>${escapeHtml(rsvp.instagram)}</td>
            <td>${rsvp.guests}</td>
            <td>${rsvp.dinnerTime ? `<span class="time-slot">${escapeHtml(rsvp.dinnerTime)}</span>` : '-'}</td>
            <td>${rsvp.notes ? escapeHtml(rsvp.notes) : '-'}</td>
            <td>${formatTimestamp(rsvp.timestamp)}</td>
        </tr>
    `).join('');
}

// Render VIP table
function renderVIPTable() {
    const tbody = document.getElementById('vipTableBody');
    
    if (vipRSVPs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No VIP RSVPs yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = vipRSVPs.map(rsvp => `
        <tr>
            <td>${escapeHtml(rsvp.name)}</td>
            <td>${escapeHtml(rsvp.email)}</td>
            <td>${escapeHtml(rsvp.phone)}</td>
            <td>${escapeHtml(rsvp.instagram)}</td>
            <td>${rsvp.guests}</td>
            <td><span class="time-slot">${escapeHtml(rsvp.dinnerTime)}</span></td>
            <td>${rsvp.notes ? escapeHtml(rsvp.notes) : '-'}</td>
            <td>${formatTimestamp(rsvp.timestamp)}</td>
        </tr>
    `).join('');
}

// Render social table
function renderSocialTable() {
    const tbody = document.getElementById('socialTableBody');
    
    if (socialRSVPs.length === 0) {
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
