'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  Home, 
  Shield, 
  Users, 
  Building2, 
  ClipboardCheck, 
  Globe, 
  Bell, 
  Route,
  Zap,
  Database,
  Code2,
  Settings,
  ChevronRight,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  {
    title: 'Getting Started',
    items: [
      { href: '/docs', icon: Home, label: 'Introduction' },
      { href: '/docs/quickstart', icon: Zap, label: 'Quick Start' },
      { href: '/docs/installation', icon: Settings, label: 'Installation' },
    ],
  },
  {
    title: 'Core Features',
    items: [
      { href: '/docs/features/auth', icon: Shield, label: 'Authentication' },
      { href: '/docs/features/branches', icon: Building2, label: 'Branch Management' },
      { href: '/docs/features/obligations', icon: ClipboardCheck, label: 'Compliance Tracking' },
      { href: '/docs/features/ssl-monitoring', icon: Globe, label: 'SSL Monitoring' },
      { href: '/docs/features/notifications', icon: Bell, label: 'Notifications' },
      { href: '/docs/features/routing', icon: Route, label: 'Notification Routes' },
    ],
  },
  {
    title: 'Architecture',
    items: [
      { href: '/docs/architecture/overview', icon: Database, label: 'System Overview' },
      { href: '/docs/architecture/database', icon: Database, label: 'Database Schema' },
      { href: '/docs/architecture/api', icon: Code2, label: 'API Reference' },
      { href: '/docs/architecture/security', icon: Shield, label: 'Security' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { href: '/docs/guides/roles', icon: Users, label: 'User Roles' },
      { href: '/docs/guides/connectors', icon: Bell, label: 'Setting up Connectors' },
      { href: '/docs/guides/cron-jobs', icon: Zap, label: 'Cron Jobs' },
      { href: '/docs/guides/deployment', icon: Settings, label: 'Deployment' },
    ],
  },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-200 overflow-y-auto",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Intrex Docs</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-6">
            {sidebarNavItems.map((section) => (
              <div key={section.title}>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive 
                              ? 'bg-orange-50 text-orange-600 font-medium' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                          {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <Book className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Intrex Docs</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-4 h-4" />
              <span>Press Ctrl+K to search</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                Go to App
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:ml-72">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="prose prose-gray max-w-none">
            {children}
          </article>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                © 2026 Intrex. Built with Next.js and Tailwind CSS.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/docs" className="text-sm text-gray-500 hover:text-gray-900">
                  Documentation
                </Link>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
