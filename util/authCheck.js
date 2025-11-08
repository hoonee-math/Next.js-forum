import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export async function authCheck(redirectTo = '/api/auth/signin') {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(redirectTo)
  }

  return session
}
