
import { memo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Eye, FileText } from "react-bootstrap-icons"
import "../../styles/doctor/patient-list.css"

const PatientList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data - replace with API call
  const [patients] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      age: 35,
      gender: "Nam",
      phone: "0901234567",
      lastVisit: "2024-01-15",
      diagnosis: "Cảm cúm",
    },
    {
      id: 2,
      name: "Trần Thị B",
      age: 28,
      gender: "Nữ",
      phone: "0912345678",
      lastVisit: "2024-01-14",
      diagnosis: "Đau đầu",
    },
    {
      id: 3,
      name: "Lê Văn C",
      age: 42,
      gender: "Nam",
      phone: "0923456789",
      lastVisit: "2024-01-13",
      diagnosis: "Cao huyết áp",
    },
  ])

  const filteredPatients = patients.filter(
    (patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.phone.includes(searchTerm),
  )

  return (
    <div className="patient-list-container">
      <div className="page-header">
        <h1 className="page-title">Danh sách bệnh nhân</h1>
        <p className="page-subtitle">Quản lý thông tin bệnh nhân</p>
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="patients-table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Mã BN</th>
              <th>Họ và tên</th>
              <th>Tuổi</th>
              <th>Giới tính</th>
              <th>Số điện thoại</th>
              <th>Lần khám cuối</th>
              <th>Chẩn đoán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td className="font-medium">#{patient.id.toString().padStart(4, "0")}</td>
                <td className="font-medium">{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.phone}</td>
                <td>{patient.lastVisit}</td>
                <td>{patient.diagnosis}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn action-btn-view" title="Xem chi tiết">
                      <Eye />
                    </button>
                    <button
                      className="action-btn action-btn-record"
                      onClick={() => navigate(`/doctor/medical-records/${patient.id}`)}
                      title="Xem bệnh án"
                    >
                      <FileText />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default memo(PatientList)
