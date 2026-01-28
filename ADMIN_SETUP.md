# Admin Dashboard Setup Guide

## Overview

The Globalix Admin Dashboard is a complete control center for managing your real estate and car rental platform. It provides:

- **Real-time Activity Monitoring** - Track all user activities (sign-ups, logins, property views, inquiries)
- **Earnings Management** - Monitor revenue, transactions, and payment status
- **Analytics & Charts** - View trends, user growth, and revenue analytics
- **User Management** - Manage all registered users and their status
- **Responsive Design** - Works perfectly on mobile (Facebook-like) and desktop

## Quick Start

### 1. Make sure Backend is Running

```bash
# In apps/globalix-group-backend/
npm run dev
# Should output: 🚀 Server running on http://localhost:3000
```

The backend provides all admin API endpoints at: `http://localhost:3000/admin/api`

### 2. Start Admin Dashboard

```bash
# In apps/admin-dashboard/
npm run dev
# Visit: http://localhost:3000
```

Note: The dashboard runs on its own port, typically 3001, but can access backend on 3000.

### 3. Login

Use demo credentials:
- **Email:** `admin@globalix.com`
- **Password:** `admin123`

## Project Structure

```
apps/admin-dashboard/
├── src/
│   ├── pages/               # Next.js pages
│   │   ├── login.tsx       # Admin login page
│   │   ├── dashboard.tsx   # Dashboard home
│   │   ├── activity.tsx    # Activity logs
│   │   ├── analytics.tsx   # Charts & analytics
│   │   ├── earnings.tsx    # Revenue tracking
│   │   └── users.tsx       # User management
│   ├── components/         # React components
│   │   ├── Layout.tsx      # Main layout
│   │   ├── Header.tsx      # Top bar
│   │   ├── Sidebar.tsx     # Navigation
│   │   └── StatCard.tsx    # Reusable cards
│   ├── context/            # State management
│   │   └── AdminContext.tsx # Auth context
│   ├── api/                # API integration
│   │   └── adminClient.ts  # Axios client
│   └── styles/             # CSS
│       └── globals.css     # Tailwind styles
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Admin Dashboard Features

### 📊 Dashboard Page
- Overview cards showing key metrics
- Total users, active users, earnings, inquiries
- Recent activity feed
- Quick access buttons to other sections

### 📝 Activity Logs Page
- Real-time activity monitoring
- Filter by activity type (login, signup, property view, etc.)
- Search functionality
- Pagination support
- Shows user ID, action, timestamp

### 📈 Analytics Page
- Interactive charts using Recharts
- User growth trends (line chart)
- Revenue trends (bar chart)
- Inquiry statistics
- Configurable time periods (7, 14, 30, 90 days)
- Summary statistics

### 💰 Earnings Page
- Revenue overview cards
- Total, completed, and pending earnings
- Transaction table with status
- Revenue breakdown by source
- Export report functionality
- Period filtering (today, week, month, all-time)

### 👥 Users Page
- Complete user directory
- Search users by name/email
- Filter by status (active, inactive, suspended)
- User join date tracking
- User statistics overview
- Pagination support

## Responsive Design (Mobile & Web)

### Mobile Features (< 768px)
- **Hamburger Menu Navigation**
  - Side menu slides in from left
  - Overlay closes menu when tapped
  - Touch-friendly button sizes
  
- **Stacked Layout**
  - Single column cards
  - Full-width tables with scroll
  - Optimized spacing for thumb navigation
  
- **Mobile-First Tables**
  - Horizontal scroll for data tables
  - Compact cell padding
  - Essential info displayed first

### Desktop Features (>= 768px)
- **Persistent Sidebar**
  - Always visible navigation
  - Quick menu access
  - User profile dropdown
  
- **Multi-column Layouts**
  - 2-4 column grid layouts
  - Side-by-side data display
  - Efficient space usage
  
- **Advanced Features**
  - Hover effects on rows
  - Full-featured tables
  - Expanded chart displays

## Backend API Endpoints

The admin dashboard uses these backend endpoints:

```
POST   /admin/api/login              # Admin login
GET    /admin/api/dashboard          # Dashboard stats
GET    /admin/api/activity           # Activity logs with filtering
GET    /admin/api/earnings           # Earnings & transactions
GET    /admin/api/analytics          # Chart data
GET    /admin/api/users              # User list
GET    /admin/api/auth-stats         # Auth statistics
```

## Authentication Flow

1. User enters email and password on login page
2. Backend validates credentials and returns JWT token
3. Token stored in localStorage and context
4. All API requests include Authorization header with token
5. Protected routes redirect to login if no valid token

## Environment Configuration

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Running in Production

### Build
```bash
npm run build
npm start
```

The dashboard builds into optimized static files and can be served on any static host (Vercel, Netlify, etc.)

## Troubleshooting

### "Cannot connect to API" error
- Ensure backend is running on http://localhost:3000
- Check NEXT_PUBLIC_API_URL is set correctly
- Verify CORS is enabled in backend

### Login not working
- Check demo credentials: admin@globalix.com / admin123
- Verify backend has admin routes loaded
- Check browser console for error messages

### Charts not showing
- Ensure Recharts is installed: `npm list recharts`
- Check browser console for data errors
- Verify API returns data in correct format

### Mobile menu not appearing
- Check window size is < 768px
- Verify Menu icon is visible
- Check CSS is loading correctly

## Development Tips

### Add New Admin Route
1. Create page in `src/pages/`
2. Import Layout component
3. Add to Sidebar menu in `src/components/Sidebar.tsx`
4. Create API client method in `src/api/adminClient.ts`

### Add New API Endpoint
1. Create route handler in backend `src/routes/admin.ts`
2. Add client method in `src/api/adminClient.ts`
3. Use in component with `adminApi.methodName()`

### Styling with Tailwind
- Use utility classes for styling
- Breakpoints: sm, md, lg, xl
- Mobile-first approach
- Dark mode ready with `dark:` prefix

## Performance Optimization

- Next.js automatic code splitting
- Image optimization with Next Image
- CSS minification with Tailwind
- API data caching with React hooks
- Lazy loading of components

## Security Notes

- JWT tokens expire after 24 hours
- Tokens stored securely in localStorage
- API calls use HTTPS in production
- Admin routes require authentication
- Sensitive data not logged in console

## Support

For issues or questions:
1. Check backend is running
2. Verify environment variables
3. Check browser console for errors
4. Review API response in Network tab

## Next Steps

1. ✅ Admin Dashboard created
2. ✅ Backend admin routes created
3. Next: Connect live PostgreSQL database
4. Next: Implement real-time WebSocket updates
5. Next: Add email notification system
