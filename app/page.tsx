import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-float delay-500" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-2xl animate-float delay-300" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <div className="animate-fade-in-down">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                Project Management Made Simple
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 animate-fade-in-up tracking-tight">
              Manage Projects
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Like a Pro
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              Planify helps teams collaborate, track progress, and deliver projects 
              on time with an intuitive and powerful project management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 animate-fade-in-up delay-600">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-20 animate-pulse-glow" />
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 overflow-hidden">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-md" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="h-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-xs text-blue-500">Projects</div>
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">48</div>
                      <div className="text-xs text-purple-500">Tasks</div>
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">89%</div>
                      <div className="text-xs text-green-500">Complete</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['To Do', 'In Progress', 'Done'].map((col, i) => (
                    <div key={col} className="space-y-2">
                      <div className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        i === 0 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                        i === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>{col}</div>
                      {[1, 2].map(j => (
                        <div key={j} className="h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">Features</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              Everything you need to{' '}
              <span className="gradient-text">manage projects</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for modern teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
                title: 'Project Management',
                description: 'Create, organize, and manage projects with ease. Keep everything in one place with a beautiful Kanban board.',
                color: 'blue',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Task Tracking',
                description: 'Assign tasks, set priorities, track status, and never miss a deadline with smart notifications.',
                color: 'purple',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Team Collaboration',
                description: 'Add team members, assign roles, and collaborate seamlessly on projects in real-time.',
                color: 'green',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover-lift overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '100%', label: 'Free to Start', icon: '🚀' },
              { value: 'Unlimited', label: 'Projects & Tasks', icon: '📋' },
              { value: '24/7', label: 'Cloud Access', icon: '☁️' },
            ].map((stat) => (
              <div key={stat.label} className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 hover-lift">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg4di0yaDI4ek0zNiA2djJIMjRWNmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of teams already using Planify to manage their projects efficiently.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center space-x-2 px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            <span>Start Free Trial</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
