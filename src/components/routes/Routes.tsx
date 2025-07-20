import { Route, Routes } from 'react-router-dom';
import Login from '../auth/Login';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import MainLayout from '../pages/sites/MainLayout';
import Results from '../pages/sites/Results';
import SiteLayout from '../layouts/SiteLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import { StudentsManagement } from '../pages/dashboard/StudentsManagement';
import { CoursesManagement } from '../pages/dashboard/CoursesManagement';
import { EmployeesManagement } from '../pages/dashboard/EmployeesManagement';
// import PrivateRoute from '../utils/PrivateRoute.tsx';

function AppRoutes() {
    return (
        <Routes>
            {/* Routes avec Navbar et Footer */}
            <Route element={<SiteLayout />}>
                <Route path="/" element={<MainLayout />} />
            </Route>

            {/* Routes Public sans Navbar et Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/results" element={<Results />} />

            <Route path='/forgot_password' element={<ForgotPassword />} />
            <Route path='/reset_password' element={<ResetPassword />} />

            {/* Routes privées */}
            {/* <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<StudentsManagement />} />
            </Route> */}
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<StudentsManagement />} />
                <Route path="/courses" element={<CoursesManagement />} />
                <Route path="/employee" element={<EmployeesManagement />} />
            </Route>



            {/* Route pour la page non trouvée */}
            {/* <Route path='*' element={<NotFound />} /> */}
        </Routes>
    );
}
export default AppRoutes;