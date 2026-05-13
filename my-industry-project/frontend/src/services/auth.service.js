import API from "./api";

export const loginUser = async (data) => {
  const response = API.post("/auth/login", data);
  return (await response).data;
};

export const registerUser = async (data) => {
  const response = await API.post("/auth/signup", data);
  return response.data;
};
