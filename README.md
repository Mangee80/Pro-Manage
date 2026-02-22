# 🚀 Pro Manage - Your Ultimate Project Management Companion

<div align="center">

![Pro Manage](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-7.6.3-brightgreen) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

**Transform your workflow with the most intuitive Kanban board experience! 🎯**

[🌐 Live Demo](https://client-pi-jade.vercel.app) • [📖 Documentation](#-features) • [💻 Tech Stack](#️-tech-stack) • [🚀 Quick Start](#-quick-start)

---

</div>

> **Pro Manage** is not just another project management tool—it's your **productivity powerhouse**! Built with cutting-edge technology, this full-stack application combines the simplicity of Kanban boards with powerful analytics to help you **organize, track, and conquer** your projects like never before. 🎉

## 🌟 Why Pro Manage?

- ✅ **Zero Learning Curve** - Intuitive interface that anyone can master in minutes
- ✅ **Real-time Collaboration** - See changes instantly across all devices
- ✅ **Smart Analytics** - Make data-driven decisions with beautiful visualizations
- ✅ **Mobile-Friendly** - Works seamlessly on desktop, tablet, and mobile
- ✅ **100% Free** - No hidden costs, no credit card required

## 🚀 Live Demo

<div align="center">

### 🎯 Try it Now - It's Free!

**[👉 Launch Pro Manage](https://promanage-xi.vercel.app)** | **[🔌 API Endpoint](https://pro-manage-one.vercel.app)**

*Experience the power of modern project management!*

</div>

## ✨ Features That Will Blow Your Mind! 

### 🎯 Task Management - Your Productivity Superpower

<div align="center">

| Feature | What You Get |
|---------|-------------|
| 🗂️ **Kanban Board** | Organize tasks into 4 intuitive columns: Backlog → Todo → In Progress → Done |
| 📝 **Smart Task Cards** | Create rich task cards with titles, descriptions, checklists, and more |
| ✅ **Interactive Checklists** | Break down tasks into actionable items and track progress |
| 🎨 **Priority System** | Color-coded priorities (High 🔴, Moderate 🟡, Low 🟢) for instant recognition |
| 📅 **Due Date Tracking** | Never miss a deadline with visual indicators and overdue alerts |
| 🔗 **Shareable Links** | Share tasks with teammates using unique, secure links |
| 🖱️ **Drag & Drop** | Move tasks effortlessly between columns with smooth animations |

</div>

### 📊 Analytics Dashboard - See Your Project's Pulse

<div align="center">

**Transform raw data into actionable insights! 📈**

</div>

- 🗓️ **Gantt Timeline** - Visualize your project timeline with a stunning 60-day view (past 14 + future 46 days)
- 🥧 **Status Pie Chart** - See task distribution at a glance with beautiful interactive charts
- 📊 **Priority Breakdown** - Understand where to focus with priority-based bar charts
- 📈 **Smart Metrics** - Track completion rates, pending work, and upcoming deadlines
- ⚡ **Real-time Updates** - Get instant insights with one-click refresh

### 🔐 Security That You Can Trust

- 🔒 **JWT Authentication** - Industry-standard secure login system
- 🛡️ **Password Protection** - bcrypt hashing ensures your data stays safe
- 🔐 **Protected Routes** - Every API call is authenticated and authorized
- 👤 **User Isolation** - Your data is yours alone - complete privacy guaranteed

### 🎨 Beautiful UI That You'll Love

- 🎨 **Modern Design** - Clean, minimalist interface that doesn't distract
- 📱 **Fully Responsive** - Perfect experience on any device - desktop, tablet, or phone
- 🌈 **Color-Coded** - Visual indicators make navigation intuitive
- 🔔 **Smart Notifications** - Toast notifications keep you informed without being annoying

## 🛠️ Built With Modern Tech Stack

<div align="center">

**Powered by the best tools in the industry! ⚡**

</div>

### 🎨 Frontend - Where Magic Happens

| Technology | Purpose | Version |
|------------|---------|---------|
| ⚛️ **React** | Modern UI library for building interactive interfaces | 18.2.0 |
| 🧭 **React Router** | Seamless client-side navigation | 6.21.3 |
| 📊 **Recharts** | Beautiful, responsive charts and visualizations | 3.1.2 |
| 🎨 **React Icons** | Comprehensive icon library | 5.2.1 |
| 🔔 **React Toastify** | Elegant toast notifications | 10.0.4 |
| 🌐 **Axios** | Powerful HTTP client for API calls | 1.6.6 |
| 📅 **React Datepicker** | Intuitive date selection component | 6.1.0 |

### ⚙️ Backend - The Engine Room

| Technology | Purpose | Version |
|------------|---------|---------|
| 🟢 **Node.js** | Lightning-fast JavaScript runtime | Latest |
| 🚀 **Express** | Minimalist web framework | 4.18.2 |
| 🍃 **MongoDB** | Scalable NoSQL database | 7.6.3 |
| 🔐 **JWT** | Secure token-based authentication | 9.0.2 |
| 🔒 **bcrypt** | Industry-standard password hashing | 5.1.1 |
| 🌍 **CORS** | Cross-origin resource sharing | 2.8.5 |

### ☁️ Deployment - Cloud-Powered

- **Frontend**: 🚀 **Vercel** - Lightning-fast edge deployment
- **Backend**: 🚀 **Vercel** - Serverless functions for scalability
- **Database**: ☁️ **MongoDB Atlas** - Managed cloud database

## 🚀 Deploy to Production (Vercel)

<div align="center">

**Deploy your client in under 2 minutes! ⚡**

</div>

### Quick Deploy Options:

**Option 1: Via Vercel Dashboard (Easiest)** ⭐
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repo or drag-drop the `client` folder
4. Configure:
   - Root Directory: `client`
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Click "Deploy" 🎉

**Option 2: Via Vercel CLI**
```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

**Option 3: Run Deployment Script**
```bash
cd client
.\deploy.bat  # Windows
# or
chmod +x deploy.sh && ./deploy.sh  # Linux/Mac
```

> 💡 **Already configured!** Your `vercel.json` is ready to go!

📖 **Need detailed instructions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📦 Installation & Setup - Get Started in 5 Minutes! ⏱️

### ✅ Prerequisites

Make sure you have these installed:
- 📦 **Node.js** (v16.x or higher) - [Download here](https://nodejs.org/)
- 🍃 **MongoDB** (local or MongoDB Atlas) - [Get MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- 📥 **npm** or **yarn** (comes with Node.js)

### 🚀 Quick Start Guide

<div align="center">

**Follow these simple steps and you're ready to go! 🎉**

</div>

#### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/Mangee80/pro-manage.git
cd pro-manage
```

#### 2️⃣ **Install Dependencies**

**Frontend Setup:**
```bash
cd client
npm install
```

**Backend Setup:**
```bash
cd ../server
npm install
```

#### 3️⃣ **Configure Environment Variables**

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
```

> 💡 **Tip**: Get your MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (it's free!)

#### 4️⃣ **Launch the Application** 🎉

**Start Backend Server:**
```bash
cd server
npm start
```
✅ Backend running on: `http://localhost:5000`

**Start Frontend** (open a new terminal):
```bash
cd client
npm start
```
✅ Frontend running on: `http://localhost:3000`

<div align="center">

**🎊 That's it! Open your browser and start managing projects!**

</div>

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
│   │   │   └── Sidebar/   # Navigation sidebar
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

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- User-specific data isolation
- Secure environment variables

## 🚧 What's Coming Next? (Roadmap)

<div align="center">

**We're constantly improving! Here's what's on the horizon: 🚀**

</div>

- [ ] 👥 **Team Collaboration** - Work together in real-time
- [ ] 🔔 **Smart Notifications** - Never miss an update
- [ ] 📎 **File Attachments** - Attach files directly to tasks
- [ ] 💬 **Task Comments** - Discuss and collaborate on tasks
- [ ] 📧 **Email Notifications** - Stay informed via email
- [ ] 🌙 **Dark Mode** - Easy on the eyes, especially at night
- [ ] 📄 **Export Reports** - Generate PDF/Excel reports
- [ ] 🔗 **Task Dependencies** - Link related tasks
- [ ] ⏱️ **Time Tracking** - Track time spent on tasks

<div align="center">

**Have a feature request? [Open an issue](https://github.com/Mangee80/pro-manage/issues)! 💡**

</div>

## 🤝 Contributing - Join the Community!

<div align="center">

**We ❤️ contributions! Here's how you can help:**

</div>

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push** to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 **Open** a Pull Request

<div align="center">

**Every contribution, no matter how small, makes a difference! 🌟**

</div>

## 📝 License

This project is licensed under the **ISC License** - feel free to use it for personal or commercial projects!

## 👨‍💻 Meet the Creator

<div align="center">

### **Mani Pratap Singh**

[![GitHub](https://img.shields.io/badge/GitHub-@Mangee80-black?style=for-the-badge&logo=github)](https://github.com/Mangee80)

**Building awesome things, one commit at a time! 💻**

</div>

---

<div align="center">

## ⭐ Love This Project?

**Give it a star on GitHub - it motivates us to keep building! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/Mangee80/pro-manage?style=social)](https://github.com/Mangee80/pro-manage)

**Made with ❤️ and lots of ☕**

---

**🚀 Ready to boost your productivity? [Get Started Now!](#-quick-start)**

</div>
