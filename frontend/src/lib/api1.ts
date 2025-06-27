import axios from "axios";

const api1 = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_SERVER_BASE1,
});

export default api1;
