import React, { useEffect, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';
import assistantService from '../assistantService';
import Loading from '../../../components/Loading';

export default function AppointmentsList() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch();
  }, []);

  async function fetch() {
    setLoading(true);
    try {
      const res = await assistantService.getAppointments();
      setAppointments(res.data || []);
    } catch (e) {
      setError('Không tải được danh sách lịch. Kiểm tra API.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function confirmAppointment(id) {
    try {
      await assistantService.confirmAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch (e) {
      alert('Xác nhận thất bại');
      console.error(e);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Appointments</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {appointments.length === 0 ? (
        <div>No appointments</div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <AppointmentCard key={a.id} appointment={a} onConfirm={confirmAppointment} />
          ))}
        </div>
      )}
    </div>
  );
}