// Copy/src/index.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Routes, BrowserRouter, Navigate, Link, useLocation } from 'react-router-dom';
import ScrollToTopCOMP from './components/ScrollToTopCOMP.jsx';
import CompleteProfileModal from './components/CompleteProfileModal.jsx';
import './index.css';

import MainLayout from './pages/Layouts/MainLayouts.jsx';

import Login from './pages/Auth/Login/Login.jsx';
import ForgotPassword from './pages/Auth/Login/ForgotPassword.jsx';
import Register from './pages/Auth/Register/Register.jsx';

import Homepage from './pages/Homepage.jsx';
import Gallery from './pages/Gallery/Gallery.jsx';
import About from './pages/About/About.jsx';

import AlumniDashboard from './pages/Alumni/AlumniDashboard.jsx';
import AlumniJobs from './pages/Alumni/AlumniJobs.jsx';
import AlumniForums from './pages/Alumni/AlumniForums.jsx';
import AlumniForumCategoryPage from './pages/Alumni/AlumniForumCategoryPage.jsx';
import AlumniForumTopicPage from './pages/Alumni/AlumniForumTopicPage.jsx';
import AlumniProfilePage from './pages/Alumni/AlumniProfilePage.jsx';

import AdminHome from './pages/Admin/AdminHome.jsx';
import AdminGalleryPage from './pages/Admin/AdminGalleryPage.jsx';
import AdminCourseListPage from './pages/Admin/AdminCourseListPage.jsx';
import AdminAlumniListPage from './pages/Admin/AdminAlumniListPage.jsx';
import AdminJobsPage from './pages/Admin/AdminJobsPage.jsx';
import AdminStatisticsPage from './pages/Admin/AdminStatisticsPage.jsx';
import AdminStatGenderPage from './pages/Admin/Statistics/AdminStatGenderPage.jsx';
import AdminStatJobAlignmentPage from './pages/Admin/Statistics/AdminStatJobAlignmentPage.jsx';
import AdminStatDemographicsPage from './pages/Admin/Statistics/AdminStatDemographicsPage.jsx';
import AdminStatOutcomesPage from './pages/Admin/Statistics/AdminStatOutcomesPage.jsx';
import AdminStatModelComparisonPage from './pages/Admin/Statistics/AdminStatModelComparisonPage.jsx';
import AdminProgressReportsPage from './pages/Admin/Statistics/AdminProgressReportsPage.jsx';

import AdminForumsManagementPage from './pages/Admin/AdminForumsManagementPage.jsx';
import AdminUsersPage from './pages/Admin/AdminUsersPage.jsx';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage.jsx';


const PlaceholderPage = ({ title, message, homePath = "/", homeButtonText = "Go to Homepage" }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] bg-background p-4 text-center">
    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h1>
    <p className="text-lg text-muted-foreground mb-8 max-w-md">
      {message || (title.toLowerCase().includes("admin") ? "This admin section is under construction. Please check back later!" : "This page is under construction or not found.")}
    </p>
    <Link
      to={homePath}
      className="px-6 py-3 bg-primary-ui text-primary-ui-foreground rounded-md hover:bg-primary-ui/90 transition-colors text-base font-medium shadow-md"
    >
      {homeButtonText}
    </Link>
  </div>
);

const NotFoundPage = () => <PlaceholderPage title="404 - Page Not Found" message="The page you are looking for does not exist." />;


