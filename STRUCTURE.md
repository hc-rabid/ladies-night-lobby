# Website Structure Overview

## File Structure
```
ladies-night-lobby/
├── index.html              # Main late night mingle invitation page
├── vip.html               # Hidden VIP dinner + social invitation page
├── styles.css             # Shared styling for both pages
├── script.js              # JavaScript for late night page
├── vip-script.js          # JavaScript for VIP page with capacity tracking
├── google-apps-script.js  # Backend script for Google Sheets
├── README.md              # Comprehensive documentation
├── SETUP-GUIDE.md         # Quick setup instructions
└── STRUCTURE.md           # This file
```

## Page Flow

### Late Night Mingle Page (index.html)
```
┌─────────────────────────────────────┐
│         LOBBY HAMILTON              │
│         ═══════════════             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│       EVENT DETAILS SECTION         │
│                                     │
│    You're Invited                   │
│    Ladies Night Launch Event        │
│    Late Night Mingle & Networking   │
│                                     │
│    Date: Wednesday, Dec 10, 2025    │
│    Time: 8:00 PM - Late             │
│    Location: Lobby Hamilton         │
│                                     │
│    [Event Description]              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         RSVP FORM SECTION           │
│                                     │
│    Full Name                        │
│    ┌─────────────────────────────┐ │
│    │                             │ │
│    └─────────────────────────────┘ │
│                                     │
│    Email Address                    │
│    ┌─────────────────────────────┐ │
│    │                             │ │
│    └─────────────────────────────┘ │
│                                     │
│    Phone Number                     │
│    ┌─────────────────────────────┐ │
│    │                             │ │
│    └─────────────────────────────┘ │
│                                     │
│    Number of Guests                 │
│    ┌─────────────────────────────┐ │
│    │ Select...                 ▼ │ │
│    └─────────────────────────────┘ │
│                                     │
│    ┌───────────────────────────┐   │
│    │    CONFIRM RSVP           │   │
│    └───────────────────────────┘   │
└─────────────────────────────────────┘
```

### VIP Dinner Page (vip.html)
```
┌─────────────────────────────────────┐
│         LOBBY HAMILTON              │
│         ═══════════════             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│       EVENT DETAILS SECTION         │
│                                     │
│    You're Invited                   │
│    Ladies Night Launch Event        │
│    ┌──────────────────────────────┐│
│    │ VIP: Dinner + Late Night    ││
│    └──────────────────────────────┘│
│                                     │
│    Date: Wednesday, Dec 10, 2025    │
│    Dinner: 6:00 PM - 8:00 PM        │
│    Social: 8:00 PM - Late           │
│    Location: Lobby Hamilton         │
│                                     │
│    [VIP Event Description]          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         RSVP FORM SECTION           │
│                                     │
│    Full Name                        │
│    Email Address                    │
│    Phone Number                     │
│    Number of Guests                 │
│                                     │
│    Preferred Dinner Seating Time    │
│    ┌─────────────────────────────┐ │
│    │ 6:00 PM - 18 spots left   ▼ │ │
│    └─────────────────────────────┘ │
│    18 of 20 spots remaining         │
│                                     │
│    Special Requests/Dietary Info    │
│    ┌─────────────────────────────┐ │
│    │                             │ │
│    │                             │ │
│    │                             │ │
│    └─────────────────────────────┘ │
│                                     │
│    ┌───────────────────────────┐   │
│    │    CONFIRM RSVP           │   │
│    └───────────────────────────┘   │
└─────────────────────────────────────┘
```

### Success Message (Both Pages)
```
┌─────────────────────────────────────┐
│  ✓ RSVP CONFIRMED!                  │
│                                     │
│  Thank you for confirming your      │
│  attendance. A confirmation email   │
│  has been sent to your inbox.       │
│                                     │
│  [Reservation Details Box]          │
│                                     │
│  Add to your calendar:              │
│  ┌──────────────┐ ┌──────────────┐ │
│  │  Apple Cal   │ │  Google Cal  │ │
│  └──────────────┘ └──────────────┘ │
└─────────────────────────────────────┘
```

## Data Flow

