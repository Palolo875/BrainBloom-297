import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { signOut } from '@/app/_actions/auth'
import { Button } from './ui/button'

export default async function AuthButton() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 hidden sm:block">
        Connecté en tant que {user.email}
      </span>
      <form action={signOut}>
        <Button variant="outline" size="sm">
          Déconnexion
        </Button>
      </form>
    </div>
  ) : (
    <Button asChild size="sm">
        <Link href="/login">
            Connexion
        </Link>
    </Button>
  )
}
