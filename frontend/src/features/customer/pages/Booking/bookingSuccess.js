// src/components/BookingSuccess.jsx
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, User, MapPin, Calendar, Clock } from "lucide-react";

export default function BookingSuccess({ bookingInfo }) {
    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">Đặt lịch thành công!</h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Cảm ơn bạn đã đặt lịch khám. Thông tin xác nhận đã được gửi đến
                            email và số điện thoại của bạn.
                        </p>

                        {/* Booking Info */}
                        <div className="bg-gray-50 rounded-lg border p-6 mb-8 text-left space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-blue-600 mt-1" />
                                <div>
                                    <div className="font-semibold">{bookingInfo.doctorName}</div>
                                    <div className="text-sm text-gray-500">
                                        {bookingInfo.specialty}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                                <div>
                                    <div>{bookingInfo.hospital}</div>
                                    <div className="text-sm text-gray-500">
                                        {bookingInfo.location}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span>{bookingInfo.date}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span>{bookingInfo.time}</span>
                            </div>

                            <div className="pt-4 border-t flex justify-between">
                                <span className="text-gray-500">Tổng chi phí:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {bookingInfo.price}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/home/appointment">
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Xem lịch hẹn của tôi
                                </button>
                            </Link>
                            <Link to="/home">
                                <button className="px-6 py-3 border rounded-lg hover:bg-gray-100">
                                    Về trang chủ
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
