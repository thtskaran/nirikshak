import axios from "axios";

const api2 = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE2,
});

export default api2;