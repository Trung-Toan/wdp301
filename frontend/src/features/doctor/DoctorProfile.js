import { memo, useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { doctorApi } from "../../api/doctor/doctorApi";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/file";
const FILE_SERVER_URL = "http://localhost:5000/uploads";

const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [newLicense, setNewLicense] = useState({
    licenseNumber: "",
    issued_by: "",
    issued_date: "",
    expiry_date: "",
    document_url: "",
    document_file: null,
  });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLicense((prev) => ({
        ...prev,
        document_file: file,
        document_url: file.name,
      }));
    }
  };

  const handleUploadLicense = async () => {
    if (!newLicense.document_file) {
      toast.error("Vui lòng chọn một tệp chứng chỉ.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("myFile", newLicense.document_file);

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/upload`,
        formData
      );

      let newLicenseName = null;
      if (uploadResponse.data.files && uploadResponse.data.files.length > 0) {
        newLicenseName = uploadResponse.data.files[0].fileName;
      } else {
        toast.error("Server upload không trả về tên file.");
        return;
      }

      const payload = {
        licenseNumber: newLicense.licenseNumber,
        issued_by: newLicense.issued_by,
        issued_date: newLicense.issued_date,
        expiry_date: newLicense.expiry_date,
        document_url: newLicenseName,
      };
      await doctorApi.uploadLicense(payload);
      toast.success("Gửi chứng chỉ thành công!, vui lòng đợi duyệt");

      const res = await doctorApi.getMyLicense();
      setDoctorProfile((prev) => ({ ...prev, licenses: res.data.data }));

      setNewLicense({
        licenseNumber: "",
        issued_by: "",
        issued_date: "",
        expiry_date: "",
        document_url: "",
        document_file: null,
      });
    } catch (err) {
      console.error("Lỗi khi gửi chứng chỉ:", err);
      const uploadError = err.response?.data?.error || err.message;
      toast.error("Không thể gửi chứng chỉ: " + uploadError);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorApi.getProfile();
        const d = res.data.data;

        const avatarUrl = d.user_id?.avatar_url
          ? d.user_id.avatar_url.startsWith("http")
            ? d.user_id.avatar_url
            : `${FILE_SERVER_URL}/${d.user_id.avatar_url}`
          : "";

        setDoctorProfile({
          doctor: {
            title: d.title,
            degree: d.degree,
            description: d.description,
            experience: d.experience,
            specialties: d.specialty_id?.map((s) => s.name) || [],
            clinic: d.clinic_id?.name || "",
          },
          user: {
            full_name: d.user_id?.full_name || "",
            dob: d.user_id?.dob?.split("T")[0] || "",
            gender: d.user_id?.gender || "",
            address: d.user_id?.address || "",
            avatar_url: avatarUrl,
          },
          account: {
            username: d.user_id?.account_id?.username || "",
            email: d.user_id?.account_id?.email || "",
            phone_number: d.user_id?.account_id?.phone_number || "",
          },
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (section, field, value) => {
    setDoctorProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewAvatarFile(file);

    const localURL = URL.createObjectURL(file);
    setDoctorProfile((prev) => ({
      ...prev,
      user: { ...prev.user, avatar_url: localURL },
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: doctorProfile.doctor.title,
        degree: doctorProfile.doctor.degree,
        experience: doctorProfile.doctor.experience,
        description: doctorProfile.doctor.description,
        gender: doctorProfile.user.gender,
        dob: doctorProfile.user.dob,
        address: doctorProfile.user.address,
        username: doctorProfile.account.username,
        email: doctorProfile.account.email,
        phone_number: doctorProfile.account.phone_number,
      };

      let newAvatarName = null;

      if (newAvatarFile) {
        const formData = new FormData();
        formData.append("myFile", newAvatarFile);

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/upload`,
          formData
        );

        if (uploadResponse.data.files && uploadResponse.data.files.length > 0) {
          newAvatarName = uploadResponse.data.files[0].fileName;
        } else {
          toast.error("Server upload không trả về tên file.");
          return;
        }

        payload.avatar_url = newAvatarName;
      }

      await doctorApi.updateProfile(payload);
      setIsEditing(false);
      toast.success("Cập nhật thành công!");

      if (newAvatarFile && newAvatarName) {
        setDoctorProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            avatar_url: `${FILE_SERVER_URL}/${newAvatarName}`,
          },
        }));
      }
      setNewAvatarFile(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      const uploadError = err.response?.data?.error || err.message;
      toast.error("Không thể cập nhật hồ sơ: " + uploadError);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Không thể tải dữ liệu hồ sơ bác sĩ.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-700">Hồ sơ bác sĩ</h2>
          <div className="space-x-3">
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </Button>
            <Button
              onClick={() => navigate("/doctor/change-password")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={
              doctorProfile.user?.avatar_url
                ? doctorProfile.user.avatar_url
                : defaultAvatar
            }
            alt="Doctor Avatar"
            className="w-32 h-32 rounded-full border-4 border-blue-300 shadow-md object-cover"
          />
          {isEditing && (
            <div className="mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm text-gray-600"
              />
            </div>
          )}
        </div>

        {/* Thông tin tài khoản */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-1 mb-3">
            Thông tin tài khoản
          </h3>
          <div className="space-y-3">
            {["username", "email", "phone_number"].map((field) => (
              <div key={field}>
                <label className="block text-gray-600 font-medium mb-1 capitalize">
                  {field.replace("_", " ")}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={doctorProfile.account?.[field] || ""}
                    onChange={(e) =>
                      handleChange("account", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800">
                    {doctorProfile.account?.[field] || ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Thông tin cá nhân */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-1 mb-3">
            Thông tin cá nhân
          </h3>
          <div className="space-y-3">
            {[
              ["full_name", "Họ và tên"],
              ["dob", "Ngày sinh"],
              ["gender", "Giới tính"],
              ["address", "Địa chỉ"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-gray-600 font-medium mb-1">
                  {label}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={doctorProfile.user?.[field] || ""}
                    onChange={(e) =>
                      handleChange("user", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800">{doctorProfile.user?.[field]}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Thông tin chuyên môn */}
        <section>
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-1 mb-3">
            Thông tin chuyên môn
          </h3>
          <div className="space-y-3">
            {[
              ["title", "Chức danh"],
              ["degree", "Bằng cấp"],
              ["experience", "Kinh nghiệm"],
              ["description", "Mô tả"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-gray-600 font-medium mb-1">
                  {label}
                </label>
                {isEditing ? (
                  <textarea
                    rows={field === "description" ? 3 : 1}
                    value={doctorProfile.doctor?.[field] || ""}
                    onChange={(e) =>
                      handleChange("doctor", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800 whitespace-pre-line">
                    {doctorProfile.doctor?.[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Danh sách chuyên khoa */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Chuyên khoa
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={(doctorProfile.doctor?.specialties || []).join(", ")}
                  onChange={(e) =>
                    handleChange(
                      "doctor",
                      "specialties",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="text-gray-800">
                  {(doctorProfile.doctor?.specialties || []).join(", ")}
                </p>
              )}
            </div>

            {/* Chứng chỉ hành nghề */}
            <section className="mt-10">
              <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-1 mb-3">
                Chứng chỉ hành nghề
              </h3>

              {/* Danh sách chứng chỉ */}
              <div className="space-y-3 mb-6">
                {(doctorProfile.licenses || []).length > 0 ? (
                  doctorProfile.licenses.map((lic, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-blue-100 rounded-lg bg-blue-50 shadow-sm"
                    >
                      <p>
                        <strong>Số hiệu:</strong> {lic.licenseNumber}
                      </p>
                      <p>
                        <strong>Cơ quan cấp:</strong> {lic.issued_by}
                      </p>
                      <p>
                        <strong>Ngày cấp:</strong>{" "}
                        {new Date(lic.issued_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Ngày hết hạn:</strong>{" "}
                        {new Date(lic.expiry_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>File:</strong>{" "}
                        <a
                          href={`${FILE_SERVER_URL}/${lic.document_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {lic.document_url}
                        </a>
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <span
                          className={`font-semibold ${
                            lic.status === "APPROVED"
                              ? "text-green-600"
                              : lic.status === "REJECTED"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {lic.status}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Chưa có chứng chỉ nào được gửi.
                  </p>
                )}
              </div>

              {/* Form gửi chứng chỉ */}
              <div className="p-5 border border-blue-100 rounded-xl shadow-md bg-white">
                <h4 className="text-blue-700 font-semibold mb-4">
                  Gửi chứng chỉ mới
                </h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleUploadLicense();
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">
                      Số hiệu chứng chỉ
                    </label>
                    <input
                      type="text"
                      className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                      value={newLicense.licenseNumber}
                      onChange={(e) =>
                        setNewLicense({
                          ...newLicense,
                          licenseNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1">
                      Cơ quan cấp
                    </label>
                    <input
                      type="text"
                      className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                      value={newLicense.issued_by}
                      onChange={(e) =>
                        setNewLicense({
                          ...newLicense,
                          issued_by: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 font-medium mb-1">
                        Ngày cấp
                      </label>
                      <input
                        type="date"
                        className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newLicense.issued_date}
                        onChange={(e) =>
                          setNewLicense({
                            ...newLicense,
                            issued_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-medium mb-1">
                        Ngày hết hạn
                      </label>
                      <input
                        type="date"
                        className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newLicense.expiry_date}
                        onChange={(e) =>
                          setNewLicense({
                            ...newLicense,
                            expiry_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1">
                      Tệp chứng chỉ (PDF)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(e)}
                      className="text-sm text-gray-600"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Gửi phê duyệt
                  </Button>
                </form>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default memo(DoctorProfile);
