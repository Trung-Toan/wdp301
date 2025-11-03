import {
  Building2,
  MapPin,
  Phone,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react"

const FILE_SERVER_URL = "http://localhost:5000/uploads"

const ViewModal = ({ data, onClose }) => {
  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    return `${FILE_SERVER_URL}/${url}`
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 bg-blue-600 text-white">
          <h2 className="text-lg font-semibold">Chi tiết phòng khám</h2>
          <button
            onClick={onClose}
            aria-label="Đóng modal"
            className="text-white text-2xl leading-none hover:scale-110 transition-transform"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Banner + Logo */}
          <div className="relative">
            {data.banner_url && getImageUrl(data.banner_url) ? (
              <img
                src={getImageUrl(data.banner_url)}
                alt="Banner"
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                <Building2 size={48} className="text-gray-400" />
              </div>
            )}

            {data.logo_url && getImageUrl(data.logo_url) && (
              <div className="absolute -bottom-8 left-6 bg-white rounded-full p-2 shadow-md">
                <img
                  src={getImageUrl(data.logo_url)}
                  alt="Logo"
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Thông tin cơ bản */}
          <div>
            <h3 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
              <Building2 size={18} /> Thông tin cơ bản
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Tên phòng khám</span>
                <span className="font-medium text-gray-800">{data.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Số đăng ký</span>
                <span className="text-gray-700">{data.registration_number}</span>
              </div>

              {data.description && (
                <div className="pt-2 border-t">
                  <span className="block text-gray-500 mb-1">Mô tả</span>
                  <p className="text-gray-700">{data.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
              <Phone size={18} /> Liên hệ
            </h3>
            <div className="space-y-2">
              {data.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Điện thoại</span>
                  <span>{data.phone}</span>
                </div>
              )}
              {data.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span>{data.email}</span>
                </div>
              )}
              {data.website && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Website</span>
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Địa chỉ */}
          {data.address && (
            <div>
              <h3 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                <MapPin size={18} /> Địa chỉ
              </h3>

              <div className="space-y-2">
                {data.address.houseNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số nhà</span>
                    <span>{data.address.houseNumber}</span>
                  </div>
                )}
                {data.address.street && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Đường</span>
                    <span>{data.address.street}</span>
                  </div>
                )}
                {data.address.alley && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hẻm</span>
                    <span>{data.address.alley}</span>
                  </div>
                )}
                {data.address.ward && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phường/Xã</span>
                    <span>{data.address.ward.name}</span>
                  </div>
                )}
                {data.address.province && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tỉnh/Thành phố</span>
                    <span>{data.address.province.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Giờ hoạt động */}
          {data.opening_hours && data.closing_hours && (
            <div>
              <h3 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                <Clock size={18} /> Giờ hoạt động
              </h3>
              <p className="text-gray-700">
                {data.opening_hours} - {data.closing_hours}
              </p>
            </div>
          )}

          {/* Chuyên khoa */}
          {data.specialties?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                <CheckCircle size={18} /> Chuyên khoa
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Thông tin đăng ký */}
          {data.createdAt && (
            <div>
              <h3 className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                <Calendar size={18} /> Thông tin đăng ký
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày gửi</span>
                <span>{new Date(data.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewModal
