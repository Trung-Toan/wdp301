import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
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

    // Hàm kiểm tra đăng nhập + cảnh báo đặt lịch sát giờ
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

        // Nếu chưa chọn slot thì không làm gì
        if (!selectedSlot) {
            toast.warning("Vui lòng chọn khung giờ trước khi đặt lịch!");
            return;
        }

        // Tính thời gian hiện tại theo UTC (dự án bạn dùng UTC toàn phần)
        const nowUTC = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        const slotStart = new Date(selectedSlot.start_time);

        // Tính khoảng cách phút giữa slot và thời điểm hiện tại
        const diffMinutes = (slotStart - nowUTC) / (1000 * 60);

        // Nếu slot sắp tới trong vòng 30 phút → cảnh báo
        if (diffMinutes > 0 && diffMinutes < 30) {
            toast.warning("Khung giờ này quá sát, vui lòng chọn thời gian cách hiện tại ít nhất 30 phút!");
            return;
        }

        // Nếu đã qua giờ → không cho đặt
        if (diffMinutes <= 0) {
            toast.error("Khung giờ này đã qua, vui lòng chọn thời gian khác!");
            return;
        }

        // Chuyển hướng sang trang booking
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
        <Card className="sticky top-24 shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <Calendar className="h-6 w-6 text-blue-600" /> Đặt lịch khám
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
                {/* Date Picker Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-base">Chọn ngày khám</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Chọn ngày có sẵn lịch</p>
                            </div>
                        </div>
                        {selectedDate && (
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Đã chọn</div>
                                <div className="text-sm font-semibold text-blue-600">
                                    {format(selectedDate, "dd/MM/yyyy")}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative border-2 border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-white to-gray-50 shadow-inner overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-100 rounded-full -ml-12 -mb-12 opacity-20"></div>
                        
                        <div className="relative flex justify-center">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    setSelectedSlot(null);
                                }}
                                inline
                                locale={vi}
                                minDate={new Date()}
                                className="w-full"
                                calendarClassName="!border-0 !shadow-none"
                                dayClassName={(date) => {
                                    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                                    const isWorking = workingDates.includes(key);
                                    const isSelected = selectedDate && 
                                        date.getFullYear() === selectedDate.getFullYear() &&
                                        date.getMonth() === selectedDate.getMonth() &&
                                        date.getDate() === selectedDate.getDate();
                                    
                                    if (isSelected) {
                                        return "!bg-gradient-to-br !from-blue-600 !to-cyan-600 !text-white !font-bold !rounded-full !shadow-lg !shadow-blue-300 hover:!from-blue-700 hover:!to-cyan-700 !scale-110 !transition-all !duration-200";
                                    }
                                    if (isWorking) {
                                        return "!bg-green-50 !text-green-700 !font-semibold !rounded-full !border-2 !border-green-300 hover:!bg-green-100 hover:!border-green-400 hover:!scale-105 !transition-all !duration-200";
                                    }
                                    return "!text-gray-400 hover:!bg-gray-100 !rounded-full !transition-all !duration-200";
                                }}
                                renderCustomHeader={({
                                    date,
                                    decreaseMonth,
                                    increaseMonth,
                                    prevMonthButtonDisabled,
                                    nextMonthButtonDisabled,
                                }) => (
                                    <div className="flex items-center justify-between mb-4 px-2 max-w-[280px] mx-auto">
                                        <button
                                            onClick={decreaseMonth}
                                            disabled={prevMonthButtonDisabled}
                                            className={`p-2 rounded-lg transition-all ${
                                                prevMonthButtonDisabled
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div className="text-center flex-1">
                                            <div className="text-lg font-bold text-gray-800">
                                                {format(date, "MMMM yyyy", { locale: vi })}
                                            </div>
                                        </div>
                                        <button
                                            onClick={increaseMonth}
                                            disabled={nextMonthButtonDisabled}
                                            className={`p-2 rounded-lg transition-all ${
                                                nextMonthButtonDisabled
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            />
                        </div>
                        
                        {/* Legend */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-green-50 border-2 border-green-300"></div>
                                <span className="text-gray-600">Có lịch</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                <span className="text-gray-600">Đã chọn</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Slots Section */}
                {selectedDate && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-800 text-base">
                                Chọn giờ khám - {format(selectedDate, "dd/MM/yyyy")}
                            </h4>
                        </div>
                        {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`relative px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 transform hover:scale-105 ${
                                            selectedSlot?.id === slot.id
                                                ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:shadow-md"
                                        }`}
                                    >
                                        {selectedSlot?.id === slot.id && (
                                            <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-white" />
                                        )}
                                        <div className="text-center space-y-1">
                                            <div className="font-bold text-base">{slot.time}</div>
                                            <div className={`text-xs font-semibold mt-1 pt-1 border-t ${
                                                selectedSlot?.id === slot.id 
                                                    ? "border-blue-400 text-blue-100" 
                                                    : "border-gray-200 text-blue-600"
                                            }`}>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm font-medium">
                                    Không còn khung giờ khả dụng trong ngày này.
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Vui lòng chọn ngày khác
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Selected Slot Summary */}
                {selectedSlot && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 space-y-2">
                        <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>Thông tin đặt lịch</span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span><strong>Ngày:</strong> {format(selectedDate, "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span><strong>Giờ:</strong> {selectedSlot.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span><strong>Địa điểm:</strong> {selectedSlot.clinicName}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Button */}
                <div className="pt-2 border-t-2">
                    <Button
                        className={`w-full py-3 text-base font-semibold transition-all duration-200 ${
                            selectedSlot 
                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]" 
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        size="lg"
                        disabled={!selectedSlot}
                        onClick={handleBooking}
                    >
                        {selectedSlot ? (
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Xác nhận đặt lịch
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Clock className="h-5 w-5" />
                                Chọn giờ khám
                            </span>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
