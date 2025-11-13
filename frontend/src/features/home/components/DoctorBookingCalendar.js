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
import { formatISOTime } from "../../../utils/dateTimeUtils";

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

    // Format time với UTC timezone để hiển thị đúng giờ UTC như trong data
    // Dùng useUTC = true để hiển thị UTC time từ backend
    const formatSlotTime = (isoString) => formatISOTime(isoString, true);

    // Helper function để lấy date string từ ISO string (YYYY-MM-DD)
    // Có 2 cách:
    // 1. Nếu backend lưu theo UTC: dùng getUTCFullYear(), getUTCMonth(), getUTCDate()
    // 2. Nếu backend lưu theo local time nhưng format UTC: extract trực tiếp từ string hoặc dùng local methods
    // Thử extract trực tiếp từ string trước (ví dụ: "2025-11-09T17:00:00.000Z" -> "2025-11-9")
    const getLocalDateStringFromISO = (isoString) => {
        if (!isoString) return null;
        const dateMatch = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
            const year = parseInt(dateMatch[1], 10);
            const month = parseInt(dateMatch[2], 10) - 1; // month is 0-indexed
            const day = parseInt(dateMatch[3], 10);
            return `${year}-${month}-${day}`;
        }
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return `${year}-${month}-${day}`;
    };

    // Helper function để lấy date string từ Date object (local time)
    const getDateStringFromDate = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return `${year}-${month}-${day}`;
    };

    // Lấy thời gian hiện tại theo UTC
    const nowUTC = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    const availableSlots = selectedDate
        ? slots
            .filter((slot) => {
                const slotDateStr = getLocalDateStringFromISO(slot.start_time);
                const selectedDateStr = getDateStringFromDate(selectedDate);
                if (slotDateStr !== selectedDateStr) return false;
                // So sánh theo UTC
                return new Date(slot.start_time) >= nowUTC;
            })
            .map((slot) => ({
                id: slot._id,
                time: `${formatSlotTime(slot.start_time)} - ${formatSlotTime(slot.end_time)}`,
                fee: slot.fee_amount || doctor.pricing?.minFee || 0,
                clinicName: slot.clinic_name || doctor.clinic?.name || "Chưa có phòng khám",
                clinicId: slot.clinic_id || doctor.clinic?._id || null,
                specialtyId: resolvedSpecialtyId,
                // Giữ nguyên start_time và end_time để dùng cho booking
                start_time: slot.start_time,
                end_time: slot.end_time,
            }))
        : [];

    console.log("thời gian bây giờ: ", nowUTC);
    console.log("Available Slots:", availableSlots);
    // Tạo workingDates từ local date (convert từ UTC) để đánh dấu đúng ngày trong calendar
    const workingDates = [...new Set(slots.map((slot) => {
        return getLocalDateStringFromISO(slot.start_time);
    }))];

    // Hàm kiểm tra đăng nhập
    const handleBooking = () => {
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (!user) {
            toast.error("Vui lòng đăng nhập để đặt lịch!");
            setTimeout(() => {
                navigate("/login", {
                    state: { from: window.location.pathname + window.location.search },
                });
            }, 500);
            return;
        }
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
                doctorAvatar: doctor.avatar_url || null,
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
                                Không còn khung giờ khả dụng trong ngày này.
                            </p>
                        )}
                    </div>
                )}

                <div className="pt-4 border-t">
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
