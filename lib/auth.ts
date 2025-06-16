"use server"

export async function verifyLogin(username: string, password: string) {
  // These would be your actual credentials stored in environment variables
  const validUsername = process.env.ADMIN_USERNAME || "shravya"
  const validPassword = process.env.ADMIN_PASSWORD || "myperiod123"

  if (username.toLowerCase() === validUsername.toLowerCase() && password === validPassword) {
    return { success: true, message: "Welcome to your Period Palace! 👑" }
  }

  return { success: false, message: "Invalid credentials. Try again! 🔐" }
}
