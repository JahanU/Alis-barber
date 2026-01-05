# Ali's Barbers - Booking App

A beautiful, modern web application for barber shop appointments with Google Calendar integration.

![Ali's Barbers](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎨 **Beautiful UI/UX** - Premium dark theme with gold accents and smooth animations
- 📅 **Google Calendar Integration** - Automatic appointment syncing with customer calendars
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Fast & Modern** - Built with Vite and React for optimal performance
- ✂️ **Service Selection** - Multiple barber services with visual selection
- 🕐 **Time Slot Booking** - Easy 1-hour slot selection (9 AM - 6 PM)
- ✅ **Form Validation** - Real-time validation with helpful error messages
- 🎭 **Glassmorphism Design** - Modern UI effects with backdrop blur

## 🚀 Getting Started

### Prerequisites

- Node.js 14.0.0 or higher
- npm 5.6 or higher
- Google Cloud account (for Calendar API)

### Installation

1. Clone the repository (or you already have it!)
   ```bash
   cd ali-barbers
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Google Calendar API
   - Follow the detailed guide in [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)
   - Add your Google Calendar service account credentials to `.env`

4. Set up Supabase access
   - Provide your Supabase URL and service role key in `.env.local`
   - Ensure your Supabase tables (appointments, staff, staff_availability) are created

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## 🛠️ Built With

- **[React](https://react.dev/)** - UI library
- **[Vite](https://vite.dev/)** - Build tool and dev server
- **[Supabase](https://supabase.com/)** - Database and backend-as-a-service
- **[Google Calendar API](https://developers.google.com/calendar)** - Calendar integration
- **[gapi-script](https://www.npmjs.com/package/gapi-script)** - Google API client
- **[date-fns](https://date-fns.org/)** - Date manipulation
- **[React Icons](https://react-icons.github.io/react-icons/)** - Icon library

## 📂 Project Structure

```
ali-barbers/
├── src/
│   ├── components/          # React components
│   │   ├── Hero.jsx         # Landing hero section
│   │   ├── BookingForm.jsx  # Booking form
│   │   ├── TimeSlotPicker.jsx
│   │   ├── ConfirmationModal.jsx
│   │   └── *.css            # Component styles
│   ├── services/            # Business logic
│   │   └── googleCalendar.js # Calendar API integration
│   ├── config/              # Configuration
│   │   └── calendar.js      # Calendar settings
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles & design system
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── GOOGLE_CALENDAR_SETUP.md # Setup guide
└── package.json             # Dependencies
```

## 🎨 Design System

The app uses a carefully crafted design system:

- **Colors**: Dark theme (#0a0a0a) with gold accents (#DAA520)
- **Typography**: Playfair Display (headings) + Inter (body)
- **Effects**: Glassmorphism, smooth animations, hover effects
- **Responsive**: Mobile-first with breakpoints at 768px

## 📋 Services Available

1. **Classic Haircut** - Traditional haircut styled to perfection
2. **Beard Trim & Shape** - Professional beard grooming
3. **Full Service** - Complete haircut and beard service
4. **Hot Towel Shave** - Luxurious traditional shave

## 🔧 Configuration

### Google Calendar Settings

Edit `src/config/calendar.js`:

```javascript
export const GOOGLE_CONFIG = {
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Replace this
  scopes: 'https://www.googleapis.com/auth/calendar.events',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
};

export const CALENDAR_SETTINGS = {
  calendarId: 'primary',
  eventDuration: 1, // hours
  businessHours: {
    start: 9,  // 9 AM
    end: 18,   // 6 PM
  },
  timeZone: 'America/New_York', // Update to your timezone
};
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

> **Important**: Ensure your Google Calendar environment variables are set correctly for production.

## 📸 Screenshots

*Screenshots are embedded in the walkthrough documentation*

## 🎯 How It Works

1. **Customer visits** the landing page
2. **Clicks "Book Now"** to start the booking process
3. **Fills in** personal information (name, email, phone)
4. **Selects** desired service from available options
5. **Chooses** date and time slot
6. **Confirms** the booking
7. **Adds to Calendar** - Calendar event is created automatically and a .ics file is provided for personal calendars
8. **Receives** email reminders (1 day before and 1 hour before)

## 🔐 Security & Privacy

- Calendar writes use a server-side Google service account; no customer OAuth required
- No passwords stored; minimal data stored only for appointment booking
- Calendar access is scoped to event creation only

## 🐛 Troubleshooting

See [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) for common issues and solutions.

## 📝 Future Enhancements

- [ ] Backend integration for booking storage
- [ ] Real-time availability checking
- [ ] Multiple barber selection
- [ ] Email notifications via backend
- [ ] Customer booking history
- [ ] SMS reminders
- [ ] Payment integration

## 📄 License

MIT License - feel free to use this project for your own barber shop!

## 🙏 Acknowledgments

- Design inspiration from modern barber shop aesthetics
- Google Calendar API for seamless integration
- Vite team for amazing developer experience

---

**Made with ✂️ by Ali's Barbers**

For questions or support, please contact: [your-email@example.com]
# Ali-barbers
