// Admin Service - API calls for admin operations
export const adminService = {
  // Clinics
  getClinics: async () => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "City Medical Center",
            address: "123 Main St",
            phone: "555-0101",
            status: "active",
            doctors: 12,
            rating: 4.8,
          },
          {
            id: 2,
            name: "Health Plus Clinic",
            address: "456 Oak Ave",
            phone: "555-0102",
            status: "active",
            doctors: 8,
            rating: 4.5,
          },
        ])
      }, 500)
    })
  },

  updateClinic: async (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data })
      }, 500)
    })
  },

  deleteClinic: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },

  // Accounts
  getAccounts: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "doctor",
            status: "active",
            joinDate: "2024-01-15",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "clinic_manager",
            status: "active",
            joinDate: "2024-02-20",
          },
        ])
      }, 500)
    })
  },

  banAccount: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },

  unbanAccount: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },

  // Licenses
  getLicenses: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            doctorName: "Dr. John Doe",
            licenseNumber: "LIC-2024-001",
            type: "General Practice",
            expiryDate: "2025-12-31",
            status: "active",
          },
        ])
      }, 500)
    })
  },

  // Complaints
  getComplaints: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            complaintId: "CMP-2024-001",
            complainant: "John Doe",
            subject: "Poor service",
            priority: "high",
            status: "pending",
            date: "2024-06-15",
          },
        ])
      }, 500)
    })
  },

  resolveComplaint: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },

  // Dashboard
  getDashboardStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalUsers: 1250,
          totalClinics: 45,
          totalAppointments: 3890,
          complaints: 12,
        })
      }, 500)
    })
  },
}
