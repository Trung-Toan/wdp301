import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assistantService from "../assistantService";
import Loading from "../../../components/Loading";
import Button from "../../../components/ui/Button";

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line
  }, [id]);

  async function fetch() {
    setLoading(true);
    try {
      const res = await assistantService.getAppointment(id);
      setAppointment(res.data);
    } catch (e) {
      console.error(e);
      alert("Không tải được chi tiết cuộc hẹn");
      navigate("/assistant/appointments");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    try {
      await assistantService.confirmAppointment(id);
      setAppointment((prev) => ({ ...prev, status: "confirmed" }));
      alert("Confirmed");
    } catch (e) {
      console.error(e);
      alert("Confirm failed");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Appointment detail</h2>
      </div>

      <div className="border rounded p-4">
        <div className="mb-2">
          <strong>Patient:</strong> {appointment.patientName}
        </div>
        <div className="mb-2">
          <strong>Time:</strong> {new Date(appointment.time).toLocaleString()}
        </div>
        <div className="mb-2">
          <strong>Status:</strong> {appointment.status}
        </div>
        <div className="mb-2">
          <strong>Reason:</strong> {appointment.reason || "-"}
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={() => navigate(-1)}>Back</Button>
          {appointment.status !== "confirmed" && (
            <Button variant="primary" onClick={confirm}>
              Confirm
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
