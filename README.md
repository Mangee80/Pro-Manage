# 🚀 Pro Manage - Project Management Tool

A comprehensive full-stack project management application built with React and Node.js. Pro Manage helps teams and individuals organize tasks, track progress, and visualize project analytics through an intuitive Kanban board interface.

![Pro Manage](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-7.6.3-brightgreen)

## ✨ Features

### 🎯 Task Management
- **Kanban Board**: Organize tasks into four status columns (Backlog, Todo, In Progress, Done)
- **Task Cards**: Create, edit, and delete task cards with detailed information
- **Checklists**: Add multiple checklist items to each task and track completion
- **Priority System**: Assign priority levels (High, Moderate, Low) with color coding
- **Due Dates**: Set and track due dates with visual indicators for overdue tasks
- **Card Sharing**: Share tasks with unique shareable links

### 📊 Analytics Dashboard
- **Gantt Chart**: Visual timeline view of all tasks with due dates (60-day view)
- **Task Status Distribution**: Pie chart showing distribution across all statuses
- **Priority Distribution**: Bar chart displaying task distribution by priority
- **Summary Metrics**: 
  - Total Tasks count
  - Completed tasks with percentage
  - Pending tasks with percentage
  - Due Soon tasks (next 7 days)
- **Real-time Updates**: Refresh analytics data in real-time

### 🔐 Authentication & Security
- **User Authentication**: Secure JWT-based authentication system
- **User Registration**: Sign up with email and password
- **Protected Routes**: Secure API endpoints with authentication middleware
- **User-specific Data**: Each user can only access their own tasks

### 🎨 User Interface
- **Modern UI**: Clean and intuitive design with responsive layout
- **Color-coded Priorities**: Visual priority indicators
- **Status-based Colors**: Different colors for different task statuses
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: User-friendly notifications for actions

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **React Router** 6.21.3 - Client-side routing
- **Recharts** 3.1.2 - Data visualization (Charts)
- **React Icons** 5.2.1 - Icon library
- **React Toastify** 10.0.4 - Toast notifications
- **Axios** 1.6.6 - HTTP client
- **React Datepicker** 6.1.0 - Date selection

### Backend
- **Node.js** - Runtime environment
- **Express** 4.18.2 - Web framework
- **MongoDB** 7.6.3 - Database (via Mongoose)
- **JWT** (jsonwebtoken) 9.0.2 - Authentication
- **bcrypt** 5.1.1 - Password hashing
- **CORS** 2.8.5 - Cross-origin resource sharing

### Deployment
- **Frontend**: Vercel
- **Backend**: Vercel
- **Database**: MongoDB Atlas

## 🚀 Live Demo

- **Frontend**: [https://client-pi-jade.vercel.app](https://client-pi-jade.vercel.app)
- **Backend API**: [https://pro-manage-one.vercel.app](https://pro-manage-one.vercel.app)

## 📦 Installation

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pro-manage.git
   cd pro-manage
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Variables**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Run the Application**

   **Start Backend Server:**
   ```bash
   cd server
   npm start
   ```

   **Start Frontend (in a new terminal):**
   ```bash
   cd client
   npm start
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📁 Project Structure

```
pro-manage/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── Components/    # React components
│   │   │   ├── Analytics/ # Analytics dashboard
│   │   │   ├── Board/     # Kanban board
│   │   │   ├── Card/      # Task card component
│   │   │   ├── Dashboard/ # Main dashboard
│   │   │   ├── Sidebar/   # Navigation sidebar
│   │   │   └── ...
│   │   ├── Pages/         # Page components
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── Models/        # MongoDB models
│   │   ├── Routes/        # API routes
│   │   ├── middleware/    # Authentication middleware
│   │   └── utils/         # Utility functions
│   ├── index.js           # Server entry point
│   └── package.json
│
└── README.md
```

## 🎯 Key Features in Detail

### Kanban Board
- Drag and organize tasks across different status columns
- Real-time updates when moving tasks between columns
- Visual indicators for task status and priority

### Analytics Dashboard
- **Gantt Chart**: 60-day timeline view showing all tasks with due dates
  - Past 14 days and future 46 days visibility
  - Overdue tasks highlighted in red
  - Priority-based color coding
- **Charts**: Interactive pie and bar charts for data visualization
- **Metrics**: Quick overview cards with key statistics

### Task Management
- Create tasks with title, description, priority, and due date
- Add multiple checklist items to each task
- Edit and delete tasks
- Share tasks with unique URLs
- Track completion progress with checklist counters

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- User-specific data isolation
- Secure environment variables

## 📸 Screenshots

<!-- Add your screenshots here -->
- Dashboard View
- Analytics Dashboard
- Task Card Details
- Gantt Chart Timeline

## 🚧 Future Enhancements

- [ ] Team collaboration features
- [ ] Real-time notifications
- [ ] File attachments
- [ ] Comments on tasks
- [ ] Email notifications
- [ ] Dark mode
- [ ] Export reports (PDF/Excel)
- [ ] Task dependencies
- [ ] Time tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Mani Pratap Singh**

- GitHub: [@Mangee80](https://github.com/Mangee80)
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database solution
- Vercel for hosting services
- All open-source contributors

---

⭐ If you like this project, please give it a star on GitHub!

