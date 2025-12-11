import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export default async function MePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/me')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })

  if (!user) {
    redirect('/login?callbackUrl=/me')
  }

  redirect(`/users/${user.id}`)
}
