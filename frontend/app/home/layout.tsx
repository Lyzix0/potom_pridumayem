import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Allow bypassing token verification in development/test environments
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" || process.env.NODE_ENV === "development";

  if (!bypassAuth) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")

    if (!token) {
      redirect("/auth/login")
    }
  }

  return children
}
