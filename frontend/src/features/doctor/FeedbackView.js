import { memo, useState, useMemo, useEffect } from "react";
import {
  Star,
  MessageSquareText,
  TrendingUp,
  ThumbsUp,
  ChevronDown,
  Activity,
  Search,
  SortAsc,
  SortDesc,
  Filter,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { CheckCircle } from "react-bootstrap-icons";
import { useDataByUrl } from "../../utility/data.utils";
import { doctorApi } from "../../api/doctor/doctorApi";

const FeedbackView = () => {
  // UI state
  const [filter, setFilter] = useState("all");        // all | 5star | ... | 1star
  const [q, setQ] = useState("");
  const [isAnonymous, setIsAnonymous] = useState("all"); // all | true | false
  const [sort, setSort] = useState("-createdAt");     // "-createdAt" | "createdAt" | "-rating" | "rating"
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Build params (đảm bảo thứ tự keys ổn định để hợp với queryKey hiện tại của hook)
  const params = useMemo(() => {
    const p = { page, limit, sort };
    if (q && q.trim()) p.q = q.trim();

    if (filter !== "all") {
      const star = parseInt(filter.replace("star", ""), 10);
      if (!Number.isNaN(star)) {
        p.minRating = star;
        p.maxRating = star;
      }
    }
    if (isAnonymous !== "all") {
      p.isAnonymous = isAnonymous === "true";
    }
    return p;
  }, [page, limit, sort, q, filter, isAnonymous]);

  // Fetch via hook của bạn
  const { data, isLoading, error } = useDataByUrl({
    url: doctorApi.GET_FEEDBACK,           // ví dụ "/api/doctor/feedback"
    key: "get-list-feedback",              // hook của bạn thêm url + values(params) vào queryKey
    params,                                // object -> axiosInstance.get(url, { params })
  });

  useEffect(() => {
    if (error) toast.error("Không thể tải dữ liệu phản hồi.");
  }, [error]);

  const items = data?.data?.items ?? [];
  const pagination = data?.data?.pagination ?? {
    page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false,
  };
  const summary = data?.data?.summary ?? {
    avgRating: 0, countsByRating: { 1:0, 2:0, 3:0, 4:0, 5:0 },
  };

  const totalFeedback = pagination.total ?? items.length;
  const positive = (summary.countsByRating?.[4] || 0) + (summary.countsByRating?.[5] || 0);
  const positivePercentage = totalFeedback ? Math.round((positive / totalFeedback) * 100) : 0;
  const trend = 0; // backend chưa cung cấp trend theo 7 ngày → để 0

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) =>
      i < rating ? (
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      ) : (
        <Star key={i} className="w-5 h-5 text-gray-300" />
      )
    );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const onChangePage = (p) => {
    if (p >= 1 && p <= (pagination.totalPages || 1)) setPage(p);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-10">
        <Spinner animation="border" variant="primary" />
        <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu phản hồi...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 mb-8 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback từ bệnh nhân</h1>
            <p className="text-base text-gray-600 mt-1">Xem đánh giá và phản hồi ẩn danh từ bệnh nhân</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Đánh giá trung bình"
            value={Number(summary.avgRating || 0).toFixed(2)}
            unit="/5"
            color="yellow"
          />
          <StatCard
            icon={<MessageSquareText className="w-6 h-6" />}
            title="Tổng feedback"
            value={totalFeedback}
            color="blue"
          />
          <StatCard
            icon={<ThumbsUp className="w-6 h-6" />}
            title="Đánh giá tích cực"
            value={positivePercentage}
            unit="%"
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Xu hướng (7 ngày)"
            value={trend}
            unit="%"
            color="purple"
            isTrend
          />
        </div>

        {/* Filters */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-5">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Tìm theo nội dung</label>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => { setPage(1); setQ(e.target.value); }}
                  placeholder="Nhập từ khoá (ví dụ: 'tận tình', 'chờ lâu'...)"
                  className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Star filter */}
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Lọc theo số sao</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter}
                  onChange={(e) => { setPage(1); setFilter(e.target.value); }}
                >
                  <option value="all">Tất cả</option>
                  <option value="5star">5 sao ({summary.countsByRating?.[5] || 0})</option>
                  <option value="4star">4 sao ({summary.countsByRating?.[4] || 0})</option>
                  <option value="3star">3 sao ({summary.countsByRating?.[3] || 0})</option>
                  <option value="2star">2 sao ({summary.countsByRating?.[2] || 0})</option>
                  <option value="1star">1 sao ({summary.countsByRating?.[1] || 0})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Anonymous filter */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Ẩn danh</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={isAnonymous}
                  onChange={(e) => { setPage(1); setIsAnonymous(e.target.value); }}
                >
                  <option value="all">Tất cả</option>
                  <option value="true">Chỉ ẩn danh</option>
                  <option value="false">Không ẩn danh</option>
                </select>
                <Filter className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Sort */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Sắp xếp</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sort}
                  onChange={(e) => { setPage(1); setSort(e.target.value); }}
                >
                  <option value="-createdAt">Mới nhất</option>
                  <option value="createdAt">Cũ nhất</option>
                  <option value="-rating">Điểm cao → thấp</option>
                  <option value="rating">Điểm thấp → cao</option>
                </select>
                {sort.includes("rating") ? (
                  <SortDesc className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                ) : (
                  <SortAsc className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-6">
          <div className="feedbacks-list space-y-4">
            {items.length === 0 ? (
              <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MessageSquareText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">Không có feedback nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              items.map((fb) => (
                <div key={fb._id} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex justify-between items-start mb-3 border-b pb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(fb.rating)}
                      <span className="ml-2 text-lg font-bold text-gray-800">{fb.rating}.0</span>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        {fb.category || "Tổng thể"}
                      </span>
                      <p className="text-xs text-gray-500 block">{formatDate(fb.createdAt)}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-base leading-relaxed italic mb-4">
                    “{fb.comment || "Không có nội dung"}”
                  </p>

                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-700">
                      {fb.anonymous ? "Ẩn danh" : (fb.patient_name || "Người dùng")}
                    </span>
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Đã xác thực là bệnh nhân
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-500">
              Trang <span className="font-semibold text-gray-700">{pagination.page}</span> /{" "}
              <span className="font-semibold text-gray-700">{pagination.totalPages}</span> • Tổng{" "}
              <span className="font-semibold text-gray-700">{pagination.total}</span> phản hồi
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
                disabled={!pagination.hasPrev}
                onClick={() => onChangePage(pagination.page - 1)}
              >
                Trước
              </button>
              <button
                className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
                disabled={!pagination.hasNext}
                onClick={() => onChangePage(pagination.page + 1)}
              >
                Sau
              </button>

              <select
                className="ml-2 px-3 py-2 border rounded-lg"
                value={limit}
                onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value, 10)); }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}/trang</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-10 text-sm text-gray-500">
          Tổng hợp theo dữ liệu phản hồi đã xác thực. Điểm trung bình:{" "}
          <span className="font-semibold text-gray-700">{Number(summary.avgRating || 0).toFixed(2)}/5</span>.
        </div>
      </div>
    </div>
  );
};

