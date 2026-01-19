# 🩸 BloodConnect - Blood Donation Management Platform

A comprehensive full-stack Blood Donation Management Platform built with the MERN stack (MongoDB, Express.js, React, Node.js). This platform connects blood donors, receivers, hospitals/blood banks, and administrators in a seamless ecosystem designed to save lives.

## 📘 Interactive Guide

See [PROJECT_GUIDE.md](PROJECT_GUIDE.md) for a clean runbook (setup, env, run commands, troubleshooting).

![BloodConnect Banner](https://via.placeholder.com/1200x400/DC2626/FFFFFF?text=BloodConnect+-+Saving+Lives+Together)

## 🌟 Features

### For Donors

- 📝 Easy registration with blood type and health information
- 🔔 Real-time notifications for matching blood requests
- 📍 Location-based request matching
- 🏆 Gamification with badges, points, and leaderboards
- 📅 Appointment scheduling at partner hospitals
- 📊 Personal donation history and statistics
- 🎯 Eligibility tracking (56-day cooling period)

### For Receivers/Patients

- 🆘 Create blood requests with urgency levels
- 🔍 Find compatible donors nearby
- 🏥 Discover blood banks and hospitals
- 📱 Real-time status updates on requests
- 👥 View and accept donor responses

### For Hospitals/Blood Banks

- 📦 Comprehensive blood inventory management
- 📈 Stock level monitoring with alerts
- 🩺 Record donations and manage donors
- 📅 Organize blood drives
- 📊 Analytics and reporting dashboard
- ⚠️ Low stock and expiry alerts

### For Administrators

- 👥 User management and verification
- 🏥 Hospital verification and approval
- 📊 Platform-wide analytics
- 📢 System-wide announcements
- 🔧 System health monitoring

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **Nodemailer** - Email service
- **node-cron** - Scheduled jobs

### Frontend

- **React 18** - UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Chart.js / Recharts** - Data visualization
- **Leaflet** - Maps integration
- **Socket.io Client** - Real-time updates
- **React Hook Form** - Form handling

## 📁 Project Structure

```
blood-donation-platform/
├── server/                     # Backend
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── constants.js       # App constants & blood compatibility
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── validators.js      # Request validation
│   │   └── errorHandler.js    # Global error handling
│   ├── models/
│   │   ├── User.js            # Base user model
│   │   ├── DonorProfile.js    # Donor-specific data
│   │   ├── BloodRequest.js    # Blood requests
│   │   ├── Hospital.js        # Hospital profiles
│   │   ├── BloodStock.js      # Blood inventory
│   │   ├── Donation.js        # Donation records
│   │   ├── Notification.js    # Notifications
│   │   └── Schedule.js        # Appointments & events
│   ├── routes/
│   │   ├── auth.routes.js     # Authentication
│   │   ├── donor.routes.js    # Donor endpoints
│   │   ├── request.routes.js  # Blood requests
│   │   ├── hospital.routes.js # Hospital endpoints
│   │   ├── admin.routes.js    # Admin endpoints
│   │   ├── notification.routes.js
│   │   └── schedule.routes.js
│   ├── socket/
│   │   └── socketHandler.js   # Socket.io events
│   ├── services/
│   │   ├── emailService.js    # Email templates
│   │   └── scheduledJobs.js   # Cron jobs
│   └── index.js               # Server entry point
│
├── client/                     # Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.js
│   │   │       ├── Sidebar.js
│   │   │       ├── Footer.js
│   │   │       ├── LoadingScreen.js
│   │   │       └── ProtectedRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── pages/
│   │   │   ├── Landing.js
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── donor/
│   │   │   │   └── DonorDashboard.js
│   │   │   ├── receiver/
│   │   │   │   └── ReceiverDashboard.js
│   │   │   ├── hospital/
│   │   │   │   └── HospitalDashboard.js
│   │   │   └── admin/
│   │   │       └── AdminDashboard.js
│   │   ├── services/
│   │   │   └── api.js         # Axios API service
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
├── .env.example
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/blood-donation-platform.git
cd blood-donation-platform
```

2. **Install server dependencies**

```bash
npm install
```

3. **Install client dependencies**

```bash
cd client
npm install
```

4. **Configure environment variables**

```bash
# In root directory
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/blood-donation

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=BloodConnect <noreply@bloodconnect.com>

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

5. **Start the development servers**

In separate terminals:

```bash
# Start backend (from root)
npm run dev

# Start frontend (from client folder)
cd client
npm start
```

6. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 🔑 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | User login        |
| POST   | `/api/auth/logout`   | User logout       |
| GET    | `/api/auth/profile`  | Get user profile  |
| PUT    | `/api/auth/profile`  | Update profile    |

### Donors

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| POST   | `/api/donors/profile`                | Create donor profile   |
| GET    | `/api/donors/search`                 | Search donors          |
| GET    | `/api/donors/nearby`                 | Find nearby donors     |
| GET    | `/api/donors/compatible/:bloodGroup` | Find compatible donors |

### Blood Requests

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| POST   | `/api/requests`            | Create request      |
| GET    | `/api/requests`            | List all requests   |
| GET    | `/api/requests/:id`        | Get request details |
| PATCH  | `/api/requests/:id/status` | Update status       |

### Hospitals

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| POST   | `/api/hospitals/register` | Register hospital     |
| GET    | `/api/hospitals/nearby`   | Find nearby hospitals |
| GET    | `/api/hospitals/stock`    | Get blood stock       |
| POST   | `/api/hospitals/stock`    | Update stock          |

## 🩸 Blood Type Compatibility

The platform implements complete blood type compatibility logic:

| Blood Type | Can Donate To    | Can Receive From |
| ---------- | ---------------- | ---------------- |
| O-         | All types        | O-               |
| O+         | O+, A+, B+, AB+  | O-, O+           |
| A-         | A-, A+, AB-, AB+ | O-, A-           |
| A+         | A+, AB+          | O-, O+, A-, A+   |
| B-         | B-, B+, AB-, AB+ | O-, B-           |
| B+         | B+, AB+          | O-, O+, B-, B+   |
| AB-        | AB-, AB+         | O-, A-, B-, AB-  |
| AB+        | AB+              | All types        |

## 🔒 Security Features

- JWT-based authentication with httpOnly cookies
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- CORS configuration
- XSS protection

## 📧 Email Notifications

The platform sends automated emails for:

- Welcome emails on registration
- Email verification
- Password reset
- Blood request alerts
- Donation reminders
- Eligibility notifications
- Request status updates

## ⏰ Scheduled Jobs

Background jobs handle:

- Donor eligibility restoration (after 56 days)
- Blood stock expiry alerts
- Appointment reminders
- Request expiry cleanup
- Weekly donation reminders

## 🎮 Gamification

Donors earn points and badges:

- **Points**: 100 points per donation
- **Badges**: First Timer, Guardian, Champion, Super Hero, Legendary Hero
- **Leaderboards**: Track top donors

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Blood drive RSVP system
- [ ] Social sharing
- [ ] Multi-language support
- [ ] PWA support

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Acknowledgments

- All blood donors who save lives every day
- Healthcare workers and blood bank staff
- Open source community

---

<p align="center">
  Made with ❤️ for saving lives
  <br>
  <strong>Every drop counts. Every life matters.</strong>
</p>
