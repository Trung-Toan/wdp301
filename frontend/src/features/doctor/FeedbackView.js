import { memo, useState, useEffect } from "react"
import { Star, MessageSquareText, TrendingUp, ThumbsUp, ChevronDown, Activity } from "lucide-react"
import { getFeedback } from "../../services/doctorService"
import { Spinner } from "react-bootstrap" // Import Spinner từ React Bootstrap
import { toast } from "react-toastify"
import { CheckCircle } from "react-bootstrap-icons"

const FeedbackView = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, 5star, 4star, 3star, 2star, 1star

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getFeedback("DOC001");
      // Giả định API trả về res.data là mảng feedback
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Không thể tải dữ liệu phản hồi.");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (feedbacks.length === 0) {
      return {
        averageRating: 0,
        totalFeedback: 0,
        positivePercentage: 0,
        trend: 0,
      }
    }

    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0)
    const averageRating = (totalRating / feedbacks.length).toFixed(1)

    // Calculate positive percentage (4-5 stars)
    const positiveFeedbacks = feedbacks.filter((fb) => fb.rating >= 4).length
    const positivePercentage = Math.round((positiveFeedbacks / feedbacks.length) * 100)

    // Calculate trend (mock calculation - compare last 7 days vs previous 7 days)
    const now = new Date()
    const last7Days = feedbacks.filter((fb) => {
      const fbDate = new Date(fb.createdAt)
      const diffDays = Math.floor((now - fbDate) / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }).length

    const previous7Days = feedbacks.filter((fb) => {
      const fbDate = new Date(fb.createdAt)
      const diffDays = Math.floor((now - fbDate) / (1000 * 60 * 60 * 24))
      return diffDays > 7 && diffDays <= 14
    }).length

    const trend = previous7Days > 0 ? Math.round(((last7Days - previous7Days) / previous7Days) * 100) : 0

    return {
      averageRating,
      totalFeedback: feedbacks.length,
      positivePercentage,
      trend,
    }
  }

  const stats = calculateStats()

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) =>
      index < rating ? (
        <Star key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      ) : (
        <Star key={index} className="w-5 h-5 text-gray-300" />
      ),
    )
  }

  const getFilteredFeedbacks = () => {
    if (filter === "all") return feedbacks
    const starRating = Number.parseInt(filter.replace("star", ""))
    return feedbacks.filter((fb) => fb.rating === starRating)
  }

  const filteredFeedbacks = getFilteredFeedbacks()

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-10">
        <Spinner animation="border" variant="primary" />
        <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu phản hồi...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 mb-8 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Feedback từ bệnh nhân</h1>
                <p className="text-base text-gray-600 mt-1">
                  Xem đánh giá và phản hồi ẩn danh từ bệnh nhân
                </p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Đánh giá trung bình */}
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Đánh giá trung bình"
            value={stats.averageRating}
            unit="/5"
            color="yellow"
          />

          {/* Tổng feedback */}
          <StatCard
            icon={<MessageSquareText className="w-6 h-6" />}
            title="Tổng feedback"
            value={stats.totalFeedback}
            color="blue"
          />

          {/* Đánh giá tích cực */}
          <StatCard
            icon={<ThumbsUp className="w-6 h-6" />}
            title="Đánh giá tích cực"
            value={stats.positivePercentage}
            unit="%"
            color="green"
          />

          {/* Xu hướng */}
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Xu hướng (7 ngày)"
            value={stats.trend}
            unit="%"
            color="purple"
            isTrend={true}
          />
        </div>

        {/* Feedback Section */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tất cả feedback</h2>
            
            {/* Filter Dropdown */}
            <div className="relative mt-3 sm:mt-0 w-full sm:w-auto">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 bg-white font-medium text-gray-700"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="5star">5 sao</option>
                <option value="4star">4 sao</option>
                <option value="3star">3 sao</option>
                <option value="2star">2 sao</option>
                <option value="1star">1 sao</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="feedbacks-list space-y-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MessageSquareText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">
                    Không có feedback nào phù hợp với bộ lọc.
                </p>
              </div>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <div key={feedback._id} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex justify-between items-start mb-3 border-b pb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.rating)}
                      <span className="ml-2 text-lg font-bold text-gray-800">
                        {feedback.rating}.0
                      </span>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        {feedback.category || "Tổng thể"}
                      </span>
                      <p className="text-xs text-gray-500 block">
                        {formatDate(feedback.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-base leading-relaxed italic mb-4">
                    "{feedback.comment}"
                  </p>

                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-700">
                      Ẩn danh
                    </span>
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Đã xác thực là bệnh nhân
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Component for Stat Cards
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
                    <div className={`text-3xl font-extrabold ${isTrend ? trendColorClass : 'text-gray-900'}`}>
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

export default memo(FeedbackView)