import { memo, useState, useEffect } from "react"
import { Star, MessageSquareText, TrendingUp, ThumbsUp } from "lucide-react"
import { getFeedback } from "../../services/doctorService"
import "../../styles/doctor/feedback-view.css"

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
    // Lấy res.data thay vì res
    setFeedbacks(Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
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
        <Star key={index} className="star-icon star-filled" />
      ) : (
        <Star key={index} className="star-icon star-empty" />
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
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="feedback-view-container">
        <div className="loading-state">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="feedback-view-container">
      <div className="page-header">
        <h1 className="page-title">Feedback từ bệnh nhân</h1>
        <p className="page-subtitle">Xem đánh giá và phản hồi ẩn danh từ bệnh nhân</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">
            <Star />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đánh giá trung bình</div>
            <div className="stat-value">
              {stats.averageRating}
              <span className="stat-unit">/5</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <MessageSquareText />
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng feedback</div>
            <div className="stat-value">{stats.totalFeedback}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <ThumbsUp />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đánh giá tích cực</div>
            <div className="stat-value">
              {stats.positivePercentage}
              <span className="stat-unit">%</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-label">Xu hướng</div>
            <div className={`stat-value ${stats.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.trend >= 0 ? "+" : ""}
              {stats.trend}
              <span className="stat-unit">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="feedback-section">
        <div className="feedback-section-header">
          <h2 className="section-title">Tất cả feedback</h2>
          <select className="filter-dropdown" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="5star">5 sao</option>
            <option value="4star">4 sao</option>
            <option value="3star">3 sao</option>
            <option value="2star">2 sao</option>
            <option value="1star">1 sao</option>
          </select>
        </div>

        <div className="feedbacks-list">
          {filteredFeedbacks.length === 0 ? (
            <div className="empty-state">Không có feedback nào</div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback._id} className="feedback-card">
                <div className="feedback-card-header">
                  <div className="feedback-rating">
                    {renderStars(feedback.rating)}
                    <span className="rating-number">{feedback.rating}.0</span>
                  </div>
                  <div className="feedback-meta">
                    <span className="feedback-category">{feedback.category || "Tổng thể"}</span>
                    <span className="feedback-date">{formatDate(feedback.createdAt)}</span>
                  </div>
                </div>

                <div className="feedback-comment">{feedback.comment}</div>

                <div className="feedback-footer">
                  <span className="anonymous-badge">Ẩn danh</span>
                  <span className="verified-text">• Đã xác thực là bệnh nhân</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(FeedbackView)
