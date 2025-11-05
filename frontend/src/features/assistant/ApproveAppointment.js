import { memo } from "react";
import {
  Calendar,
} from "react-bootstrap-icons";
import AppointmentComponent from "./appointment.component";
const ApproveAppointment = () => {

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Calendar className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Duyệt lịch khám bệnh</h1>
            <p className="text-gray-500 mt-1">Xem và quản lý các ca khám và bệnh nhân</p>
          </div>
        </div>
        <AppointmentComponent/>
      </div>
    </div>
  );
};

export default memo(ApproveAppointment);