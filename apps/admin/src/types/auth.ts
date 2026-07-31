export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: "OWNER" | "MANAGER" | "RECEPTIONIST";
  };
}