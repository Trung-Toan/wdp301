import { memo, useState, useEffect } from "react";
import {
<<<<<<< HEAD
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  sampleDoctors,
  sampleUsers,
  sampleAccounts,
  sampleSpecialties,
} from "../../data/mockData";

const DoctorManagement = () => {
  const [clinicType, setClinicType] = useState("MULTIPLE_DOCTORS");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const transformedDoctors = sampleDoctors.map((doctor) => {
      const user = sampleUsers.find((u) => u._id === doctor.user_id);
      const specialties = doctor.specialty_id
        .map((id) => sampleSpecialties.find((s) => s._id === id))
        .map((s) => s?.name)
        .join(", ");

      return {
        id: doctor._id,
        name: user?.full_name || "Unknown",
        specialty: specialties || "N/A",
        email:
          sampleAccounts.find((a) => a._id === user?.account_id)?.email ||
          "N/A",
        phone:
          sampleAccounts.find((a) => a._id === user?.account_id)
            ?.phone_number || "N/A",
        status: "ACTIVE",
        licenseStatus: "APPROVED",
        licenseExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        joinDate: new Date(doctor.createdAt).toISOString().split("T")[0],
        rating: doctor.rating || 4.5,
        totalPatients: Math.floor(Math.random() * 200) + 50,
        appointmentsToday: Math.floor(Math.random() * 15) + 1,
        doctorData: doctor,
      };
    });
    setDoctors(transformedDoctors);
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    licenseStatus: "PENDING",
  });

  const canAddDoctor =
    clinicType === "MULTIPLE_DOCTORS" || doctors.length === 0;
  const maxDoctorsReached =
    clinicType === "SINGLE_DOCTOR" && doctors.length >= 1;

  const handleAddDoctor = () => {
    if (!canAddDoctor) return;
    setEditingId(null);
    setFormData({
      name: "",
      specialty: "",
      email: "",
      phone: "",
      licenseStatus: "PENDING",
    });
    setShowModal(true);
  };

  const handleEditDoctor = (doctor) => {
    setEditingId(doctor.id);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      email: doctor.email,
      phone: doctor.phone,
      licenseStatus: doctor.licenseStatus,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDoctors(
        doctors.map((doc) =>
          doc.id === editingId
            ? {
                ...doc,
                ...formData,
              }
            : doc
        )
      );
    } else {
      const newDoctor = {
        id: Math.max(...doctors.map((d) => d.id), 0) + 1,
        ...formData,
        status: "ACTIVE",
        joinDate: new Date().toISOString().split("T")[0],
        rating: 0,
        totalPatients: 0,
        appointmentsToday: 0,
      };
      setDoctors([...doctors, newDoctor]);
    }
    setFormData({
      name: "",
      specialty: "",
      email: "",
      phone: "",
      licenseStatus: "PENDING",
    });
    setShowModal(false);
  };

  const handleDeleteDoctor = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này?")) {
      setDoctors(doctors.filter((doc) => doc.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setDoctors(
      doctors.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              status: doc.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            }
          : doc
      )
    );
  };

  const handleUpdateLicenseStatus = (id, newStatus) => {
    setDoctors(
      doctors.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              licenseStatus: newStatus,
            }
          : doc
      )
    );
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "ALL" || doc.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getExpiringLicenses = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return doctors.filter((doc) => {
      const expiryDate = new Date(doc.licenseExpiry);
      return expiryDate <= thirtyDaysFromNow && expiryDate > today;
    });
  };

  const expiringLicenses = getExpiringLicenses();

  return (
    <div className="flex flex-col gap-5">
      {expiringLicenses.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-orange-50 border-l-4 border-l-orange-500 rounded-lg">
          <Clock size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-900">
              Cảnh báo: Giấy phép sắp hết hạn
            </p>
            <p className="text-sm text-orange-700 mt-1">
              {expiringLicenses.length} bác sĩ có giấy phép sắp hết hạn trong 30
              ngày tới
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bác sĩ</h1>
          <p className="text-sm text-gray-600 mt-2">
            {clinicType === "SINGLE_DOCTOR"
              ? "Phòng khám 1 bác sĩ"
              : "Phòng khám nhiều bác sĩ"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <select
            value={clinicType}
            onChange={(e) => setClinicType(e.target.value)}
            className="px-3 py-2 border border-blue-300 rounded-lg bg-white text-gray-900 text-sm font-medium hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SINGLE_DOCTOR">1 bác sĩ</option>
            <option value="MULTIPLE_DOCTORS">Nhiều bác sĩ</option>
          </select>

          {canAddDoctor && (
            <button
              onClick={handleAddDoctor}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Thêm bác sĩ
            </button>
          )}
          {maxDoctorsReached && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
              Đã đạt giới hạn 1 bác sĩ
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Tên bác sĩ
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Chuyên khoa
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Giấy phép
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Đánh giá
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr
                key={doctor.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {doctor.name}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {doctor.specialty}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {doctor.email}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold w-fit ${
                        doctor.licenseStatus === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : doctor.licenseStatus === "PENDING"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {doctor.licenseStatus === "APPROVED"
                        ? "Phê duyệt"
                        : doctor.licenseStatus === "PENDING"
                        ? "Chờ xử lý"
                        : "Từ chối"}
                    </span>
                    {doctor.licenseExpiry && (
                      <span className="text-xs text-gray-500">
                        {new Date(doctor.licenseExpiry).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {doctor.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-yellow-500">
                      {"★".repeat(Math.floor(doctor.rating))}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleStatus(doctor.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                      doctor.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {doctor.status === "ACTIVE" ? (
                      <>
                        <CheckCircle size={16} />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Không hoạt động
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditDoctor(doctor)}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-11/12 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {editingId ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên bác sĩ
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên bác sĩ"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Chuyên khoa
                </label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập chuyên khoa"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Trạng thái giấy phép
                </label>
                <select
                  value={formData.licenseStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="APPROVED">Phê duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingId ? "Cập nhật" : "Thêm bác sĩ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DoctorManagement);
=======
    Plus,
    Trash2,
    Edit2,
    Search,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import {
    sampleDoctors,
    sampleUsers,
    sampleAccounts,
    sampleSpecialties,
} from "../../data/mockData";

const DoctorManagement = () => {
    const [clinicType, setClinicType] = useState("MULTIPLE_DOCTORS");
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const transformedDoctors = sampleDoctors.map((doctor) => {
            const user = sampleUsers.find((u) => u._id === doctor.user_id);
            const specialties = doctor.specialty_id
                .map((id) => sampleSpecialties.find((s) => s._id === id))
                .map((s) => s?.name)
                .join(", ");

            return {
                id: doctor._id,
                name: user?.full_name || "Unknown",
                specialty: specialties || "N/A",
                email:
                    sampleAccounts.find((a) => a._id === user?.account_id)?.email ||
                    "N/A",
                phone:
                    sampleAccounts.find((a) => a._id === user?.account_id)
                        ?.phone_number || "N/A",
                status: "ACTIVE",
                licenseStatus: "APPROVED",
                licenseExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                joinDate: new Date(doctor.createdAt).toISOString().split("T")[0],
                rating: doctor.rating || 4.5,
                totalPatients: Math.floor(Math.random() * 200) + 50,
                appointmentsToday: Math.floor(Math.random() * 15) + 1,
                doctorData: doctor,
            };
        });
        setDoctors(transformedDoctors);
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [formData, setFormData] = useState({
        name: "",
        specialty: "",
        email: "",
        phone: "",
        licenseStatus: "PENDING",
    });

    const handleAddDoctor = () => {
        setEditingId(null);
        setFormData({
            name: "",
            specialty: "",
            email: "",
            phone: "",
            licenseStatus: "PENDING",
        });
        setShowModal(true);
    };

    const handleEditDoctor = (doctor) => {
        setEditingId(doctor.id);
        setFormData({
            name: doctor.name,
            specialty: doctor.specialty,
            email: doctor.email,
            phone: doctor.phone,
            licenseStatus: doctor.licenseStatus,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setDoctors(
                doctors.map((doc) =>
                    doc.id === editingId
                        ? {
                            ...doc,
                            ...formData,
                        }
                        : doc
                )
            );
        } else {
            const newDoctor = {
                id: Math.max(...doctors.map((d) => d.id), 0) + 1,
                ...formData,
                status: "ACTIVE",
                joinDate: new Date().toISOString().split("T")[0],
                rating: 0,
                totalPatients: 0,
                appointmentsToday: 0,
            };
            setDoctors([...doctors, newDoctor]);
        }
        setFormData({
            name: "",
            specialty: "",
            email: "",
            phone: "",
            licenseStatus: "PENDING",
        });
        setShowModal(false);
    };

    const handleDeleteDoctor = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này?")) {
            setDoctors(doctors.filter((doc) => doc.id !== id));
        }
    };

    const handleToggleStatus = (id) => {
        setDoctors(
            doctors.map((doc) =>
                doc.id === id
                    ? {
                        ...doc,
                        status: doc.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                    }
                    : doc
            )
        );
    };

    const handleUpdateLicenseStatus = (id, newStatus) => {
        setDoctors(
            doctors.map((doc) =>
                doc.id === id
                    ? {
                        ...doc,
                        licenseStatus: newStatus,
                    }
                    : doc
            )
        );
    };

    const filteredDoctors = doctors.filter((doc) => {
        const matchesSearch =
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === "ALL" || doc.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const getExpiringLicenses = () => {
        const today = new Date();
        const thirtyDaysFromNow = new Date(
            today.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        return doctors.filter((doc) => {
            const expiryDate = new Date(doc.licenseExpiry);
            return expiryDate <= thirtyDaysFromNow && expiryDate > today;
        });
    };

    const expiringLicenses = getExpiringLicenses();

    return (
        <div className="flex flex-col gap-5">
            {expiringLicenses.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border-l-4 border-l-orange-500 rounded-lg">
                    <Clock size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-900">
                            Cảnh báo: Giấy phép sắp hết hạn
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                            {expiringLicenses.length} bác sĩ có giấy phép sắp hết hạn trong 30
                            ngày tới
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý bác sĩ</h1>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAddDoctor}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Thêm bác sĩ
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bác sĩ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none outline-none text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Tên bác sĩ
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Chuyên khoa
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Email
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Giấy phép
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Đánh giá
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Trạng thái
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDoctors.map((doctor) => (
                            <tr
                                key={doctor.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    {doctor.name}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                        {doctor.specialty}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {doctor.email}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-semibold w-fit ${doctor.licenseStatus === "APPROVED"
                                                    ? "bg-green-100 text-green-700"
                                                    : doctor.licenseStatus === "PENDING"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {doctor.licenseStatus === "APPROVED"
                                                ? "Phê duyệt"
                                                : doctor.licenseStatus === "PENDING"
                                                    ? "Chờ xử lý"
                                                    : "Từ chối"}
                                        </span>
                                        {doctor.licenseExpiry && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(doctor.licenseExpiry).toLocaleDateString(
                                                    "vi-VN"
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {doctor.rating.toFixed(1)}
                                        </span>
                                        <span className="text-xs text-yellow-500">
                                            {"★".repeat(Math.floor(doctor.rating))}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleToggleStatus(doctor.id)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${doctor.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {doctor.status === "ACTIVE" ? (
                                            <>
                                                <CheckCircle size={16} />
                                                Hoạt động
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={16} />
                                                Không hoạt động
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditDoctor(doctor)}
                                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDoctor(doctor.id)}
                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-11/12 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-5">
                            {editingId ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Tên bác sĩ
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tên bác sĩ"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Chuyên khoa
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.specialty}
                                    onChange={(e) =>
                                        setFormData({ ...formData, specialty: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập chuyên khoa"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Điện thoại
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Trạng thái giấy phép
                                </label>
                                <select
                                    value={formData.licenseStatus}
                                    onChange={(e) =>
                                        setFormData({ ...formData, licenseStatus: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="PENDING">Chờ xử lý</option>
                                    <option value="APPROVED">Phê duyệt</option>
                                    <option value="REJECTED">Từ chối</option>
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    {editingId ? "Cập nhật" : "Thêm bác sĩ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(DoctorManagement);
>>>>>>> c7ad753424ff727dfd285ad1b48ecf1c7a27ff76
