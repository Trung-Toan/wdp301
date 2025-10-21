import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import CardHeader from "../../../components/ui/CardHeader";
import CardTitle from "../../../components/ui/CardTitle";

export function DoctorBookingCalendar({ doctor }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const formatCurrency = (amount, currency = "VND") => {
        if (!amount) return "Chưa có giá";
        const value = Number(amount);
        return `${new Intl.NumberFormat("vi-VN").format(value)} ${currency}`;
    };

    if (!doctor) return null;

    const resolvedSpecialtyId =
        (Array.isArray(doctor.specialties)
            ? doctor.specialties[0]?._id || doctor.specialties[0]
            : doctor.specialties?._id) || null;

    const slots = doctor.slots || [];

    const formatUTCtoHHmm = (utcString) => {
        if (!utcString) return "";
        const [_, timePart] = utcString.split("T");
        const [hours, minutes] = timePart.split(":");
        return `${hours}:${minutes}`;
    };

    const availableSlots = selectedDate
        ? slots
            .filter((slot) => {
                const slotDate = new Date(slot.start_time);
                return (
                    slotDate.getFullYear() === selectedDate.getFullYear() &&
                    slotDate.getMonth() === selectedDate.getMonth() &&
                    slotDate.getDate() === selectedDate.getDate()
                );
            })
            .map((slot) => ({
                id: slot._id,
                time: `${formatUTCtoHHmm(slot.start_time)} - ${formatUTCtoHHmm(slot.end_time)}`,
                fee: slot.fee_amount || doctor.pricing?.minFee || 0,
                clinicName: slot.clinic_name || doctor.clinic?.name || "Chưa có phòng khám",
                clinicId: slot.clinic_id || doctor.clinic?._id || null,
                specialtyId: resolvedSpecialtyId,
            }))
        : [];

    const workingDates = slots.map((slot) => {
        const d = new Date(slot.start_time);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    });

    // Hàm kiểm tra đăng nhập
    const handleBooking = () => {
        const user = JSON.parse(sessionStorage.getItem("user"));
        // key lưu login
        if (!user) {
            toast.error("Vui lòng đăng nhập để đặt lịch!");
            navigate("/login"); // <-- chuyển sang trang login
            return;
        }
        // Nếu đã đăng nhập, chuyển sang booking page
        navigate(`/home/doctordetail/${id}/booking`, {
            state: {
                selectedDate: selectedDate ? format(selectedDate, "dd/MM/yyyy") : null,
                selectedSlot,
                doctorName: doctor.name,
                specialty: doctor.specialties?.[0]?.name || "Chưa có chuyên khoa",
                hospital: selectedSlot?.clinicName || doctor.workplace,
                price: selectedSlot?.fee
                    ? formatCurrency(selectedSlot.fee, doctor.pricing?.currency)
                    : doctor.pricing?.minFee
                        ? formatCurrency(doctor.pricing.minFee, doctor.pricing.currency)
                        : "Chưa có giá",
                time: selectedSlot?.time,
                image: doctor.avatar_url || "/placeholder.svg",
                doctorId: id,
                clinicId: selectedSlot?.clinicId,
                specialtyId: selectedSlot?.specialtyId,
            },
        });
    };


    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Đặt lịch khám
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-3">Chọn ngày khám</h4>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                        }}
                        inline
                        locale={vi}
                        minDate={new Date()}
                        dayClassName={(date) => {
                            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                            return workingDates.includes(key)
                                ? "bg-green-100 text-green-700 font-medium rounded-full"
                                : "text-gray-400";
                        }}
                    />
                </div>

                {selectedDate && (
                    <div>
                        <h4 className="font-semibold mb-3">
                            Chọn giờ khám cho {format(selectedDate, "dd/MM/yyyy")}
                        </h4>
                        {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedSlot?.id === slot.id
                                            ? "border-primary bg-primary text-white"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        {slot.time} <br />
                                        <span className="text-xs text-muted-foreground">
                                            {slot.clinicName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Bác sĩ không có lịch khám ngày này.
                            </p>
                        )}
                    </div>
                )}

                <div className="pt-4 border-t">
                    <div className="flex justify-between mb-4">
                        <span className="text-muted-foreground">Giá khám:</span>
                        <span className="text-xl font-bold text-primary">
                            {selectedSlot?.fee
                                ? formatCurrency(selectedSlot.fee, doctor.pricing?.currency)
                                : doctor.pricing?.minFee
                                    ? formatCurrency(doctor.pricing.minFee, doctor.pricing.currency)
                                    : "Chưa có giá"}
                        </span>
                    </div>

                    <Button
                        className="w-full"
                        size="lg"
                        disabled={!selectedSlot}
                        onClick={handleBooking}
                    >
                        {selectedSlot ? "Xác nhận đặt lịch" : "Chọn giờ khám"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
