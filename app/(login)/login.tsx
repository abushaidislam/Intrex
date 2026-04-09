'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useActionState, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft, Mail, Lock, Shield, ArrowRight, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prevState, formData) => {
      const result = await (mode === 'signin' ? signIn : signUp)(prevState, formData) as ActionState;

      // If server returns requiresVerification, show verification UI
      if (result?.requiresVerification) {
        setShowVerification(true);
        setEmail(formData.get('email') as string);
        setPassword(formData.get('password') as string);
      }

      return result;
    },
    { error: '' }
  );

  // Sync showVerification with server state (for page reloads)
  useEffect(() => {
    if (state?.requiresVerification) {
      setShowVerification(true);
      if (state?.email) setEmail(state.email);
      if (state?.password) setPassword(state.password);
    }
  }, [state]);

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-background">
      {/* Left Side - Branding & Animation */}
      <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        
        {/* Logo */}
        <div className="z-10 flex items-center gap-3">
          <div className="bg-black rounded-xl px-4 py-3">
            <Image
              src="/logo.svg"
              alt="Ontrex"
              width={120}
              height={40}
              className="h-8 w-auto brightness-0 invert"
            />
          </div>
        </div>

        {/* Testimonial */}
        <div className="z-10 mt-auto">
          <blockquote className="space-y-3">
            <p className="text-xl text-foreground leading-relaxed">
              &ldquo;Ontrex has streamlined our compliance workflow, saving us countless hours and ensuring we never miss critical deadlines.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold text-muted-foreground">
              ~ Compliance Team Lead
            </footer>
          </blockquote>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        {/* Background Gradients */}
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-[320px] w-[140px] -translate-y-[87.5%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-[320px] w-[60px] [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-[320px] w-[60px] -translate-y-[87.5%] rounded-full" />
        </div>

        {/* Back Button */}
        <Button variant="ghost" className="absolute top-7 left-5 w-fit" asChild>
          <Link href="/">
            <ChevronLeft className="size-4 mr-2" />
            Home
          </Link>
        </Button>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm space-y-6"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="bg-black rounded-xl px-3 py-2">
              <Image
                src="/logo.svg"
                alt="Ontrex"
                width={100}
                height={32}
                className="h-6 w-auto brightness-0 invert"
              />
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'signin'
                ? 'Enter your credentials to access your account'
                : 'Start your compliance journey with us'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email || state.email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={showVerification}
                  required
                  maxLength={50}
                  placeholder="name@company.com"
                  className="h-11 pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
            </div>

            {/* Password Field */}
            <div className={`space-y-2 ${showVerification ? 'hidden' : ''}`}>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password || state.password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!showVerification}
                  minLength={8}
                  maxLength={100}
                  placeholder="Enter your password"
                  className="h-11 pl-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
            </div>

            {/* Hidden fields to maintain values during verification */}
            {showVerification && (
              <>
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="password" value={password} />
              </>
            )}

            {/* Verification Code Field - Only shown when verification is required */}
            {showVerification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label htmlFor="verificationCode" className="text-sm font-medium">
                  Verification Code
                </Label>
                <div className="relative">
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    className="h-11 pl-10 text-center text-lg tracking-widest"
                    autoFocus
                    required={showVerification}
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  We sent a 6-digit code to your email. Check your inbox.
                </p>
              </motion.div>
            )}

            {/* Success Message */}
            {state?.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700"
              >
                {state.message}
              </motion.div>
            )}

            {/* Error Message */}
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-11"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </>
              ) : showVerification ? (
                <>
                  {mode === 'signin' ? 'Verify & Sign in' : 'Verify & Create account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : mode === 'signin' ? (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Back Button - Only shown during verification */}
            {showVerification && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setShowVerification(false);
                  setEmail('');
                  setPassword('');
                }}
              >
                <ChevronLeft className="size-4 mr-1" />
                Back to sign in
              </Button>
            )}
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground text-xs">
                {mode === 'signin' ? 'New to Ontrex?' : 'Already have an account?'}
              </span>
            </div>
          </div>

          {/* Secondary Action */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-11"
            asChild
          >
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirect ? `?redirect=${redirect}` : ''
              }${priceId ? `&priceId=${priceId}` : ''}`}
            >
              {mode === 'signin'
                ? 'Create an account'
                : 'Sign in to existing account'}
            </Link>
          </Button>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline font-medium">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

// Animated Background Component
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-foreground/20"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + (path.id % 10),
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
