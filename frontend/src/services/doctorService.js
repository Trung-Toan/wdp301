// Doctor Service - API calls for doctor features
// This service layer makes it easy to switch from mock data to real API calls

import {
  mockFeedback,
  mockDashboardStats,
  getPopulatedPatient,
} from "../data/mockData";

// Toggle this to switch between mock data and real API
const USE_MOCK_DATA = true;

// Base URL for API calls (when USE_MOCK_DATA is false)
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard APIs
export const getDashboardStats = async (doctorId) => {
  if (USE_MOCK_DATA) {
    await delay();

    // Calculate real-time stats from mock data

    return {
      success: true,
      data: {
        ...mockDashboardStats,
      },
    };
  }

  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/dashboard/stats`
  );
  return response.json();
};

// Feedback APIs
export const getFeedback = async (doctorId, filters = {}) => {
  if (USE_MOCK_DATA) {
    await delay();
    let feedback = mockFeedback.filter((f) => f.doctor_id === doctorId);

    if (filters.rating) {
      feedback = feedback.filter(
        (f) => f.rating === Number.parseInt(filters.rating)
      );
    }

    // Populate with patient info (but keep anonymous if needed)
    feedback = feedback.map((f) => ({
      ...f,
      patient: f.is_anonymous ? null : getPopulatedPatient(f.patient_id),
    }));

    return {
      success: true,
      data: feedback,
      total: feedback.length,
    };
  }

  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${BASE_URL}/doctor/${doctorId}/feedback?${queryParams}`
  );
  return response.json();
};
