import { login } from "@/service/authService";
import axios from "axios";

export const spawn = async () => {
  await login();

  const response = await axios.post("/api/v1/spawn");

  console.log(response);

  window.location.href = response.data?.redirectUrl;
};
