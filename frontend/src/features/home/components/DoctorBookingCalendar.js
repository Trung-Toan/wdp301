import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
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

    const formatCurrency = (amount, currency = "VND") => {
        if (!amount) return "Chưa có giá";
        const value = Number(amount);
        return `${new Intl.NumberFormat("vi-VN").format(value)} ${currency}`;
    };

    if (!doctor) return null;

    // 🧩 DEBUG cấu trúc dữ liệu của doctor và specialties
    console.log("%c[DOCTOR DATA]", "color:#4CAF50;font-weight:bold;", doctor);
    console.log("%c[DEBUG DOCTOR SPECIALTIES]", "color:#00bcd4;font-weight:bold;", doctor.specialties);

    // ✅ Xử lý specialtyId an toàn (cho mọi kiểu dữ liệu trả về)
    const resolvedSpecialtyId =
        (Array.isArray(doctor.specialties)
            ? doctor.specialties[0]?._id || doctor.specialties[0]
            : doctor.specialties?._id) || null;

    console.log("%c[SPECIALTY ID EXTRACTED]", "color:#f50057;font-weight:bold;", resolvedSpecialtyId);

    const slots = doctor.slots || [];

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
            .map((slot) => {
                const mappedSlot = {
                    id: slot._id,
                    time: `${new Date(slot.start_time).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })} - ${new Date(slot.end_time).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}`,
                    fee: slot.fee_amount || doctor.pricing?.minFee || 0,
                    clinicName: slot.clinic_name || doctor.clinic?.name || "Chưa có phòng khám",
                    clinicId: slot.clinic_id || doctor.clinic?._id || null,
                    // ✅ Lấy specialtyId từ doctor
                    specialtyId: resolvedSpecialtyId,
                };

                console.log("%c[SLOT DEBUG]", "color:#1e90ff;font-weight:bold;", mappedSlot);
                return mappedSlot;
            })
        : [];

    const workingDates = slots.map((slot) => {
        const d = new Date(slot.start_time);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    });

    console.log("%c[AVAILABLE SLOTS]", "color:#9C27B0;font-weight:bold;", availableSlots);
    console.log("%c[SELECTED DATE]", "color:#FF9800;font-weight:bold;", selectedDate);
    console.log("%c[SELECTED SLOT]", "color:#E91E63;font-weight:bold;", selectedSlot);

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Đặt lịch khám (Debug Mode)
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* ----------------- CHỌN NGÀY ----------------- */}
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

                {/* ----------------- CHỌN GIỜ ----------------- */}
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
                                        onClick={() => {
                                            console.log("%c[SLOT SELECTED]", "color:#2196F3;font-weight:bold;", slot);
                                            setSelectedSlot(slot);
                                        }}
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

                {/* ----------------- XÁC NHẬN ĐẶT LỊCH ----------------- */}
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

                    <Link
                        to={`/home/doctordetail/${id}/booking`}
                        state={{
                            selectedDate: selectedDate ? format(selectedDate, "dd/MM/yyyy") : null,
                            selectedSlot,
                            doctorName: doctor.name,
                            specialty: doctor.specialties?.[0]?.name || "Chưa có chuyên khoa",
                            hospital: selectedSlot?.clinicName || doctor.workplace,
                            price:
                                selectedSlot?.fee
                                    ? formatCurrency(selectedSlot.fee, doctor.pricing?.currency)
                                    : doctor.pricing?.minFee
                                        ? formatCurrency(doctor.pricing.minFee, doctor.pricing.currency)
                                        : "Chưa có giá",
                            time: selectedSlot?.time,
                            image: doctor.avatar_url || "/placeholder.svg",
                            doctorId: id,
                            clinicId: selectedSlot?.clinicId,
                            specialtyId: selectedSlot?.specialtyId.id,
                        }}
                        onClick={() => {
                            console.log(
                                "%c[BOOKING STATE SENT]",
                                "color:#FF5722;font-weight:bold;",
                                {
                                    selectedDate: selectedDate
                                        ? format(selectedDate, "dd/MM/yyyy")
                                        : null,
                                    selectedSlot,
                                    doctorName: doctor.name,
                                    specialty:
                                        doctor.specialties?.[0]?.name || "Chưa có chuyên khoa",
                                    hospital:
                                        selectedSlot?.clinicName || doctor.workplace,
                                    price:
                                        selectedSlot?.fee
                                            ? formatCurrency(
                                                selectedSlot.fee,
                                                doctor.pricing?.currency
                                            )
                                            : doctor.pricing?.minFee
                                                ? formatCurrency(
                                                    doctor.pricing.minFee,
                                                    doctor.pricing.currency
                                                )
                                                : "Chưa có giá",
                                    time: selectedSlot?.time,
                                    image: doctor.avatar_url || "/placeholder.svg",
                                    doctorId: id,
                                    clinicId: selectedSlot?.clinicId,
                                    specialtyId: selectedSlot?.specialtyId.id,
                                }
                            );
                        }}
                    >
                        <Button className="w-full" size="lg" disabled={!selectedSlot}>
                            {selectedSlot
                                ? "Xác nhận đặt lịch (Debug)"
                                : "Chọn giờ khám"}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
