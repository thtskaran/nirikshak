import axios from "axios";

const llmapi = axios.create({
  baseURL: import.meta.env.VITE_MODEL_CORE,
});

export default llmapi;
