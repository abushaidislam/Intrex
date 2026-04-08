'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-2xl opacity-50" />
      
      {/* Browser Frame */}
      <div className="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background px-4 py-1 rounded-md text-xs text-muted-foreground border border-border flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
              app.saaskit.com/dashboard
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Dashboard Content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-16 lg:w-56 border-r border-border bg-muted/30 p-3 hidden sm:block">
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden lg:block text-sm font-medium">Dashboard</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <Users className="w-4 h-4" />
                <span className="hidden lg:block text-sm">Customers</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <CreditCard className="w-4 h-4" />
                <span className="hidden lg:block text-sm">Billing</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden lg:block text-sm">Analytics</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-6 min-h-[400px]">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <div className="pl-9 pr-4 py-2 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground w-48 lg:w-64">
                  Search...
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <div className="relative">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    3
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-3 border-l border-border">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-medium">
                    JD
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Revenue', value: '$45,231', change: '+20.1%', up: true },
                { label: 'Active Users', value: '2,350', change: '+180', up: true },
                { label: 'Sales', value: '+12,234', change: '+19%', up: true },
                { label: 'Active Now', value: '+573', change: '+201', up: true },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className={`flex items-center gap-1 text-xs ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change} from last month
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Overview</h3>
                  <div className="flex gap-2">
                    {['1H', '24H', '7D', '30D'].map((period, i) => (
                      <button
                        key={period}
                        className={`px-2 py-1 text-xs rounded ${i === 3 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-40 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t-sm relative group"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-300" style={{ height: '0%' }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { name: 'New subscription', time: '2 min ago', amount: '+$29' },
                    { name: 'Payment processed', time: '1 hour ago', amount: '+$99' },
                    { name: 'New user signup', time: '3 hours ago', amount: '' },
                    { name: 'Invoice generated', time: '5 hours ago', amount: '+$199' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                      {item.amount && (
                        <span className="text-sm font-medium text-green-500">{item.amount}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
