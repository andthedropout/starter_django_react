/** Mirrors the Django `auth.User` fields exposed by the auth serializers. */
export interface User {
  id: number
  username: string
  email: string
}

export interface SessionResponse {
  user: User | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface SignupDetails {
  username: string
  email: string
  password: string
}
