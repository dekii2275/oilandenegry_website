import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default function HomePage() {
  // Redirect to login page by default
  redirect(ROUTES.LOGIN)
  return null
}