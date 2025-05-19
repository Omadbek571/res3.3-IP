import axios from "axios"

// Axios instance yaratish
const axiosInstance = axios.create({
  baseURL: "https://oshxonacopy.pythonanywhere.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Token mavjud bo'lsa, uni headerga qo'shish
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Response kelganda bajariladigan amallar
    return response
  },
  (error) => {
    // Xatolik yuz berganda
    if (error.response) {
      // Server javob qaytargan xatolik
      console.error("Server xatoligi:", error.response.data)

      // 401 Unauthorized xatoligi bo'lsa, foydalanuvchini login sahifasiga yo'naltirish
      if (error.response.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/auth"
      }
    } else if (error.request) {
      // So'rov yuborilgan, lekin javob kelmagan
      console.error("Server javob bermadi:", error.request)
    } else {
      // So'rov yuborishda xatolik yuz bergan
      console.error("So'rov xatoligi:", error.message)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
