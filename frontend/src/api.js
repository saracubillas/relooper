import axios from 'axios';

const API_URL = 'http://localhost:8000';  // point to your FastAPI backend

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(`${API_URL}/upload`, formData);
  return res.data;
}