```
User fills form → Validates input → Submits to Google Apps Script
                                    ↓
                    ┌───────────────┴────────────────┐
                    ↓                                ↓
            Google Sheets                    Send Email
            (LateNightRSVPs                  Confirmation
             or VIPRSVPs)                    ↓
                    ↓                        User receives
            Update Capacity                  confirmation
            (VIP only)                       ↓
                    ↓                        Shows success
            Return success ←─────────────── message with
                                            calendar options
```

## Google Sheets Structure

### LateNightRSVPs Sheet
| Timestamp | Name | Email | Phone | Guests | Event Type |
|-----------|------|-------|-------|--------|------------|
| 2025-11-22 3:45 PM | John Doe | john@email.com | (555) 123-4567 | 2 | Late Night Mingle |

### VIPRSVPs Sheet
| Timestamp | Name | Email | Phone | Guests | Dinner Time | Notes | Event Type |
|-----------|------|-------|-------|--------|-------------|-------|------------|
| 2025-11-22 3:45 PM | Jane Smith | jane@email.com | (555) 987-6543 | 1 | 6:00 PM | Vegetarian | VIP Dinner + Social |

### Capacity Sheet
| Time Slot | Booked |
|-----------|--------|
| 6:00 PM   | 0      |
| 6:15 PM   | 0      |
| 6:30 PM   | 0      |

## URL Structure

```
Production URLs:
├── https://yourdomain.com/                    → Late Night Mingle (Public)
├── https://yourdomain.com/index.html          → Late Night Mingle (Public)
└── https://yourdomain.com/vip.html            → VIP Dinner (Hidden)
    or
    https://yourdomain.com/vip                 → VIP Dinner (Hidden)
```

## Key Features by Page

### Late Night Page (index.html + script.js)
✅ Event information display
✅ Basic RSVP form (name, email, phone, guest count)
✅ Form validation
✅ Google Sheets integration
✅ Automatic email confirmation
✅ Calendar download (Apple & Google)
✅ 8 PM - 12 AM event timing

### VIP Page (vip.html + vip-script.js)
✅ VIP-branded event information
✅ Extended RSVP form with:
  - Dinner time slot selection
  - Real-time capacity display
  - Notes/dietary restrictions field
✅ Capacity tracking (20 guests per time slot)
✅ Separate Google Sheet tracking
✅ Time-specific email confirmations
✅ Time-specific calendar entries
✅ Dynamic time slot availability

## Responsive Design

Both pages are fully responsive:
- Desktop: Full width with centered content (max 1200px)
- Tablet: Adjusted spacing and font sizes
- Mobile: Stacked layout, full-width buttons, optimized touch targets

## Color Scheme

```
Primary Colors:
├── Primary Dark: #1a1a1a (Main text, headers)
├── Gold Accent: #d4af37 (Highlights, borders, VIP badge)
└── Brown Accent: #8b7355 (Secondary highlights)

Supporting Colors:
├── Light Background: #f8f8f8 (Info boxes)
├── White: #ffffff (Main background)
├── Text Gray: #666666 (Secondary text)
├── Success Green: #2ecc71 (Confirmation messages)
└── Error Red: #e74c3c (Error messages)
```

## Typography

```
Headings: Playfair Display (Serif)
- Elegant, traditional feel
- Used for main titles and event names

Body Text: Montserrat (Sans-serif)
- Clean, modern readability
- Used for all body text and forms
```

## Integration Points

1. **Google Apps Script**
   - Receives form submissions via POST
   - Stores data in Google Sheets
   - Sends confirmation emails
   - Tracks capacity for VIP reservations

2. **Email Service**
   - Uses Gmail via Google Apps Script
   - Sends HTML-formatted confirmation emails
   - Different templates for Late Night vs VIP

3. **Calendar Integration**
   - Apple Calendar: Downloads .ics file
   - Google Calendar: Opens in new tab with pre-filled data
   - Time-specific entries for VIP reservations

## Security Considerations

- VIP page accessible only via direct URL
- No password protection (consider adding if needed)
- All data stored in private Google Sheets
- CORS handling for cross-origin requests
- Input validation on both client and server side

## Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers (iOS Safari, Chrome)

## Performance

- Lightweight design (~50KB total)
- Google Fonts loaded asynchronously
- No heavy JavaScript frameworks
- Fast page load times
- Minimal external dependencies
