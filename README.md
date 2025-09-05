# 🚀 T&L LSG Assessment Tool

A modern, production-ready assessment and evaluation platform built with Next.js 15, TypeScript, and Tailwind CSS. This application provides comprehensive assessment capabilities with AI-powered insights and personalized recommendations.

## ✨ Features

- **🎯 Comprehensive Assessment**: Multi-dimensional evaluation across key areas
- **🤖 AI-Powered Insights**: Personalized recommendations and actionable insights
- **📱 Modern UI/UX**: Beautiful, responsive design with smooth animations
- **⚡ Real-time Processing**: Instant calculation and analysis
- **📧 Email Delivery**: Automated report delivery via email
- **🔒 Privacy First**: Secure data handling with user consent
- **📧 Business Email Validation**: Prevents generic/disposable emails with real-time feedback
- **🛡️ Enterprise Security**: Comprehensive security features including JWT, CSRF protection, rate limiting, and XSS prevention

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless backend functions
- **OpenAI API** - AI-powered report generation
- **Resend** - Reliable email delivery
- **Prisma** - Database ORM
- **PostgreSQL** - Database

### Infrastructure
- **Render** - Deployment and hosting
- **GitHub** - Version control and CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Resend API key
- PostgreSQL database

### 1. Clone and Install
```bash
git clone https://github.com/berteloot/T-L-LSG.git
cd T-L-LSG
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/tl_lsg_db

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
REPORT_FROM_EMAIL=reports@yourdomain.com
REPORT_FROM_NAME=T&L LSG Reports

# App Configuration
SITE_URL=http://localhost:3000

# Admin Access
ADMIN_PASSWORD=your_secure_admin_password_here
ADMIN_SESSION_SECRET=your-32+character-random-secret
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔐 Admin Panel

The app includes a secure admin panel at `/admin` that provides:

- **Secure Access**: Password-protected using `ADMIN_PASSWORD` environment variable
- **Data Viewing**: Browse all assessment submissions in a table format
- **CSV Export**: Download submissions data for analysis
- **Submission Details**: View scores, tiers, and AI reports
- **User Management**: Manage users and their submissions

**Security Features**:
- JWT-based authentication
- CSRF protection
- Rate limiting
- Brute force protection
- XSS prevention
- Input validation

## 📋 Assessment Structure

The assessment framework is designed to be flexible and customizable for different evaluation needs:

### Core Components
- **Multi-section Forms**: Organized assessment sections
- **Dynamic Scoring**: Configurable scoring algorithms
- **AI Analysis**: Intelligent report generation
- **Email Delivery**: Automated report distribution

### Data Models
- **Users**: User management and authentication
- **Submissions**: Assessment data and results
- **Reports**: AI-generated insights and recommendations

## 🎯 Scoring & Analysis

The platform provides:
- **Real-time Scoring**: Instant calculation of assessment results
- **Tier Classification**: Automated categorization based on scores
- **AI Insights**: Personalized recommendations and action items
- **Report Generation**: Comprehensive analysis reports

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── admin/          # Admin panel
│   └── page.tsx        # Main page
├── components/         # React components
│   ├── AssessmentForm.tsx
│   └── ContactModal.tsx
├── data/              # Static data
│   └── questions.ts   # Assessment questions
├── lib/               # Utility functions
│   ├── scoring.ts     # Score calculation
│   ├── prompt.ts      # AI prompt builder
│   ├── adminAuth.ts   # Admin authentication
│   └── sanitizer.ts   # XSS protection
└── types/             # TypeScript types
    └── index.ts
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm run db:push      # Push database schema
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

## 🚀 Deployment

### Render (Recommended)
1. Push your code to GitHub
2. Connect your repository to Render
3. Add environment variables in Render dashboard
4. Deploy automatically on push

### Environment Variables for Production
```env
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=your_production_openai_key
RESEND_API_KEY=your_production_resend_key
REPORT_FROM_EMAIL=reports@yourdomain.com
REPORT_FROM_NAME=T&L LSG Reports
SITE_URL=https://yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_SESSION_SECRET=your-32+character-random-secret
```

## 🔮 Customization

This framework is designed to be easily customizable for different assessment needs:

### Assessment Questions
- Modify `src/data/questions.ts` to customize assessment content
- Update scoring logic in `src/lib/scoring.ts`
- Customize AI prompts in `src/lib/prompt.ts`

### UI/UX
- Update Tailwind configuration in `tailwind.config.js`
- Modify components in `src/components/`
- Customize styling and branding

### Database Schema
- Update Prisma schema in `prisma/schema.prisma`
- Add new models and relationships as needed
- Run migrations to update database structure

## 🔒 Security

The application includes comprehensive security features:

- **Authentication**: JWT-based admin authentication
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation
- **XSS Protection**: HTML sanitization
- **CSRF Protection**: Token-based CSRF prevention
- **Rate Limiting**: IP-based rate limiting
- **Brute Force Protection**: Login attempt limiting
- **Data Encryption**: Secure data handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Powered by [OpenAI](https://openai.com/)
- Email delivery via [Resend](https://resend.com/)
- Database management with [Prisma](https://prisma.io/)

---

**Ready to build your assessment platform? Start customizing today! 🚀**