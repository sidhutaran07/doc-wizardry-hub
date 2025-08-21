import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/auth/UserProfile'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { AuthForm } from '@/components/auth/AuthForm'
import { FileText } from 'lucide-react'

export const Navbar = () => {
  const { user, loading } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="font-bold text-lg">PDF Wizardry Hub</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <UserProfile user={user} />
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Sign In</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <AuthForm />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}