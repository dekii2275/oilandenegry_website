export interface RegisterPayload {
  email: string
  username: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    fullName?: string
  }
}