function App() {
  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

  const checkProfileCompletion = (userData) => {
    if (userData && userData.role === 'Alumni' &&
      (userData.isProfileComplete === 0 || userData.isProfileComplete === false || userData.isProfileComplete === null || userData.isProfileComplete === undefined)
    ) {
      setShowCompleteProfileModal(true);
    } else {
      setShowCompleteProfileModal(false);
    }
  };


  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedRole && storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserRole(storedRole);
        setUserInfo(parsedUserInfo);
        if (storedRole === 'alumni') {
          checkProfileCompletion(parsedUserInfo);
        }
      } catch (e) {
        console.error("Error parsing stored userInfo:", e);
        localStorage.removeItem('userRole');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authToken');
      }
    }
    setIsAuthLoading(false);
  }, []);

  const handleLoginSuccess = (role, userData) => {
    let roleToStore = null;

    if (role === 'Admin') {
      roleToStore = 'admin';
    } else if (role === 'Alumni') {
      roleToStore = 'alumni';
    }

    if (roleToStore) {
      setUserRole(roleToStore);
      setUserInfo(userData);
      localStorage.setItem('userRole', roleToStore);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      if (roleToStore === 'alumni') {
        checkProfileCompletion(userData);
      }
    } else {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('authToken');
      setUserRole(null);
      setUserInfo(null);
      setShowCompleteProfileModal(false);
    }
  };

  const handleProfileCompleted = async () => {
    setShowCompleteProfileModal(false);
    if (userInfo && userInfo.id) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userInfo.id}`);
        if (response.ok) {
          const updatedUserData = await response.json();
          setUserInfo(updatedUserData);
          localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
        } else {
          const fallbackUpdatedUserInfo = { ...userInfo, isProfileComplete: 1 };
          setUserInfo(fallbackUpdatedUserInfo);
          localStorage.setItem('userInfo', JSON.stringify(fallbackUpdatedUserInfo));
        }
      } catch (error) {
        console.error("Failed to fetch updated user info after profile completion:", error);
        const fallbackUpdatedUserInfo = { ...userInfo, isProfileComplete: 1 };
        setUserInfo(fallbackUpdatedUserInfo);
        localStorage.setItem('userInfo', JSON.stringify(fallbackUpdatedUserInfo));
      }
    }
  };


  const handleLogout = () => {
    setUserRole(null);
    setUserInfo(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('authToken');
    setShowCompleteProfileModal(false);
  };


  const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    if (isAuthLoading) return <div className='flex justify-center items-center h-screen'><p>Loading...</p></div>;

    const currentLocalRole = localStorage.getItem('userRole');

    if (currentLocalRole !== 'admin') {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
  };

  const PublicRoute = ({ children }) => {
    const location = useLocation();
    if (isAuthLoading) return <div className='flex justify-center items-center h-screen'><p>Loading...</p></div>;

    const currentLocalRole = localStorage.getItem('userRole');

    if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
      if (currentLocalRole === 'admin') {
        return <Navigate to="/admin/home" replace />;
      } else if (currentLocalRole === 'alumni') {
        return <Navigate to="/alumni/dashboard" replace />;
      }
    }
    return children;
  };


  if (isAuthLoading) return <div className='flex justify-center items-center h-screen'><p>Initializing...</p></div>;


  return (
    <BrowserRouter>
      <ScrollToTopCOMP>
        {showCompleteProfileModal && userInfo && userInfo.role === 'Alumni' && (
          <CompleteProfileModal
            isOpen={showCompleteProfileModal}
            alumniId={userInfo.id}
            onProfileComplete={handleProfileCompleted}
          />
        )}
        <Routes>
          <Route path="/login" element={<PublicRoute><Login onLoginSuccess={handleLoginSuccess} /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          <Route path="/" element={<Homepage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />

          <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
          <Route path="/alumni/jobs" element={<AlumniJobs />} />
          <Route path="/alumni/forums" element={<AlumniForums />} />
          <Route path="/alumni/forums/:categoryName" element={<AlumniForumCategoryPage />} />
          <Route path="/alumni/forums/topic/:topicId" element={<AlumniForumTopicPage />} />
          <Route path="/alumni/profile" element={<AlumniProfilePage />} />


          <Route path="/admin/home" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminHome /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/gallery" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminGalleryPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminCourseListPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/alumni" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminAlumniListPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminJobsPage /></MainLayout></ProtectedRoute>} />

          <Route path="/admin/statistics" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminStatisticsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/statistics/gender" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminStatGenderPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/statistics/job-alignment" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminStatJobAlignmentPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/statistics/demographics" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminStatDemographicsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/statistics/outcomes" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminStatOutcomesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/statistics/model-comparison" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminStatModelComparisonPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/statistics/progress-reports" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminProgressReportsPage /></MainLayout></ProtectedRoute>} />

          <Route path="/admin/forums" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminForumsManagementPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminUsersPage /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><MainLayout onLogout={handleLogout}><AdminSettingsPage /></MainLayout></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute><Navigate to="/admin/home" replace /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ScrollToTopCOMP>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}