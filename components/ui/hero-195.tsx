import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { ArrowRight, Zap } from "lucide-react";

interface Hero195Props {
  className?: string;
}

const Hero195 = React.forwardRef<HTMLDivElement, Hero195Props>(
  ({ className }, ref) => {
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: "easeOut" as const,
        },
      },
    };

    return (
      <section
        ref={ref}
        className={cn(
          "relative min-h-screen flex items-center justify-center overflow-hidden py-24 lg:py-32",
          className
        )}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col items-center">
            {/* Hero Text Content - Centered */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  Production Ready
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="heading-editorial-lg text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground tracking-tight"
              >
                Ship Faster.
                <span className="block text-primary mt-2">Scale Smarter.</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              >
                Everything you need to launch enterprise-grade SaaS products.
                From auth to payments—production-ready in hours, not weeks.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button size="lg" className="rounded-full px-8 h-12 text-base">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base"
                >
                  View Documentation
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={itemVariants}
                className="mt-10 flex items-center gap-6 justify-center"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by <span className="font-semibold text-foreground">2,000+</span> developers
                </p>
              </motion.div>
            </div>

            {/* Dashboard Preview - Below Hero Text */}
            <motion.div
              variants={itemVariants}
              className="relative w-full max-w-5xl mt-8"
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </motion.div>
      </section>
    );
  }
);

Hero195.displayName = "Hero195";

export { Hero195 };
