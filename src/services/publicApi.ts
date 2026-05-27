// services/publicApi.ts
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.21.209:8000/api/';

// ✅ API pública - SEM credentials
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false, // ✅ Importante para endpoints públicos
});

export default publicApi;