import { Routes, Route } from "react-router-dom"
import AdminLayout from "../../layouts/AdminLayout"
import Dashboard from "../../features/admin-system/Dashboard"
import ManageClinics from "../../features/admin-system/ManageClinics"
import ManageAccounts from "../../features/admin-system/ManageAccounts"
import ManageLicenses from "../../features/admin-system/ManageLicenses"
import ManageComplaints from "../../features/admin-system/ManageComplaints"
import ManageBannedAccounts from "../../features/admin-system/ManageBannedAccounts"
import ManageBlacklist from "../../features/admin-system/ManageBlacklist"


const RouterAdminSystem = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="/clinics" element={<ManageClinics />} />
        <Route path="/accounts" element={<ManageAccounts />} />
        <Route path="/licenses" element={<ManageLicenses />} />
        <Route path="/complaints" element={<ManageComplaints />} />
        <Route path="/banned-accounts" element={<ManageBannedAccounts />} />
        <Route path="/blacklist" element={<ManageBlacklist />} />
      </Route>
    </Routes>
  )
}

export default RouterAdminSystem
