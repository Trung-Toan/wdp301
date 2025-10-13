import api from "./api/api"; // tuỳ theo cấu trúc api của bạn

export const getAssistantDashboard = async () => {
  try {
    const { data } = await api.get("/assistant/dashboard");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
};

// thêm các hàm: getPatients, getSchedule, getRecordRequests, getPrescriptions, getChats...
