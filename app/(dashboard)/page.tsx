'use client';

import { Hero195 } from '@/components/ui/hero-195';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/ui/border-beam';
import { Terminal } from './terminal';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion/reveal';
import { ArrowRight, Code2, Sparkles, Layers, Shield, Zap, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Code2,
    title: "Modern Stack",
    description: "Next.js 15, React 19, TypeScript. Built on the latest stable releases with App Router.",
  },
  {
    icon: Sparkles,
    title: "Beautiful UI",
    description: "Tailwind CSS + shadcn/ui components. Fully customizable, accessible, and dark mode ready.",
  },
  {
    icon: Layers,
    title: "Database Ready",
    description: "PostgreSQL with Drizzle ORM. Migrations, seeding, and full type safety included.",
  },
  {
    icon: Shield,
    title: "Auth & Security",
    description: "JWT authentication, encrypted sessions, and role-based access controls out of the box.",
  },
  {
    icon: Zap,
    title: "Stripe Payments",
    description: "Complete subscription management with Stripe. Plans, billing, and webhooks handled.",
  },
  {
    icon: Database,
    title: "API Routes",
    description: "RESTful API endpoints with validation. Ready for your frontend or mobile apps.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <Hero195 />

      {/* Terminal Demo Section */}
      <section className="py-24 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Code2 className="w-4 h-4" />
              Get Started in Minutes
            </span>
            <h2 className="heading-editorial text-3xl sm:text-4xl text-foreground">
              Clone, Install, Deploy
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to launch is just a few commands away.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="max-w-2xl mx-auto">
              <div className="group relative rounded-2xl overflow-hidden shadow-2xl">
                <BorderBeam
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  size={200}
                  duration={8}
                  colorFrom="hsl(var(--primary))"
                  colorTo="hsl(var(--primary) / 0.2)"
                />
                <Terminal />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Everything You Need
            </span>
            <h2 className="heading-editorial text-3xl sm:text-4xl lg:text-5xl text-foreground">
              Built for Serious Builders
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop wrestling with boilerplate. Start delivering value to your customers.
            </p>
          </Reveal>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group relative h-full"
                >
                  <div className="relative h-full p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-all duration-300">
                    <BorderBeam
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      size={80}
                      duration={6}
                      colorFrom="hsl(var(--primary))"
                      colorTo="hsl(var(--primary) / 0.3)"
                    />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 glow-primary" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal direction="up" distance={30}>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="heading-editorial text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6">
                Ready to Ship Your SaaS?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                Join thousands of developers who skip the setup and jump straight 
                to building what matters. Your next SaaS starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/sign-up">
                  <Button size="lg" className="rounded-full px-8 h-12 text-base">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a
                  href="https://github.com/nextjs/saas-starter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 h-12 text-base"
                  >
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
