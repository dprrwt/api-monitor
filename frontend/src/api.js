import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '/api' : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const fetchEndpoints = async () => {
  const { data } = await api.get('/endpoints');
  return data;
};

export const addEndpoint = async (endpoint) => {
  const { data } = await api.post('/endpoints', endpoint);
  return data;
};

export const updateEndpoint = async (id, updates) => {
  const { data } = await api.put(`/endpoints/${id}`, updates);
  return data;
};

export const deleteEndpoint = async (id) => {
  await api.delete(`/endpoints/${id}`);
};

export const checkEndpoint = async (id) => {
  const { data } = await api.post(`/endpoints/${id}/check`);
  return data;
};

export const fetchHistory = async (id, limit = 50) => {
  const { data } = await api.get(`/endpoints/${id}/history?limit=${limit}`);
  return data;
};

export const fetchAlerts = async (limit = 20) => {
  const { data } = await api.get(`/alerts?limit=${limit}`);
  return data;
};

export const clearAlerts = async () => {
  await api.delete('/alerts');
};

export const fetchStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};
