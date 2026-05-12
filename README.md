# AI-Powered Resume Screening System

**Published Research**: [International Journal of Recent Scientific Engineering Research and Innovation (IJRSERI)](https://www.doi.org/10.59256/ijsreat.20250506017)

A comprehensive job matching and application tracking system that leverages Google's Gemini AI to analyze resumes, provide ATS optimization, and facilitate seamless communication between recruiters and applicants.

## Features

### For Recruiters
- **Job Management**: Post, edit, and manage job listings with detailed requirements and skill weights
- **Application Review**: View applications with AI-generated match scores and detailed analysis
- **Candidate Insights**: Get comprehensive insights into candidate skills and qualifications
- **Automated Feedback**: Send personalized feedback to applicants with one click
- **Real-time Notifications**: Instant alerts for new applications and status updates
- **Messaging System**: Built-in communication with applicants via email integration
- **Application Management**: Accept, reject, and track application statuses

### For Applicants
- **Job Discovery**: Browse and search for relevant job opportunities
- **Smart Applications**: Apply with resume upload and automatic ATS analysis
- **AI Resume Analysis**: Get detailed ATS scores, skill matching, and optimization suggestions
- **Personalized Feedback**: Receive constructive feedback on skills and improvement areas
- **Skill Development**: Get course recommendations based on resume analysis
- **Application Tracking**: Monitor application status and recruiter responses
- **Real-time Notifications**: Stay updated on application progress
- **Messaging**: Communicate directly with recruiters

### Technical Features
- **Multi-Service Architecture**: Scalable microservices architecture
- **JWT Authentication**: Secure user authentication and authorization
- **Real-time Updates**: Live notifications and messaging
- **ATS Optimization**: AI-powered resume analysis and scoring
- **Skill Matching**: Intelligent job-candidate compatibility scoring
- **Data Isolation**: User-specific data storage and privacy
- **Responsive Design**: Modern, mobile-friendly interface

## Architecture

### Backend Services
- **Auth Service** (Port 5001): Authentication, jobs, applications, notifications, messaging
- **ATS Service** (Port 5000): Resume analysis and ATS scoring
- **Job Matching AI** (Port 5002): AI-powered job-candidate matching

### Frontend
- **Next.js 14**: Modern React framework with TypeScript
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: Beautiful, accessible UI components
- **Dark/Light Mode**: Theme switching support

### Database
- **MongoDB**: NoSQL database for flexible data storage
- **Collections**: users, jobs, applications, notifications, messages

## Technical Setup

### Prerequisites
- Python 3.8 or higher
- MongoDB (running locally or accessible)
- Node.js 18+ and npm
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-powered-resume-screening-system
```

2. **Set up Backend Environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up Frontend Environment**
```bash
cd frontend
npm install
```

4. **Configure Environment Variables**
```bash
cp .env.example .env
```
Edit `.env` file and add:
- `GOOGLE_API_KEY`: Your Google Gemini API key
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET_KEY`: Your JWT secret key

### Running Application

#### 🚀 Quick Start (Recommended)
```bash
python run.py
```
This single command starts all services automatically:
- **Auth Service**: http://localhost:5001
- **ATS Service**: http://localhost:5000
- **Job Matching AI**: http://localhost:5002
- **Frontend**: http://localhost:3000

#### 🔧 Manual Start (Advanced)
```bash
# Terminal 1: Start Auth Service
python auth.py

# Terminal 2: Start ATS Service
python ats.py

# Terminal 3: Start Job Matching AI
python job_matching_ai.py

# Terminal 4: Start Frontend
cd frontend
npm run dev
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user` - Get current user info

### Job Management
- `GET /api/jobs` - Get all active jobs
- `POST /api/jobs` - Create new job (recruiters only)
- `GET /api/jobs/<id>` - Get job details
- `PUT /api/jobs/<id>` - Update job (recruiters only)
- `DELETE /api/jobs/<id>` - Delete job (recruiters only)

### Application Management
- `POST /api/jobs/<job_id>/apply` - Submit job application
- `GET /api/applications` - Get user applications
- `PUT /api/applications/<id>/status` - Update application status
- `GET /api/applications/<id>/feedback` - Get application feedback

### ATS Analysis
- `POST /api/analyze-resume` - Analyze resume against job description
- `POST /api/skill-recommendations` - Get skill development recommendations

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/read/<id>` - Mark notification as read

### Messaging
- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages/send` - Send message
- `GET /api/messages/<conversation_id>` - Get conversation messages

## How It Works

### Application Flow
1. **Job Application**: Applicant uploads resume and applies for job
2. **ATS Analysis**: Resume is automatically analyzed against job requirements
3. **Skill Matching**: AI calculates compatibility score based on weighted skills
4. **Recruiter Review**: Recruiters see match scores and detailed analysis
5. **Status Updates**: Recruiters can accept/reject with automated feedback
6. **Feedback Delivery**: Applicants receive personalized improvement suggestions

### AI Analysis Features
- **ATS Scoring**: Resume optimization score out of 100
- **Skill Extraction**: Automatic identification of technical skills
- **Job Matching**: Intelligent compatibility scoring
- **Improvement Suggestions**: Specific recommendations for resume enhancement
- **Course Recommendations**: Learning resources based on skill gaps

### Real-time Features
- **Live Notifications**: Instant alerts for applications and status changes
- **Messaging System**: Direct communication between recruiters and applicants
- **Status Tracking**: Real-time application status updates

## Key Technologies

### Backend
- **Flask**: Python web framework
- **MongoDB**: NoSQL database with PyMongo
- **JWT**: JSON Web Token authentication
- **Google Gemini AI**: Advanced AI analysis and scoring
- **Flask-CORS**: Cross-origin resource sharing
- **PyPDF2**: PDF text extraction
- **python-docx**: DOCX text extraction

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Recharts**: Data visualization library
- **Axios**: HTTP client for API requests

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

## Recent Bug Fixes

### Fixed Issues
- **Notification System**: Resolved inconsistent notification generation
- **Data Isolation**: Fixed ATS feedback leakage between users
- **Message Alignment**: Corrected message display in conversations
- **Duplicate Prevention**: Added checks for duplicate notifications
- **User Authentication**: Enhanced JWT token handling
- **Real-time Updates**: Improved notification and message polling

### Security Enhancements
- **User Data Isolation**: Each user sees only their own data
- **Secure Storage**: User-specific localStorage implementation
- **Input Validation**: Comprehensive API input validation
- **CORS Protection**: Cross-origin request security
- **Data Isolation**: User-specific data access controls
- **Session Management**: Secure session handling

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed
  role: String, // 'recruiter' | 'applicant'
  createdAt: Date,
  updatedAt: Date
}
```

### Jobs Collection
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  description: String,
  location: String,
  skills: [{ name: String, weight: Number }],
  recruiterId: String,
  recruiterEmail: String,
  active: Boolean,
  applications: [String], // application IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  jobId: String,
  jobTitle: String,
  companyName: String,
  applicantId: String,
  applicantName: String,
  applicantEmail: String,
  resumeData: String,
  matchScore: Number,
  status: String, // 'pending' | 'accepted' | 'rejected'
  feedback: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  type: String, // 'application' | 'status' | 'message'
  title: String,
  message: String,
  jobId: String,
  applicantName: String,
  jobTitle: String,
  read: Boolean,
  createdAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  senderId: String,
  senderEmail: String,
  receiverId: String,
  receiverEmail: String,
  jobId: String,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

## Getting API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign up for API access
3. Create a new API key
4. Add the key to your `.env` file as `GOOGLE_API_KEY`

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Get connection string
3. Add to `.env` file as `MONGODB_URI`

## Deployment

### Environment Variables
```env
GOOGLE_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/ai_resume_system
JWT_SECRET_KEY=your_jwt_secret_key_here
NODE_ENV=production
```

### Production Setup
1. **Backend Deployment**: Deploy Flask services to cloud provider
2. **Frontend Deployment**: Build and deploy Next.js app
3. **Database**: Use MongoDB Atlas for production
4. **Environment**: Configure production environment variables
5. **Domain**: Set up custom domain and SSL

## Mobile Responsiveness

The application is fully responsive and works seamlessly across:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout and navigation
- **Mobile**: Touch-friendly interface with simplified navigation

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Input Validation**: Comprehensive API input validation
- **CORS Protection**: Cross-origin request security
- **Data Isolation**: User-specific data access controls
- **Session Management**: Secure session handling

## Performance Optimizations

- **Lazy Loading**: Optimized component loading
- **Caching**: Efficient data caching strategies
- **Database Indexing**: Optimized query performance
- **API Optimization**: Efficient response handling
- **Frontend Optimization**: Code splitting and minification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Create an issue in the repository
- Check the documentation for common solutions
- Review the API documentation for endpoint usage

---