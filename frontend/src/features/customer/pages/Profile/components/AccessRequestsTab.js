import React, { useState } from "react";

import { Clock, CheckCircle, XCircle } from "lucide-react";
import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";

export default function AccessRequestsTab() {
    const [accessRequests, setAccessRequests] = useState([
        {
            id: 1,
            doctorName: "BS. Nguyễn Văn A",
            specialty: "Nội hô hấp",
            facility: "Bệnh viện Bạch Mai",
            reason: "Cần xem kết quả X-quang để đánh giá tiến triển điều trị.",
            requestDate: "2025-10-15",
            status: "pending",
            avatar: "https://i.pravatar.cc/150?img=10",
        },
        {
            id: 2,
            doctorName: "BS. Trần Thị B",
            specialty: "Da liễu",
            facility: "Phòng khám Medlatec",
            reason: "Theo dõi kết quả xét nghiệm dị ứng da.",
            requestDate: "2025-09-28",
            status: "approved",
            avatar: "https://i.pravatar.cc/150?img=5",
        },
        {
            id: 3,
            doctorName: "BS. Lê Văn C",
            specialty: "Tim mạch",
            facility: "Bệnh viện Việt Đức",
            reason: "Xem hồ sơ tiền sử bệnh nhân để điều chỉnh thuốc.",
            requestDate: "2025-09-10",
            status: "rejected",
            avatar: "https://i.pravatar.cc/150?img=8",
        },
    ]);

    const handleApproveRequest = (id) => {
        setAccessRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req))
        );
    };

    const handleRejectRequest = (id) => {
        setAccessRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req))
        );
    };

    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Yêu cầu truy cập hồ sơ bệnh án</h2>

            <div className="space-y-4">
                {accessRequests.length > 0 ? (
                    accessRequests.map((request) => (
                        <div
                            key={request.id}
                            className={`border rounded-lg p-4 transition-colors ${request.status === "pending"
                                ? "bg-yellow-50 border-yellow-200"
                                : request.status === "approved"
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                        >
                            <div className="flex gap-4">
                                <img
                                    src={request.avatar || "/placeholder.svg"}
                                    alt={request.doctorName}
                                    className="h-16 w-16 rounded-full object-cover"
                                />

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-lg">{request.doctorName}</p>
                                            <p className="text-sm text-muted-foreground">{request.specialty}</p>
                                            <p className="text-sm text-muted-foreground">{request.facility}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {request.status === "pending" && (
                                                <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Chờ phê duyệt
                                                </span>
                                            )}
                                            {request.status === "approved" && (
                                                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Đã phê duyệt
                                                </span>
                                            )}
                                            {request.status === "rejected" && (
                                                <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <XCircle className="h-3 w-3" />
                                                    Đã từ chối
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm mb-3">
                                        <span className="text-muted-foreground">Lý do:</span> {request.reason}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Ngày yêu cầu: {request.requestDate}
                                    </p>

                                    {request.status === "pending" && (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleApproveRequest(request.id)}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Phê duyệt
                                            </Button>
                                            <Button
                                                onClick={() => handleRejectRequest(request.id)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Từ chối
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        Không có yêu cầu truy cập
                    </p>
                )}
            </div>
        </Card>
    );
}
