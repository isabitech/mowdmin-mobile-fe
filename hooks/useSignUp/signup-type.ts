export interface SignupResponse {
  success: boolean
  message: string
  data: SignupResponseData
}

export interface SignupResponseData {
  user: User
  token: string
  message: string
}

export interface User {
  id: string
  email: string
  language: string
  name: string
  emailVerified: boolean
  updatedAt: string
  createdAt: string
  emailVerifiedAt: any
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}