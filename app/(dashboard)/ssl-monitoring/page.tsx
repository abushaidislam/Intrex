'use client';

import { Shield, Globe, Clock, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/header';

const features = [
  {
    icon: Clock,
    title: 'Expiration Alerts',
    description: 'Get notified 30, 14, 7, and 1 day before SSL certificates expire. Never miss a renewal deadline.',
  },
  {
    icon: Globe,
    title: 'Multi-Domain Monitoring',
    description: 'Monitor SSL certificates across unlimited domains and subdomains from a single dashboard.',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description: 'Receive alerts via email, Slack, Telegram, or webhook when SSL issues are detected.',
  },
  {
    icon: CheckCircle,
    title: 'SSL Health Checks',
    description: 'Automated daily checks for certificate validity, chain issues, and configuration problems.',
  },
];

export default function SSLMonitoringPage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                SSL Certificate Monitoring
              </div>
            </Reveal>
            
            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
                Never Let Your SSL Certificate Expire Again
              </h1>
            </Reveal>
            
            <Reveal delay={0.2}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
                Automated SSL monitoring for all your domains. Get instant alerts before expiration, 
                track SSL health, and prevent website downtime due to certificate issues.
              </p>
            </Reveal>
            
            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link href="/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link href="/docs/features/ssl-monitoring">
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
              Complete SSL Monitoring Solution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to keep your SSL certificates valid and your websites secure
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Start Monitoring Your SSL Certificates Today
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join thousands of companies that trust Intrex for SSL certificate monitoring.
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
