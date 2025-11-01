import { Pill, Calendar, Clock, FileText } from "lucide-react";

export default function Prescriptions({ records }) {
  const prescriptions = records.map(r => r.prescription).filter(Boolean);
  if (prescriptions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-white via-sky-50/30 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
          <Pill className="h-5 w-5 text-sky-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Đơn thuốc</h3>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {prescriptions.map((prescription, idx) => (
          <div
            key={idx}
            className="bg-white/60 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            {/* Medicines */}
            <div className="space-y-4 mb-4">
              {prescription.medicines?.map((medicine, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-sky-50/50 to-blue-50/50 border border-sky-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 p-2 bg-sky-100 rounded-lg">
                      <Pill className="h-4 w-4 text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        {medicine.name || "Tên thuốc không rõ"}
                      </h4>
                      
                      {/* Medicine Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {medicine.dosage && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
                            <span className="text-gray-600">
                              <span className="font-semibold text-gray-700">Liều lượng:</span> {medicine.dosage}
                            </span>
                          </div>
                        )}
                        {medicine.frequency && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-sky-500" />
                            <span className="text-gray-600">
                              <span className="font-semibold text-gray-700">Tần suất:</span> {medicine.frequency}
                            </span>
                          </div>
                        )}
                        {medicine.duration && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-sky-500" />
                            <span className="text-gray-600">
                              <span className="font-semibold text-gray-700">Thời gian:</span> {medicine.duration}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Medicine Note */}
                      {medicine.note && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-700">Lưu ý: </span>
                            {medicine.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            {prescription.instruction && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase mb-1">
                      Hướng dẫn sử dụng
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {prescription.instruction}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}