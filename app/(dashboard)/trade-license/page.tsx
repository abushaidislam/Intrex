'use client';

import { FileText, Calendar, Building2, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/header';

const features = [
  {
    icon: Calendar,
    title: 'Renewal Tracking',
    description: 'Track all trade license renewal dates with automated reminders. Stay ahead of deadlines with 30, 15, and 7-day alerts.',
  },
  {
    icon: Building2,
    title: 'Multi-Location Management',
    description: 'Manage trade licenses across multiple business locations, branches, and jurisdictions from a single platform.',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Store and organize all license documents, permits, and certificates securely with easy access and retrieval.',
  },
  {
    icon: Bell,
    title: 'Compliance Alerts',
    description: 'Get instant notifications for upcoming renewals, expiring licenses, and regulatory changes affecting your business.',
  },
];

export default function TradeLicensePage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium mb-6">
                <FileText className="w-4 h-4" />
                Trade License Compliance
              </div>
            </Reveal>
            
            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
                Never Miss a Trade License Renewal Again
              </h1>
            </Reveal>
            
            <Reveal delay={0.2}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
                Automated trade license tracking and compliance management for businesses of all sizes. 
                Monitor renewal deadlines, manage multiple locations, and stay compliant effortlessly.
              </p>
            </Reveal>
            
            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8 bg-orange-600 hover:bg-orange-700">
                  <Link href="/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link href="/docs/features/obligations">
                    View Documentation
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Complete Trade License Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage trade licenses, permits, and regulatory compliance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose Intrex for Trade License Compliance?
              </h2>
              <div className="space-y-4">
                {[
                  'Automated renewal reminders prevent lapses',
                  'Centralized document storage',
                  'Multi-branch license management',
                  'Regulatory deadline tracking',
                  'Compliance reporting and analytics',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-8">
              <blockquote className="text-lg text-foreground italic">
                &ldquo;Intrex has transformed how we manage trade licenses across our 15 locations. 
                No more missed renewals or compliance headaches.&rdquo;
              </blockquote>
              <p className="mt-4 text-sm text-muted-foreground">
                — Operations Director, Multi-location Retail Chain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simplify Your Trade License Compliance Today
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join hundreds of businesses that trust Intrex for trade license management.
              Get started with a free 14-day trial.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
