'use client';

import { Flame, Shield, Calendar, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/header';

const features = [
  {
    icon: Shield,
    title: 'Certificate Tracking',
    description: 'Track fire safety certificates, NFPA inspections, and fire extinguisher certifications with automated renewal alerts.',
  },
  {
    icon: Calendar,
    title: 'Inspection Scheduling',
    description: 'Schedule and track fire safety inspections, audits, and maintenance checks. Never miss a required inspection.',
  },
  {
    icon: Bell,
    title: 'Compliance Alerts',
    description: 'Get instant notifications for upcoming inspections, expiring certifications, and regulatory compliance deadlines.',
  },
  {
    icon: CheckCircle,
    title: 'Audit Readiness',
    description: 'Maintain complete documentation for fire safety audits. Generate compliance reports instantly.',
  },
];

export default function FireSafetyPage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-sm font-medium mb-6">
                <Flame className="w-4 h-4" />
                Fire Safety Compliance
              </div>
            </Reveal>
            
            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
                Stay Compliant with Fire Safety Regulations
              </h1>
            </Reveal>
            
            <Reveal delay={0.2}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
                Automated fire safety certificate tracking and compliance management. 
                Monitor NFPA inspections, fire extinguisher certifications, and safety audits with ease.
              </p>
            </Reveal>
            
            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8 bg-red-600 hover:bg-red-700">
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
              Complete Fire Safety Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to maintain fire safety compliance across your facilities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-red-600" />
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

      {/* Compliance Types Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Track All Fire Safety Requirements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tracking for all fire safety certificates and inspections
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Fire Alarm System Certification',
              'Sprinkler System Inspections',
              'Fire Extinguisher Maintenance',
              'Emergency Lighting Tests',
              'Fire Door Inspections',
              'NFPA Compliance Audits',
              'Fire Drill Documentation',
              'Fire Marshal Reports',
              'Building Evacuation Plans',
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border"
              >
                <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ensure Fire Safety Compliance Today
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Protect your business and occupants with automated fire safety compliance tracking.
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
