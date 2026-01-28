# Globalix Admin Dashboard

Complete admin control center for the Globalix real estate and car rental platform. Manage users, track earnings, monitor activities, and view analytics - all from a single responsive dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Backend running on http://localhost:3000 (see Backend Setup below)

### Installation

```bash
cd apps/admin-dashboard
npm install
npm run dev
```

Visit `http://localhost:3000` and log in with:
- **Email:** `admin@globalix.com`
- **Password:** `admin123`

## 📊 Features

### Dashboard
- **Real-time Statistics**
  - Total users count
  - Active users tracking
  - Total earnings overview
  - Pending inquiries count
  - New signups today
  - Total logins

- **Quick Stats Panel**
  - New signups today
  - Total logins
  - Conversion rates

- **Recent Activity Feed**
  - Latest user activities
  - Sign-ins and sign-ups
  - Property/car views
  - Inquiries submitted

### Activity Logs
- **Real-time Activity Tracking**
  - Login/Signup events
  - Property viewing
  - Car viewing
  - User inquiries
  - Transaction attempts

- **Advanced Filtering**
  - Filter by activity type
  - Search by action text
  - Date range filtering
  - Pagination support

- **Activity Types**
  - 🔐 Login - User authentication
  - ✨ Signup - New user registration
  - 🏠 Property View - Property listing views
  - 🚗 Car View - Car listing views
  - ❓ Inquiry - User inquiries submitted
  - 🛒 Purchase - Transaction attempts

### Analytics & Charts
- **User Growth Trends**
  - Line chart showing user signups over time
  - New users per day analysis
  - Login frequency tracking

- **Revenue Analysis**
  - Bar chart showing daily earnings
  - Revenue trends over selected period
  - Total revenue calculation

- **Inquiry Trends**
  - User inquiry tracking
  - Inquiry volume over time
  - Conversion analysis

- **Time Period Selection**
  - Last 7 days
  - Last 14 days
  - Last 30 days
  - Last 90 days

- **Summary Statistics**
  - Total users this period
  - Total revenue
  - Total inquiries
  - Total logins

### Earnings & Transactions
- **Revenue Overview**
  - Total earnings display
  - Completed transactions amount
  - Pending payments tracking

- **Transaction Management**
  - View all transactions
  - Filter by period (today, week, month, all-time)
  - Transaction status tracking
  - Revenue source breakdown

- **Revenue Breakdown**
  - Property sales revenue
  - Car rental revenue
  - Commission tracking
  - Visual progress bars

- **Transaction Types**
  - 🏠 Property Sale
  - 🚗 Car Rental
  - 💼 Commission
  - ↩️ Refund
  - 💸 Payout

### User Management
- **User Directory**
  - View all registered users
  - User profile information
  - Account status tracking
  - Join date display

- **User Search & Filter**
  - Search by name or email
  - Filter by status (active, inactive, suspended)
  - Pagination for large user lists

- **User Statistics**
  - Active users count
  - Inactive users count
  - Suspended users count
  - User growth trends

- **User Status Options**
  - ✅ Active - Verified and active users
  - ⏸️ Inactive - Inactive for 30+ days
  - 🚫 Suspended - Requires admin review

## 🎨 Responsive Design

### Mobile Optimization
- **Hamburger Navigation Menu**
  - Collapsible sidebar on mobile
  - Touch-friendly navigation
  - Smooth transitions

- **Mobile-First Layout**
  - Single column on small screens
  - Stacked cards and tables
  - Full-width content areas
  - Optimized touch targets

- **Responsive Breakpoints**
  - `sm`: 640px - Small devices
  - `md`: 768px - Tablets
  - `lg`: 1024px - Desktops
  - `xl`: 1280px - Large screens

### Desktop Experience
- **Persistent Sidebar Navigation**
  - Quick access to all sections
  - Active page highlighting
  - User profile menu
  - Logout functionality

- **Multi-column Layouts**
  - Side-by-side data display
  - Efficient use of screen space
  - Grid-based card layouts

## 🔐 Security

### Authentication
- **JWT Token-based Authentication**
  - Secure login flow
  - Token persistence in localStorage
  - Automatic logout on session expiry
  - Protected routes with auth guards

### Protected Routes
- Login page accessible to everyone
- All dashboard pages require authentication
- Automatic redirect to login if session expires
- Secure API communication

## 🛠 Technology Stack

### Frontend
- **Next.js 14.0.4** - React framework with SSR
- **React 18.2.0** - UI library
- **TypeScript** - Type-safe development
- **TailwindCSS 3.3.6** - Utility-first CSS
- **Recharts 2.10.4** - Data visualization
- **Lucide React 0.309.0** - Icon library
- **Axios** - HTTP client
- **date-fns** - Date utilities

