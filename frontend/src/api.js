import axios from 'axios';

const apiHost = window?.location?.hostname || 'localhost';
const apiProtocol = window?.location?.protocol || 'http:';
const api = axios.create({
  baseURL: `${apiProtocol}//${apiHost}:5000/api`,
  withCredentials: true,
});

export default api;
