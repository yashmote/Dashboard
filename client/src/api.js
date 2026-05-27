// client/src/api.js
import axios from 'axios';
const API_URL = 'http://localhost:3001';

// HABITS & DIARY (Keep these)
export const getHabits = () => axios.get(`${API_URL}/habits`);
export const createHabit = (name) => {
  // Get local date string "YYYY-MM-DD"
  const localDate = new Date().toLocaleDateString('en-CA'); 
  return axios.post(`${API_URL}/habits`, { name, created_at: localDate });
};
export const deleteHabit = (id) => axios.delete(`${API_URL}/habits/${id}`);
export const getLogs = (start, end) => axios.get(`${API_URL}/logs?start=${start}&end=${end}`);
export const toggleLog = (habit_id, date) => axios.post(`${API_URL}/logs/toggle`, { habit_id, date });
export const getDiary = (date) => axios.get(`${API_URL}/diary/${date}`);
export const saveDiary = (data) => axios.post(`${API_URL}/diary`, data);
export const getDiaryHistory = () => axios.get(`${API_URL}/diary-history`);

// FINANCE (UPDATED)
export const getBalance = () => axios.get(`${API_URL}/finance/balance`);
export const updateBalance = (amount) => axios.post(`${API_URL}/finance/balance`, { amount });
export const getTransactions = () => axios.get(`${API_URL}/finance/transactions`);
export const addTransaction = (data) => axios.post(`${API_URL}/finance/transactions`, data);
export const deleteTransaction = (id) => axios.delete(`${API_URL}/finance/transactions/${id}`);