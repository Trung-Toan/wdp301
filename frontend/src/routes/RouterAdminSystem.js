import AdminLayout from "../features/admin-system/AdminLayout"
import Dashboard from "../features/admin-system/pages/Dashboard"
import ManageClinics from "../features/admin-system/pages/ManageClinics"
import ManageAccounts from "../features/admin-system/pages/ManageAccounts"
import ManageLicenses from "../features/admin-system/pages/ManageLicenses"
import ManageComplaints from "../features/admin-system/pages/ManageComplaints"
import ManageBannedAccounts from "../features/admin-system/pages/ManageBannedAccounts"
import ManageBlacklist from "../features/admin-system/pages/ManageBlacklist"

const RouterAdmin = ({ currentPage }) => {
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "clinics":
        return <ManageClinics />
      case "accounts":
        return <ManageAccounts />
      case "licenses":
        return <ManageLicenses />
      case "complaints":
        return <ManageComplaints />
      case "banned":
        return <ManageBannedAccounts />
      case "blacklist":
        return <ManageBlacklist />
      default:
        return <Dashboard />
    }
  }

  return <AdminLayout currentPage={currentPage}>{renderPage()}</AdminLayout>
}

export default RouterAdmin
