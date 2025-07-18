# EduFinX - Educational Finance Management System

**Developed by Tejas and team**

## Project Overview

EduFinX is a comprehensive educational finance management platform designed to streamline financial operations for educational institutions and students. The system provides an intuitive interface for managing fees, tracking expenses, and maintaining financial transparency in educational environments.

## Key Features

### 🎓 Student Financial Management
- **Fee Management**: Comprehensive fee tracking and payment management
- **Expense Tracking**: Personal expense monitoring and categorization
- **Budget Planning**: Smart budgeting tools for educational expenses
- **Payment History**: Complete transaction history and records

### 📊 Dashboard & Analytics
- Real-time financial overview and insights
- Interactive charts and financial reports
- Budget vs. actual expense analysis
- Payment status tracking

### 👤 User Management
- Secure authentication system
- Student profile management
- Role-based access control
- Profile image upload and management

### 💰 Financial Operations
- Multiple payment method support
- Recurring fee management
- Expense categorization
- Budget allocation and monitoring

## Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for file uploads
- **Build Tool**: Vite
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Architecture

The application follows a modern, scalable architecture:

- **Component-based Architecture**: Modular React components with TypeScript
- **Database**: PostgreSQL with Row-Level Security (RLS) policies
- **Real-time Updates**: Supabase real-time subscriptions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Secure File Storage**: Profile images and receipts in Supabase Storage

## Database Schema

### Core Tables
- `profiles` - User profile information
- `students` - Student-specific data
- `fees` - Fee management and tracking
- `expenses` - Expense tracking
- `budgets` - Budget planning and monitoring
- `fee_categories` / `expense_categories` - Classification systems

## Security Features

- **Row-Level Security**: Database-level access control
- **Authentication**: Secure user authentication via Supabase
- **Data Privacy**: User data isolation and protection
- **File Security**: Secure file uploads with access controls

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd edufinx

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
The application uses Supabase for backend services. All configuration is handled through the integrated Supabase client.

## Contributing

This project was developed collaboratively by Tejas and team members. Contributions should follow the established coding standards and architectural patterns.

## Project Status

EduFinX is actively maintained and continues to evolve with new features and improvements for educational finance management.

---

*Built with ❤️ for educational institutions and students*