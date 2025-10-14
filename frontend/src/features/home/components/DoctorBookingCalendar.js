import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, getDay } from "date-fns";
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

    // === Xác định các ngày bác sĩ làm việc (0 = CN, 1 = Thứ 2, … 6 = Thứ 7)
    const workingDays = doctor.schedule.map((dayObj) => {
        const dayMap = { "Chủ nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6 };
        return dayMap[dayObj.day];
    });

    // === Khi chọn ngày, xác định thứ trong tuần để lấy khung giờ tương ứng
    const selectedDayOfWeek = selectedDate ? getDay(selectedDate) : null;
    const availableSlots =
        doctor.schedule.find((s) => {
            const dayMap = { "Chủ nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6 };
            return dayMap[s.day] === selectedDayOfWeek;
        })?.slots || [];

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
                            const day = getDay(date);
                            return workingDays.includes(day)
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
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedSlot === slot
                                            ? "border-primary bg-primary text-white"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Bác sĩ không làm việc ngày này.
                            </p>
                        )}
                    </div>
                )}

                {/* Booking Summary */}
                <div className="pt-4 border-t">
                    <div className="flex justify-between mb-4">
                        <span className="text-muted-foreground">Giá khám:</span>
                        <span className="text-xl font-bold text-primary">{doctor.price}</span>
                    </div>
                    <Link
                        to={`/home/doctordetail/${id}/booking`}
                        state={{
                            date: selectedDate ? format(selectedDate, "dd/MM/yyyy") : null,
                            time: selectedSlot,
                        }}
                    >
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={!selectedSlot || !doctor.available}
                        >
                            {selectedSlot ? "Xác nhận đặt lịch" : "Chọn giờ khám"}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
