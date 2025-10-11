# 🏛️ ResolveHub - Municipal Complaint Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)

**ResolveHub** is a modern, AI-powered municipal complaint management system that helps cities efficiently handle citizen complaints with automated triage, SLA tracking, and real-time escalation management.

## 🌟 Features

### 🔐 **Authentication & Authorization**
- **Multi-Provider OAuth**: Google & GitHub login integration
- **Role-Based Access Control**: Citizens, Staff, and Admins with distinct permissions
- **JWT Security**: Secure token-based authentication

### 🤖 **AI-Powered Triage System**
- **Automatic Categorization**: ML models classify complaints into departments (Sanitation, Electrical, Plumbing, Structural)
- **Smart Assignment**: Auto-assigns complaints to appropriate staff based on location and department
- **Image Analysis**: TensorFlow-powered image classification for visual complaints

### ⏱️ **SLA Tracking & Escalation**
- **Configurable Deadlines**: Department-specific SLA timelines
  - Electrical: 12 hours (safety critical)
  - Sanitation: 24 hours (public health)
  - Plumbing: 48 hours (infrastructure)
  - Structural: 72 hours (complex repairs)
- **3-Level Escalation**: Automatic escalation to supervisors and administrators
- **Real-Time Monitoring**: Live SLA compliance tracking and alerts

### 🗺️ **Geospatial Features**
- **Interactive Maps**: Google Maps integration for complaint visualization
- **Heatmap Analytics**: Visual density mapping of complaint hotspots
- **Location Intelligence**: Geocoding and reverse geocoding for precise locations
- **Street View Integration**: Contextual location viewing

### 🎮 **Gamification System**
- **Performance Leaderboards**: Staff ranking based on resolution metrics
- **Achievement Badges**: Recognition for outstanding performance
- **Points System**: Reward-based motivation for efficient complaint handling

### 📊 **Analytics & Reporting**
- **Real-Time Dashboards**: Comprehensive statistics and metrics
- **SLA Compliance Reports**: Performance tracking and trend analysis
- **Export Capabilities**: Data export for external analysis
- **Custom Filters**: Date range and category-based filtering

### 📱 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Eye-friendly interface with theme switching
- **Glass Morphism**: Modern, elegant design language
- **Progressive Loading**: Optimized performance with lazy loading

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Elegant notifications
- **Lucide React** - Beautiful icons

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Passport** - Authentication middleware
- **Multer** - File upload handling
- **Node-cron** - Scheduled tasks

### **AI & ML**
- **TensorFlow.js** - Machine learning
- **MobileNetV2** - Image classification model
- **Custom ML Pipeline** - Complaint categorization

### **External Services**
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Media storage and optimization
- **Google Maps API** - Mapping and geocoding
- **SendGrid** - Email notifications
- **Twilio** - SMS notifications

### **DevOps & Deployment**
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Google Maps API key
- Cloudinary account

### 1. Clone Repository
```bash
git clone https://github.com/SHREYANSH2K25/ResolveHub.git
cd ResolveHub
```

### 2. Backend Setup
```bash
cd BACKEND

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run server
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies  
npm install

# Create environment file
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start development server
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## ⚙️ Configuration

### Backend Environment Variables (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/resolvehub

# Authentication
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# External Services
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

GOOGLE_API_KEY=your-google-maps-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Admin Configuration
ADMIN_EMAIL=admin@resolvehub.com
```

### Frontend Environment Variables (.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🏗️ Project Structure

```
ResolveHub/
├── BACKEND/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic services
│   ├── server.js           # Express server entry point
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API services
│   │   └── assets/         # Static assets
│   ├── index.html          # HTML entry point
│   └── package.json        # Frontend dependencies
└── README.md              # Project documentation
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

### Complaints
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Submit complaint
- `PUT /api/complaints/:id/status` - Update status
- `GET /api/complaints/history` - User complaint history
- `GET /api/complaints/heatmap` - Heatmap data

### SLA Management
- `GET /api/complaints/sla/stats` - SLA statistics
- `GET /api/complaints/sla/overdue` - Overdue complaints
- `POST /api/complaints/sla/process` - Manual SLA processing

### Admin
- `POST /api/admin/create-staff` - Create staff user
- `GET /api/admin/statistics` - System statistics
- `GET /api/admin/leaderboard` - Performance leaderboard

## 🚀 Deployment

### Free Tier Deployment (Recommended)

#### 1. Database (MongoDB Atlas)
- Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Whitelist IP: 0.0.0.0/0 for production access

#### 2. Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd BACKEND
railway login
railway init
railway up
```

#### 3. Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
npm run build
vercel --prod
```

#### 4. Environment Configuration
- Update OAuth callback URLs with production domains
- Set production environment variables in Railway and Vercel dashboards
- Update CORS origins in backend to include production frontend URL

### Production URLs
- **Frontend**: `https://resolvehub-frontend.vercel.app`
- **Backend**: `https://resolvehub-backend.railway.app`

## 🧪 Testing

### Development Testing
```bash
# Backend tests
cd BACKEND
npm test

# Frontend tests  
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] OAuth authentication (Google, GitHub)
- [ ] Complaint submission with file upload
- [ ] AI categorization and assignment
- [ ] SLA tracking and escalation
- [ ] Heatmap visualization
- [ ] Admin dashboard functionality
- [ ] Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** for AI/ML capabilities
- **Google Maps Platform** for geospatial features
- **MongoDB Atlas** for database hosting
- **Cloudinary** for media management
- **Railway & Vercel** for deployment platforms

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/SHREYANSH2K25/ResolveHub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SHREYANSH2K25/ResolveHub/discussions)
- **Email**: shreyanshjain354@gmail.com

*ResolveHub - Transforming citizen complaints into actionable solutions*
