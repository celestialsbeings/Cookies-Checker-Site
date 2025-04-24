import React from 'react';
import {
  Bot,
  Github,
  ExternalLink,
  Cookie,
  FileJson,
  Users,
  Command,
  CreditCard,
  ChevronRight,
  MessageCircle,
  Wallet,
  CreditCard as PaymentIcon,
  DollarSign,
  Key,
  Send,
  Shield,
  Zap,
  Clock,
  Gamepad,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FAQ from '../components/FAQ';
import Testimonials from '../components/Testimonials';
import { VisitorCounter } from '../components/VisitorCounter';
import { SoundToggle } from '../components/SoundToggle';

const features = [
  {
    icon: <Cookie className="w-8 h-8" />,
    title: 'Cookie Validation',
    description: 'Advanced cookie validation with support for multiple platforms and formats.',
  },
  {
    icon: <FileJson className="w-8 h-8" />,
    title: 'Multiple Formats',
    description: 'Support for various cookie formats and file types.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'User Management',
    description: 'Easy subscription management and user tracking.',
  },
  {
    icon: <Command className="w-8 h-8" />,
    title: 'Simple Commands',
    description: 'Intuitive command system for effortless operation.',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Secure Processing',
    description: 'End-to-end encryption for maximum data security.',
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Fast Response',
    description: 'Lightning-fast validation with minimal latency.',
  },
];

const subscriptionPlans = [
  {
    duration: '7 Days',
    usdt: '1.74',
    ltc: '0.014',
    popular: false,
    badge: 'Starter',
    theme: 'pink',
    effect: 'sparkle',
    aura: 'sparkles'
  },
  {
    duration: '1 Month',
    usdt: '6.97',
    ltc: '0.055',
    popular: true,
    badge: 'Most Popular',
    theme: 'purple',
    effect: 'glow',
    aura: 'cosmic'
  },
  {
    duration: '6 Months',
    usdt: '41.86',
    ltc: '0.33',
    popular: false,
    badge: 'Pro Choice',
    theme: 'blue',
    effect: 'pulse',
    aura: 'electric'
  },
  {
    duration: '1 Year',
    usdt: '83.72',
    ltc: '0.65',
    popular: false,
    badge: 'Legendary',
    theme: 'orange',
    effect: 'fire',
    aura: 'inferno'
  }
];

const purchaseSteps = [
  {
    icon: <Bot className="w-6 h-6 text-purple-400" />,
    title: 'Start the Bot',
    description: 'Visit @cookies_checkerbot on Telegram and type /start to begin.',
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: 'Join Required Channel',
    description: 'Follow the bot\'s instructions to join the necessary channel.',
  },
  {
    icon: <CreditCard className="w-6 h-6 text-purple-400" />,
    title: 'Choose Plan & Payment',
    description: 'Select your subscription plan and preferred payment method (LTC, USDT, or UPI).',
  },
  {
    icon: <Send className="w-6 h-6 text-purple-400" />,
    title: 'Complete Payment',
    description: 'Follow the payment instructions provided by the bot.',
  },
  {
    icon: <Key className="w-6 h-6 text-purple-400" />,
    title: 'Activate Subscription',
    description: 'Use the /claim command with your subscription key to activate your plan.',
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* Hero Section */}
      <header id="home" className="min-h-screen flex items-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#7B4ED8]/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#3DEFE9]/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9C5FE9]/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="container mx-auto px-4 py-20 text-center relative">
          {/* Animated Bot Icon */}
          <div className="relative inline-block mb-8 animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7B4ED8] to-[#3DEFE9] rounded-full filter blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-[#0A0A0A]/80 p-4 rounded-full backdrop-blur-sm border border-[#7B4ED8]/30">
              <Bot className="w-16 h-16 text-[#9C5FE9]" />
            </div>
          </div>

          {/* Title with gradient and animation */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#7B4ED8] via-[#3DEFE9] to-[#9C5FE9] animate-gradient leading-tight animate-fade-in">
            Revolutionize Your Cookie Validation
          </h1>

          {/* Subtitle with better contrast */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 animate-slide-up delay-200">
            Your ultimate tool for seamless cookie validation across multiple platforms
          </p>

          {/* CTA Buttons with modern design */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 sm:mb-16 px-4 sm:px-0">
            <a
              href="https://t.me/cookies_checkerbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold
                bg-gradient-to-r from-[#7B4ED8] to-[#3DEFE9] hover:from-[#9C5FE9] hover:to-[#3DEFE9]
                text-[#0A0A0A] transform hover:scale-105 transition-all duration-300
                shadow-lg shadow-[#7B4ED8]/25 text-sm sm:text-base w-full sm:w-auto animate-slide-in-right delay-300"
            >
              Use the Bot <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </a>
            <a
              href="https://t.me/cookies_checker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold
                bg-[#0A0A0A]/80 hover:bg-[#0A0A0A]/90 backdrop-blur
                text-gray-100 border border-[#3DEFE9]/50 hover:border-[#3DEFE9]
                transform hover:scale-105 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto animate-slide-in-left delay-300"
            >
              Subscribe Channel <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </a>
          </div>

          {/* Game Card with enhanced design */}
          <div className="max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 px-4 sm:px-0 animate-bounce-in delay-500">
            <div className="relative group">
              {/* Card glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#7B4ED8] to-[#3DEFE9] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>

              <div className="relative p-4 sm:p-6 rounded-2xl bg-[#0A0A0A]/80 backdrop-blur border border-[#7B4ED8]/30 group-hover:border-[#9C5FE9]/50 transition-all duration-300">
                <div className="p-2 sm:p-3 bg-[#3DEFE9]/10 rounded-xl inline-block mb-3 sm:mb-4 group-hover:bg-[#3DEFE9]/20 transition-all duration-300 animate-pulse-subtle">
                  <Gamepad className="w-8 h-8 sm:w-10 sm:h-10 text-[#3DEFE9]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white group-hover:text-[#3DEFE9] transition-colors duration-300">Cookie Catcher Game</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4">
                  Test your skills in our fun cookie-catching mini-game!
                </p>
                <Link to="/game"
                  className="inline-flex items-center justify-center w-full px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                    bg-gradient-to-r from-[#7B4ED8] to-[#3DEFE9] hover:from-[#9C5FE9] hover:to-[#3DEFE9]
                    text-[#0A0A0A] transform hover:scale-105 transition-all duration-300
                    shadow-lg shadow-[#7B4ED8]/25">
                  Play Now <Gamepad className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#C084FC]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-40 left-20 w-96 h-96 bg-[#00FFFF]/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          {/* Section Title */}
          <div className="text-center mb-10 sm:mb-16 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#C084FC] via-[#00FFFF] to-[#C084FC] bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need for efficient cookie validation and management
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Card glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C084FC] to-[#00FFFF] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>

                <div className="relative p-5 sm:p-8 rounded-2xl bg-[#0A0A0A]/80 backdrop-blur border border-[#C084FC]/30 hover:border-[#C084FC]/50 transition-all duration-300">
                  {/* Icon with background */}
                  <div className="inline-flex p-2 sm:p-3 rounded-xl bg-[#00FFFF]/10 group-hover:bg-[#00FFFF]/20 transition-colors mb-4 sm:mb-6">
                    <div className="text-[#00FFFF] group-hover:text-[#00FFFF] transition-colors">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white group-hover:text-[#C084FC] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C084FC]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00FFFF]/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#C084FC] to-[#00FFFF] bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Select the perfect plan for your needs with our flexible pricing options
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-0">
            {subscriptionPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative group transition-all duration-300 hover:scale-105
                  ${plan.popular ? 'transform scale-105 z-10' : ''}
                  rounded-2xl overflow-visible`}
              >
                {/* Aura Effects */}
                <div className={`absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  ${plan.aura === 'inferno' ? 'animate-aura-inferno bg-gradient-to-t from-orange-500/20 via-red-500/30 to-yellow-500/20' : ''}
                  ${plan.aura === 'electric' ? 'animate-aura-electric bg-gradient-to-t from-blue-500/20 via-cyan-500/30 to-blue-500/20' : ''}
                  ${plan.aura === 'cosmic' ? 'animate-aura-cosmic bg-gradient-to-t from-purple-500/20 via-blue-500/30 to-purple-500/20' : ''}
                  ${plan.aura === 'sparkles' ? 'animate-aura-sparkles bg-gradient-to-t from-pink-500/20 via-rose-500/30 to-pink-500/20' : ''}
                  blur-xl`}
                ></div>

                {/* Flame Animation for Legendary Plan */}
                {plan.theme === 'orange' && (
                  <div className="absolute -inset-4 pointer-events-none">
                    {/* Base Flame Layer */}
                    <div className="absolute inset-0 animate-flame-base">
                      <div className="absolute bottom-0 left-0 right-0 h-full
                        bg-gradient-to-t from-orange-500 via-red-500 to-yellow-500
                        opacity-30 blur-xl">
                      </div>
                    </div>

                    {/* Core Flames */}
                    <div className="absolute inset-x-0 bottom-0 h-full">
                      <div className="relative h-full w-full">
                        {/* Center Flame */}
                        <div className="flame-particle absolute bottom-0 left-1/2 -translate-x-1/2
                          w-16 h-24 animate-flame-particle-main opacity-80">
                        </div>

                        {/* Side Flames */}
                        <div className="flame-particle absolute bottom-0 left-[40%]
                          w-12 h-20 animate-flame-particle-left opacity-80">
                        </div>
                        <div className="flame-particle absolute bottom-0 left-[60%]
                          w-12 h-20 animate-flame-particle-right opacity-80">
                        </div>
                      </div>
                    </div>

                    {/* Small Flames */}
                    <div className="absolute inset-0">
                      {[...Array(6)].map((_, i) => (
                        <div key={i}
                          className={`flame-particle absolute bottom-0
                            w-4 h-8 animate-flame-small-${i + 1} opacity-80`}
                          style={{
                            left: `${20 + i * 12}%`,
                            animationDelay: `${-i * 0.2}s`
                          }}>
                        </div>
                      ))}
                    </div>

                    {/* Sparks */}
                    <div className="absolute inset-0">
                      {[...Array(8)].map((_, i) => (
                        <div key={i}
                          className="spark absolute w-1 h-1 rounded-full bg-yellow-300 opacity-80"
                          style={{
                            left: `${20 + i * 8}%`,
                            bottom: '20%',
                            animation: `spark ${1.5 + Math.random()}s ease-out infinite`,
                            animationDelay: `${-i * 0.2}s`
                          }}>
                        </div>
                      ))}
                    </div>

                    {/* Glow Effects */}
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-orange-500/10 blur-2xl animate-flame-glow-slow"></div>
                      <div className="absolute inset-0 bg-yellow-500/5 blur-3xl animate-flame-glow-fast"></div>
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className={`relative p-6 rounded-2xl
                  ${plan.theme === 'orange'
                    ? 'bg-[#0A0A0A]/80 border border-[#C084FC]/30'
                    : 'bg-[#0A0A0A]/80 border border-gray-700 hover:border-[#00FFFF]/50'}
                  transition-all duration-300
                  ${plan.effect === 'fire' ? 'shadow-lg shadow-[#C084FC]/20' : ''}
                  ${plan.effect === 'pulse' ? 'animate-border-pulse' : ''}
                  ${plan.effect === 'glow' ? 'animate-border-glow' : ''}
                  ${plan.effect === 'sparkle' ? 'animate-border-sparkle' : ''}`}
                >
                  {/* Badge */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 mb-8
                    ${plan.theme === 'purple' ? 'bg-[#C084FC] border-[#C084FC]/70' : ''}
                    ${plan.theme === 'blue' ? 'bg-[#00FFFF] border-[#00FFFF]/70 text-[#0A0A0A]' : ''}
                    ${plan.theme === 'orange' ? 'bg-gradient-to-r from-[#C084FC] via-[#00FFFF] to-[#C084FC] shadow-lg shadow-[#C084FC]/30' : ''}
                    ${plan.theme === 'pink' ? 'bg-gradient-to-r from-[#00FFFF] via-[#C084FC] to-[#00FFFF] text-[#0A0A0A]' : ''}
                    rounded-full z-20 border shadow-lg`}
                  >
                    <div className="flex items-center gap-2">
                      {plan.theme === 'orange' ? (
                        <>
                          <span className="text-orange-300">🔥</span>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {plan.badge}
                          </span>
                          <span className="text-orange-300">🔥</span>
                        </>
                      ) : plan.theme === 'blue' ? (
                        <>
                          <span className="text-blue-300">⚡</span>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {plan.badge}
                          </span>
                          <span className="text-blue-300">⚡</span>
                        </>
                      ) : plan.theme === 'pink' ? (
                        <>
                          <span className="text-pink-300">✨</span>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {plan.badge}
                          </span>
                          <span className="text-pink-300">✨</span>
                        </>
                      ) : (
                        <>
                          <span className="text-yellow-300">★</span>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {plan.badge}
                          </span>
                          <span className="text-yellow-300">★</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Duration with special effects */}
                  <div className="relative mt-6">
                    <h3 className={`text-2xl font-bold text-center mb-6
                      ${plan.theme === 'orange' ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 animate-text-fire' : ''}
                      ${plan.theme === 'blue' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 animate-text-pulse' : ''}
                      ${plan.theme === 'pink' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 animate-text-sparkle' : ''}
                      ${plan.theme === 'purple' ? 'text-white' : ''}
                    `}>
                      {plan.duration}
                    </h3>
                  </div>

                  {/* Prices */}
                  <div className="space-y-4 mb-6">
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800/95 border
                      ${plan.theme === 'purple' ? 'border-purple-500/30' : ''}
                      ${plan.theme === 'blue' ? 'border-blue-500/30' : ''}
                      ${plan.theme === 'orange' ? 'border-orange-500/30' : ''}
                      ${plan.theme === 'pink' ? 'border-pink-500/30' : ''}`}
                    >
                      <DollarSign className={`w-6 h-6
                        ${plan.theme === 'purple' ? 'text-purple-400' : ''}
                        ${plan.theme === 'blue' ? 'text-blue-400' : ''}
                        ${plan.theme === 'orange' ? 'text-orange-400' : ''}
                        ${plan.theme === 'pink' ? 'text-pink-400' : ''}`}
                      />
                      <span className="text-2xl font-bold text-white">{plan.usdt} USDT</span>
                    </div>
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800/95 border
                      ${plan.theme === 'purple' ? 'border-purple-500/30' : ''}
                      ${plan.theme === 'blue' ? 'border-blue-500/30' : ''}
                      ${plan.theme === 'orange' ? 'border-orange-500/30' : ''}
                      ${plan.theme === 'pink' ? 'border-pink-500/30' : ''}`}
                    >
                      <Wallet className={`w-6 h-6
                        ${plan.theme === 'purple' ? 'text-purple-400' : ''}
                        ${plan.theme === 'blue' ? 'text-blue-400' : ''}
                        ${plan.theme === 'orange' ? 'text-orange-400' : ''}
                        ${plan.theme === 'pink' ? 'text-pink-400' : ''}`}
                      />
                      <span className="text-2xl font-bold text-white">{plan.ltc} LTC</span>
                    </div>
                  </div>

                  {/* Choose Plan Button */}
                  <a
                    href="https://t.me/cookies_checkerbot?start=purchase"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-center inline-flex items-center justify-center gap-2
                      transition-all duration-300 hover:scale-105
                      ${plan.theme === 'purple'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                        : plan.theme === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                        : plan.theme === 'pink'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
                        : 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 hover:from-orange-600 hover:via-red-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20'}`}
                  >
                    Choose Plan
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Purchase Section */}
      <section id="how-to-purchase" className="py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-40 left-20 w-96 h-96 bg-[#C084FC]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#00FFFF]/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          {/* Section Title */}
          <div className="text-center mb-10 sm:mb-16 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#C084FC] via-[#00FFFF] to-[#C084FC] bg-clip-text text-transparent">
              How to Purchase
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Follow these simple steps to get started with our service
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#C084FC] via-[#00FFFF] to-[#C084FC] hidden md:block"></div>

              {/* Steps */}
              <div className="space-y-8">
                {purchaseSteps.map((step, index) => (
                  <div key={index} className="group relative">
                    {/* Card glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C084FC] to-[#00FFFF] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>

                    <div className="relative flex items-start gap-3 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-[#0A0A0A]/80 border border-[#C084FC]/30 hover:border-[#00FFFF]/50 transition-all duration-300">
                      {/* Step Number with Icon */}
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#C084FC] to-[#00FFFF] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                        <div className="relative p-2 sm:p-3 rounded-xl bg-[#0A0A0A]/80 border border-[#00FFFF]/30 group-hover:border-[#00FFFF]/50 transition-all">
                          <div className="text-[#00FFFF] w-5 h-5 sm:w-6 sm:h-6">{step.icon}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-white group-hover:text-[#C084FC] transition-colors flex items-center gap-2">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#C084FC]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-[#00FFFF]/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <h2 className="section-title">What Our Users Say</h2>
          <Testimonials />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C084FC]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00FFFF]/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#C084FC] to-[#00FFFF] bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about our service
            </p>
          </div>
          <div className="max-w-3xl mx-auto bg-[#0A0A0A]/80 p-4 sm:p-6 rounded-2xl border border-[#C084FC]/30 mx-4 sm:mx-auto">
            <FAQ />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#C084FC]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-40 left-20 w-96 h-96 bg-[#00FFFF]/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          {/* Section Title */}
          <div className="text-center mb-10 sm:mb-16 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#C084FC] via-[#00FFFF] to-[#C084FC] bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Have questions? We're here to help you 24/7
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-0">
            {/* Support Card */}
            <div className="group relative">
              {/* Card glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C084FC] to-[#00FFFF] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>

              <div className="relative p-5 sm:p-8 rounded-2xl bg-[#0A0A0A]/80 backdrop-blur border border-[#C084FC]/30 hover:border-[#C084FC]/50 transition-all duration-300">
                <div className="p-2 sm:p-3 rounded-xl bg-[#C084FC]/10 inline-block mb-4 sm:mb-6 group-hover:bg-[#C084FC]/20 transition-all duration-300">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#C084FC]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-[#C084FC] transition-colors duration-300">Support</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                  Need help? Our support team is available 24/7 to assist you with any questions.
                </p>
                <a
                  href="https://t.me/xelestialsupporttreambot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                    bg-gradient-to-r from-[#C084FC] to-[#00FFFF] hover:from-[#B065EB] hover:to-[#00E5E5]
                    text-[#0A0A0A] transform hover:scale-105 transition-all duration-300 shadow-lg shadow-[#C084FC]/25">
                  Contact Support
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </a>
              </div>
            </div>

            {/* Community Card */}
            <div className="group relative">
              {/* Card glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFFF] to-[#C084FC] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>

              <div className="relative p-5 sm:p-8 rounded-2xl bg-[#0A0A0A]/80 backdrop-blur border border-[#00FFFF]/30 hover:border-[#00FFFF]/50 transition-all duration-300">
                <div className="p-2 sm:p-3 rounded-xl bg-[#00FFFF]/10 inline-block mb-4 sm:mb-6 group-hover:bg-[#00FFFF]/20 transition-all duration-300">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#00FFFF]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-[#00FFFF] transition-colors duration-300">Community</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                  Join our Telegram community to stay updated and connect with other users.
                </p>
                <a
                  href="https://t.me/cookies_checker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                    bg-[#0A0A0A]/80 hover:bg-[#0A0A0A]/90 text-[#00FFFF] border border-[#00FFFF]/50 hover:border-[#00FFFF]
                    transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                  Join Community
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Visitor Counter */}
      <footer className="bg-[#0A0A0A] border-t border-[#C084FC]/20 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center mb-6 sm:mb-8 text-center md:text-left">
            <div className="text-gray-400 text-sm sm:text-base order-3 md:order-1">
              &copy; {new Date().getFullYear()} Celestial Cookie Checker Bot. All rights reserved.
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <VisitorCounter />
            </div>
            <div className="flex items-center justify-center md:justify-end gap-4 order-2 md:order-3">
              <SoundToggle />
              <a
                href="https://github.com/celestialsbeings/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#C084FC] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/xelestialsupporttreambot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#00FFFF] transition-colors"
              >
                <Bot className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

export { HomePage }