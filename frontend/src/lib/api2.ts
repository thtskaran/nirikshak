import axios from "axios";

const api2 = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_SERVER_BASE2,
});

export default api2;