// Helper function to get next Wednesday
function getNextWednesday() {
    const today = new Date();
    const day = today.getDay();
    const daysUntilWednesday = (3 - day + 7) % 7;
    const nextWed = new Date(today);
    nextWed.setDate(today.getDate() + daysUntilWednesday);
    return nextWed;
}

// Helper function to format event date
function formatEventDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update event date on page load
document.addEventListener('DOMContentLoaded', () => {
    const eventDateElement = document.getElementById('eventDate');
    if (eventDateElement) {
        eventDateElement.textContent = formatEventDate(getNextWednesday());
    }
});

// Bottom banner click handler
document.getElementById('bottomBanner').addEventListener('click', () => {
    const rsvpSection = document.querySelector('.rsvp-section');
    rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
