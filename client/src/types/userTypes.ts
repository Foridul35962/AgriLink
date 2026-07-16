export interface regitrationType {
    name: string
    email: string
    phoneNumber: string
    password: string
    role: "farmer" | "aratdar" | "retailer"
    district: string
}

export interface verifyInfoType {
    email: string
    otp: string
}

export interface loginType {
    email: string
    password: string
}

export interface resendOtpTyp {
    email: string
    topic: "forgetPass" | "registration"
}

export interface userType {
    name: string
    email: string
    phoneNumber: string
    role: "farmer" | "aratdar" | "retailer" | "admin"
    district: string
}