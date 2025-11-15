/**
 * Utility để đảm bảo loading state hiển thị ít nhất một khoảng thời gian tối thiểu
 * Tránh flash loading quá nhanh, gây khó chịu cho người dùng
 * 
 * @param {Function} setLoading - Function để set loading state (true/false)
 * @param {number} minDisplayTime - Thời gian tối thiểu hiển thị loading (ms), mặc định 600ms
 * @returns {Function} Function để set loading với minimum display time
 */
export const createLoadingWithMinTime = (setLoading, minDisplayTime = 600) => {
  let startTime = null;
  let timeoutId = null;

  return {
    start: () => {
      startTime = Date.now();
      setLoading(true);
    },
    stop: () => {
      if (!startTime) {
        setLoading(false);
        return;
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      // Clear timeout cũ nếu có
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Nếu đã đủ thời gian, set false ngay
      // Nếu chưa đủ, đợi thêm thời gian còn lại
      timeoutId = setTimeout(() => {
        setLoading(false);
        startTime = null;
        timeoutId = null;
      }, remaining);
    },
    // Cleanup function để clear timeout khi component unmount
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      startTime = null;
    }
  };
};

/**
 * Wrapper function đơn giản hơn - tự động handle start/stop
 * 
 * @param {Function} asyncFn - Async function cần wrap
 * @param {Function} setLoading - Function để set loading state
 * @param {number} minDisplayTime - Thời gian tối thiểu hiển thị loading (ms), mặc định 600ms
 * @returns {Promise} Promise từ async function
 */
export const withMinLoadingTime = async (asyncFn, setLoading, minDisplayTime = 600) => {
  const loadingControl = createLoadingWithMinTime(setLoading, minDisplayTime);
  
  try {
    loadingControl.start();
    const result = await asyncFn();
    return result;
  } catch (error) {
    throw error;
  } finally {
    loadingControl.stop();
  }
};