### Styling
- TailwindCSS with custom configuration
- PostCSS for CSS processing
- Responsive grid and flex utilities
- Custom animations and transitions

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── pages/
│   │   ├── _app.tsx              # App wrapper with providers
│   │   ├── index.tsx             # Landing page
│   │   ├── login.tsx             # Admin login page
│   │   ├── dashboard.tsx         # Main dashboard
│   │   ├── activity.tsx          # Activity logs page
│   │   ├── analytics.tsx         # Analytics & charts
│   │   ├── earnings.tsx          # Earnings & transactions
│   │   └── users.tsx             # User management
│   ├── components/
│   │   ├── Layout.tsx            # Main layout wrapper
│   │   ├── Header.tsx            # Top navigation bar
│   │   ├── Sidebar.tsx           # Side navigation
│   │   └── StatCard.tsx          # Reusable stat card
│   ├── context/
│   │   └── AdminContext.tsx      # Admin auth context
│   ├── api/
│   │   └── adminClient.ts        # API client configuration
│   ├── utils/
│   │   └── withAuth.tsx          # Auth guard HOC
│   └── styles/
│       └── globals.css           # Global styles
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔌 API Integration

### Backend Connection
The admin dashboard communicates with the backend API at `http://localhost:3000/admin/api`

### Available Endpoints

#### Authentication
```
POST /admin/api/login
- Email: admin@globalix.com
- Password: admin123
- Returns: JWT token + admin info
```

#### Dashboard
```
GET /admin/api/dashboard
- Returns: Dashboard statistics
```

#### Activity
```
GET /admin/api/activity?limit=50&offset=0&type=login
- Returns: Activity logs with filtering
```

#### Earnings
```
GET /admin/api/earnings?period=all|today|week|month
- Returns: Transactions and earnings data
```

#### Analytics
```
GET /admin/api/analytics?days=30
- Returns: Chart data for 30 days
```

#### Users
```
GET /admin/api/users?limit=20&offset=0&search=query
- Returns: User list with search/pagination
```

#### Auth Stats
```
GET /admin/api/auth-stats
- Returns: Sign-in/sign-up statistics
```

## 🚀 Development

### Scripts
```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Building
```bash
npm run build
npm start
```

## 📱 Responsive Design Features

### Mobile Navigation
- Hamburger menu icon appears on screens < 768px
- Sidebar slides in from left with overlay
- Touch-friendly button sizes (48px minimum)
- Smooth transitions between states

### Adaptive Layouts
- Cards stack vertically on mobile
- Tables become scrollable on small screens
- Charts scale responsively
- Grid adjusts column count based on screen size

### Touch Optimization
- Larger tap targets (minimum 44x44px)
- Reduced spacing on mobile
- Optimized font sizes for readability
- Single-column layouts

## 🎯 Key Pages

### 1. Login Page (`/login`)
- Secure admin authentication
- Demo credentials display
- Error handling and validation
- Remember me functionality

### 2. Dashboard (`/dashboard`)
- Overview of key metrics
- Real-time statistics
- Recent activity preview
- Quick access to other pages

### 3. Activity Logs (`/activity`)
- Comprehensive activity tracking
- Advanced filtering by type
- Search functionality
- Sortable table with pagination

### 4. Analytics (`/analytics`)
- Interactive charts using Recharts
- Multiple time periods
- Revenue trends
- User growth analysis
- Inquiry statistics

### 5. Earnings (`/earnings`)
- Revenue tracking
- Transaction history
- Payment status overview
- Revenue breakdown by source

### 6. Users (`/users`)
- Complete user directory
- Search and filter capabilities
- User status management
- Activity history per user

## 🔄 Real-time Features (Ready for Enhancement)

The dashboard is built to support:
- WebSocket connections for live updates
- Real-time activity streaming
- Live notification system
- Automatic data refresh intervals

## 📞 Support & Documentation

### Next Steps for Full Database Integration
1. Connect PostgreSQL database to backend
2. Enable live data fetching from database
3. Implement WebSocket for real-time updates
4. Add authentication with real admin accounts
5. Set up email notifications

## 🌟 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Email notification system
- [ ] Export data to PDF/CSV
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Two-factor authentication
- [ ] Audit logs export
- [ ] Custom dashboard widgets
- [ ] Advanced filtering and search
- [ ] User activity heat maps

## 📝 License

Part of the Globalix platform

## 🤝 Contributing

Follow the existing code patterns and maintain TypeScript strict mode.
