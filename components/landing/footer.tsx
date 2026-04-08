'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '#changelog' },
    { label: 'Roadmap', href: '#roadmap' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '#careers' },
    { label: 'Contact', href: '#contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '#docs' },
    { label: 'API Reference', href: '#api' },
    { label: 'Guides', href: '#guides' },
    { label: 'Support', href: '#support' },
  ],
  Legal: [
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
    { label: 'Security', href: '#security' },
    { label: 'Cookies', href: '#cookies' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center bg-black rounded-lg px-3 py-2 mb-4 w-fit">
              <Image
                src="/logo.svg"
                alt="Ontrex"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              The complete starter kit for building modern SaaS applications with Next.js.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ontrex. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
