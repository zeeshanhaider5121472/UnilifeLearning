import axios from "axios";
import { Result, User } from "./types";

const API = axios.create({ baseURL: "/api" });

// Auth
export const loginUser = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const res = await API.get(`/users?username=${username}&password=${password}`);
  return res.data.length > 0 ? res.data[0] : null;
};

// Users
export const getUsers = async (role?: string): Promise<User[]> => {
  const url = role ? `/users?role=${role}` : "/users";
  const res = await API.get(url);
  return res.data;
};

export const getUser = async (id: number): Promise<User> => {
  const res = await API.get(`/users/${id}`);
  return res.data;
};

// export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
//   const res = await API.post('/users', user);
//   return res.data;
// };
export const createUser = async (user: User): Promise<User> => {
  const res = await API.post("/users", user);
  return res.data;
};

export const updateUser = async (
  id: number,
  user: Partial<User>,
): Promise<User> => {
  const res = await API.put(`/users/${id}`, user);
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await API.delete(`/users/${id}`);
};

// Results
export const getResults = async (
  params?: Record<string, string | number>,
): Promise<Result[]> => {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  const res = await API.get(`/results${query}`);
  return res.data;
};

export const getResult = async (id: number): Promise<Result> => {
  const res = await API.get(`/results/${id}`);
  return res.data;
};

export const createResult = async (result: Result): Promise<Result> => {
  const res = await API.post("/results", result);
  return res.data;
};

export const updateResult = async (
  id: number,
  result: Partial<Result>,
): Promise<Result> => {
  const res = await API.put(`/results/${id}`, result);
  return res.data;
};

export const deleteResult = async (id: number): Promise<void> => {
  await API.delete(`/results/${id}`);
};

// Helper: get next ID
export const getNextId = async (resource: string): Promise<number> => {
  const res = await API.get(`/${resource}`);
  const items = res.data;
  return items.length > 0
    ? Math.max(...items.map((i: { id: number }) => i.id)) + 1
    : 1;
};
