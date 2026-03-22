// Landing & Auth Pages
export { default as Landing } from './Landing';
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';
export { default as ForgotPasswordPage } from './auth/ForgotPasswordPage';

// Dashboard Pages
export { default as DonorDashboard } from './donor/DonorDashboard';
export { default as ReceiverDashboard } from './receiver/ReceiverDashboard';
export { default as HospitalDashboard } from './hospital/HospitalDashboard';
export { default as AdminDashboard } from './admin/AdminDashboard';

// Donor Pages
export { default as DonorProfile } from './donor/DonorProfile';
export { default as DonorHistory } from './donor/DonorHistory';
export { default as FindRequests } from './donor/FindRequests';

// Receiver Pages
export { default as CreateRequest } from './receiver/CreateRequest';
export { default as MyRequests } from './receiver/MyRequests';
export { default as FindDonors } from './receiver/FindDonors';

// Hospital Pages
export { default as HospitalProfile } from './hospital/HospitalProfile';
export { default as ManageStock } from './hospital/ManageStock';
export { default as ManageRequests } from './hospital/ManageRequests';
export { default as ManageDonations } from './hospital/ManageDonations';
export { default as HospitalSchedules } from './hospital/HospitalSchedules';

// Admin Pages
export { default as UsersManagement } from './admin/UsersManagement';
export { default as HospitalsManagement } from './admin/HospitalsManagement';
export { default as RequestsManagement } from './admin/RequestsManagement';
export { default as AnalyticsPage } from './admin/AnalyticsPage';
export { default as AdminAnnouncements } from './admin/AdminAnnouncements';

// Shared Pages
export { default as Notifications } from './shared/Notifications';
export { default as Settings } from './shared/Settings';
export { default as Schedules } from './shared/Schedules';
export { default as ScheduleDetail } from './shared/ScheduleDetail';
export { default as RequestDetail } from './shared/RequestDetail';
export { default as HospitalList } from './shared/HospitalList';
export { default as HospitalDetail } from './shared/HospitalDetail';
export { default as ResourcesHub } from './public/ResourcesHub';

// Error Pages
export { default as NotFound } from './NotFound';
