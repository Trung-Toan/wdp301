import React from "react";
import Button from "../../../components/ui/Button";
import { Link } from "react-router-dom";

export default function AppointmentCard({ appointment = {}, onConfirm }) {
  const time = appointment.time
    ? new Date(appointment.time).toLocaleString()
    : "-";
  return (
    <div className="border rounded p-3 flex items-center justify-between">
      <div>
        <div className="font-semibold">
          {appointment.patientName || "Unknown patient"}
        </div>
        <div className="text-sm text-gray-500">{time}</div>
        <div className="text-sm mt-1">
          Status:{" "}
          <span className="font-medium">{appointment.status || "pending"}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Link to={`/assistant/appointments/${appointment.id}`}>
          <Button>View</Button>
        </Link>
        {appointment.status !== "confirmed" && (
          <Button
            variant="primary"
            onClick={() => onConfirm && onConfirm(appointment.id)}
          >
            Confirm
          </Button>
        )}
      </div>
    </div>
  );
}
