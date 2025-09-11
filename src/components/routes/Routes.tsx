import {Route, Routes} from 'react-router-dom';
import Login from '../auth/Login';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import MainLayout from '../pages/sites/MainLayout';
import Results from '../pages/sites/Results';
import SiteLayout from '../layouts/SiteLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import {StudentsManagement} from '../pages/dashboard/StudentsManagement';
import {CoursesManagement} from '../pages/dashboard/CoursesManagement';
import {EmployeesManagement} from '../pages/dashboard/EmployeesManagement';
import AdminPanel from '../pages/dashboard/AdminPanel';
// Academic System Components
import AcademicDashboard from '../pages/dashboard/AcademicDashboard';
import Profile from '../pages/dashboard/Profile';
import NoteEntry from '../pages/notes/NoteEntry';
import NotesList from '../pages/notes/NotesList';
import IndividualBulletin from '../pages/bulletins/IndividualBulletin';
import CollectiveBulletin from '../pages/bulletins/CollectiveBulletin';
import TopLaureates from '../pages/statistics/TopLaureates';
import ApiTest from '../utils/ApiTest';
import EnvDebug from '../utils/EnvDebug';


import PrivateRoute from '../utils/PrivateRoute';
import RoleRoute from '../utils/RoleRoute';


function AppRoutes() {
    return (<Routes> {/* Routes avec Navbar et Footer */}
        <Route element={<SiteLayout/>}>
            <Route path="/"
                element={<MainLayout/>}/>
        </Route>

        {/* Routes Public sans Navbar et Footer */}


        <Route path="/login"
            element={<Login/>}/>
        <Route path="/api-test"
            element={<ApiTest/>}/>
        <Route path="/env-debug"
            element={<EnvDebug/>}/>


        <Route path="/results"
            element={<Results/>}/>

        <Route path='/forgot_password'
            element={<ForgotPassword/>}/>
        <Route path='/reset-password'
            element={<ResetPassword/>}/>
        <Route path='/auth/reset-password'
            element={<ResetPassword/>}/>
      {/* Routes privées */}
        <Route element={
            <PrivateRoute><DashboardLayout/></PrivateRoute>
        }>


            <Route path="/dashboard"
                element={<Dashboard/>}/>
            <Route path="/students"
                element={<StudentsManagement/>}/>
            <Route path="/courses"
                element={<CoursesManagement/>}/>
            <Route path="/employee"
                element={<EmployeesManagement/>}/>
            <Route path="/profile" element={<Profile/>} />
            <Route path="/admin_panel"
                element={<RoleRoute allowedRoles={["SUPER_ADMIN"]}><AdminPanel/></RoleRoute>}/>
        </Route>

        {/* Routes du système académique */}
        <Route path="/academic"
            element={<DashboardLayout/>}>
            <Route index
                element={<AcademicDashboard/>}/>
            <Route path="dashboard"
                element={<AcademicDashboard/>}/> {/* Gestion des notes */}
            <Route path="notes">
                <Route index
                    element={<NotesList/>}/>
                <Route path="entry"
                    element={<NoteEntry/>}/>
                <Route path="list"
                    element={<NotesList/>}/>
            </Route>

            {/* Bulletins */}
            <Route path="bulletins">
                <Route index
                    element={<IndividualBulletin/>}/>
                <Route path="individual"
                    element={<IndividualBulletin/>}/>
                <Route path="collective"
                    element={<CollectiveBulletin/>}/>
            </Route>

            {/* Statistiques */}
            <Route path="statistics">
                <Route index
                    element={<TopLaureates/>}/>
                <Route path="laureates"
                    element={<TopLaureates/>}/>
                <Route path="classes"
                    element={<AcademicDashboard/>}/>
            </Route>
        </Route>


        {/* Route pour la page non trouvée */}
        {/* <Route path='*' element={<NotFound />} /> */}
    </Routes>);
}
export default AppRoutes;
