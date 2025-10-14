import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import vi from "date-fns/locale/vi"; // tiếng Việt
import { Calendar } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import CardHeader from "../../../components/ui/CardHeader";
import CardTitle from "../../../components/ui/CardTitle";

export function DoctorBookingCalendar({ doctor }) {
    const { id } = useParams();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const formatCurrency = (amount, currency = 'VND') => {
        return `${new Intl.NumberFormat('vi-VN').format(amount)} ${currency}`;
    };


    if (!doctor) return null; // bảo vệ nếu doctor chưa có

    // === Lấy các slot theo ngày đã chọn ===
    const availableSlots = selectedDate
        ? (doctor.data.slots || []) // <--- fallback nếu doctor.slots undefined
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
                time: `${new Date(slot.start_time).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })} - ${new Date(slot.end_time).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}`,
                fee: slot.fee_amount,
                clinicName: slot.clinic_name,
            }))
        : [];


    // === Tạo danh sách ngày có slot để highlight trong calendar ===
    const workingDates = (doctor.slots || []).map((slot) => {
        const d = new Date(slot.start_time);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    });


    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Đặt lịch khám
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Calendar Picker */}
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
                        calendarStartDay={1}
                        placeholderText="Chọn ngày"
                        dateFormat="dd/MM/yyyy"
                        popperPlacement="bottom-start"
                    />
                </div>

                {/* Time Slots */}
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
                                        <span className="text-xs text-muted-foreground">{slot.clinicName}</span>
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

                {/* Booking Summary */}
                <div className="pt-4 border-t">
                    <div className="flex justify-between mb-4">
                        <span className="text-muted-foreground">Giá khám:</span>
                        <span className="text-xl font-bold text-primary">
                            {doctor.data.pricing?.minFee
                                ? formatCurrency(doctor.data.pricing.minFee, doctor.data.pricing.currency)
                                : "Chưa có giá"}
                        </span>

                    </div>
                    <Link
                        to={`/home/doctordetail/${id}/booking`}
                        state={{
                            date: selectedDate ? format(selectedDate, "dd/MM/yyyy") : null,
                            slot: selectedSlot,
                        }}
                    >
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={!selectedSlot}
                        >
                            {selectedSlot ? "Xác nhận đặt lịch" : "Chọn giờ khám"}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
