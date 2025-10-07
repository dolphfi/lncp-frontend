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
import {EmployeesManagement} from '../pages/dashboard/EmployeesManagement';
import AdminPanel from '../pages/dashboard/AdminPanel';
import {CoursesManagement} from '../pages/dashboard/CoursesManagement';
import StudentProfilePage from '../pages/dashboard/StudentProfile';
import Profile from '../pages/dashboard/Profile';
import IndividualBulletin from '../pages/bulletins/IndividualBulletin';
import CollectiveBulletin from '../pages/bulletins/CollectiveBulletin';
import TopLaureates from '../pages/statistics/TopLaureates';
import ApiTest from '../utils/ApiTest';
import EnvDebug from '../utils/EnvDebug';
import PrivateRoute from '../utils/PrivateRoute';
import AcademicDashboard from '../pages/dashboard/AcademicDashboard';
import RoleRoute from '../utils/RoleRoute';
import NotesList from 'components/pages/notes/NotesList';
import NoteEntry from 'components/pages/notes/NoteEntry';
import ScheduleManagement from '../pages/schedules/ScheduleManagement';
import MySchedule from '../pages/schedules/MySchedule';


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

      {/* Routes privées */}
        <Route element={
            <PrivateRoute><DashboardLayout/></PrivateRoute>
        }>
            {/* Route pour les élèves et parents */}
            <Route path='/student-profile'
                element={<StudentProfilePage/>}/>

            <Route path="/dashboard"
                element={<Dashboard/>}/>
            <Route path="/students"
                element={<RoleRoute requiredFeature="students"><StudentsManagement/></RoleRoute>}/>
            <Route path="/courses"
                element={<RoleRoute requiredFeature="courses"><CoursesManagement/></RoleRoute>}/>
            <Route path="/schedules"
                element={<RoleRoute requiredFeature="courses"><ScheduleManagement/></RoleRoute>}/>
            <Route path="/schedules/my-schedule"
                element={<RoleRoute requiredFeature="academic"><MySchedule/></RoleRoute>}/>
            <Route path="/employee"
                element={<RoleRoute requiredFeature="employees"><EmployeesManagement/></RoleRoute>}/>
            <Route path="/profile" element={<Profile/>} />
            <Route path="/admin_panel"
                element={<RoleRoute requiredFeature="admin"><AdminPanel/></RoleRoute>}/>
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
                    element={<RoleRoute requiredFeature="notes"><NotesList/></RoleRoute>}/>
                <Route path="entry"
                    element={<RoleRoute requiredFeature="notes"><NoteEntry/></RoleRoute>}/>
                <Route path="list"
                    element={<RoleRoute requiredFeature="notes"><NotesList/></RoleRoute>}/>
            </Route>

            {/* Bulletins */}
            <Route path="bulletins">
                <Route index
                    element={<RoleRoute requiredFeature="academic"><IndividualBulletin/></RoleRoute>}/>
                <Route path="individual"
                    element={<RoleRoute requiredFeature="academic"><IndividualBulletin/></RoleRoute>}/>
                <Route path="collective"
                    element={<RoleRoute requiredFeature="academic"><CollectiveBulletin/></RoleRoute>}/>
            </Route>

            {/* Statistiques */}
            <Route path="statistics">
                <Route index
                    element={<RoleRoute requiredFeature="academic"><TopLaureates/></RoleRoute>}/>
                <Route path="laureates"
                    element={<RoleRoute requiredFeature="academic"><TopLaureates/></RoleRoute>}/>
                <Route path="classes"
                    element={<RoleRoute requiredFeature="academic"><AcademicDashboard/></RoleRoute>}/>
            </Route>
        </Route>


        {/* Route pour la page non trouvée */}
        {/* <Route path='*' element={<NotFound />} /> */}
    </Routes>);
}
export default AppRoutes;