// Stat card
const StatCard = ({ icon, title, value, unit, color, isTrend = false }) => {
  const colorClasses = {
    yellow: { bg: "bg-yellow-500", shadow: "shadow-yellow-500/50", text: "text-yellow-500" },
    blue: { bg: "bg-blue-600", shadow: "shadow-blue-500/50", text: "text-blue-600" },
    green: { bg: "bg-green-600", shadow: "shadow-green-500/50", text: "text-green-600" },
    purple: { bg: "bg-purple-600", shadow: "shadow-purple-500/50", text: "text-purple-600" },
  }[color];

  let trendColorClass = "";
  if (isTrend) {
    if (value > 0) trendColorClass = "text-green-600";
    else if (value < 0) trendColorClass = "text-red-600";
    else trendColorClass = "text-gray-600";
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center space-x-4 transition duration-300 hover:shadow-xl">
      <div className={`p-3 rounded-full ${colorClasses.bg} text-white shadow-md ${colorClasses.shadow}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-500 uppercase">{title}</div>
        <div className="flex items-end mt-1">
          <div className={`text-3xl font-extrabold ${isTrend ? trendColorClass : "text-gray-900"}`}>
            {isTrend && value > 0 ? "+" : ""}
            {value}
          </div>
          {unit && <span className="ml-1 text-xl font-semibold text-gray-500">{unit}</span>}
        </div>
        {isTrend && (
          <div className={`flex items-center text-xs font-semibold mt-1 ${trendColorClass}`}>
            {value !== 0 && (value > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />)}
            {value === 0 ? "Không đổi" : "So với 7 ngày trước"}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FeedbackView);
