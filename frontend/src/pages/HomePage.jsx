// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  MapPin, FileText, Users, BarChart3, Shield, Clock, CheckCircle, 
  ArrowRight, AlertTriangle, ClipboardList, MessageCircle, Settings 
} from "lucide-react";

import Card from "../components/Card";
import { motion } from "framer-motion";


const features = [
    {
      icon: <ClipboardList size={32} />,
      title: "Complaint Reporting",
      description:
        "Citizens can easily report municipal issues like garbage, roads, and water supply through a simple interface.",
    },
    {
      icon: <Users size={32} />,
      title: "Staff Assignment",
      description:
        "Admins can assign tasks to the right staff with filters by department, location, and priority.",
    },
    {
      icon: <MapPin size={32} />,
      title: "Real-Time Tracking",
      description:
        "Track the live status of complaints and tasks on an interactive city map with stage-wise progress updates.",
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Analytics Dashboard",
      description:
        "Gain deep insights with visual analytics — identify trends, bottlenecks, and service efficiency over time.",
    },
    {
      icon: <MessageCircle size={32} />,
      title: "Feedback & Ratings",
      description:
        "Citizens can share feedback and rate services, helping authorities improve response quality and speed.",
    },
    {
      icon: <Settings size={32} />,
      title: "Automation & Alerts",
      description:
        "Automated notifications and escalation alerts ensure no complaint is missed or delayed.",
    },
  ];


const processSteps = [
  {
    id: 1,
    title: "Submit Complaint",
    role: "Citizen Action",
    summary:
      "Citizens report issues through the platform using web, mobile, or QR codes.",
    bullets: [
      "Attach photos & short description",
      "Pin exact location or use GPS",
      "Select category (road, waste, lights, etc.)",
    ],
    icon: <AlertTriangle className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 2,
    title: "AI Processing",
    role: "System Action",
    summary:
      "AI categorizes, detects duplicates, and assigns priority for faster routing.",
    bullets: [
      "Smart classification",
      "Duplicate detection",
      "Urgency scoring for priority handling",
    ],
    icon: <BarChart3 className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 3,
    title: "Admin Review",
    role: "Admin Action",
    summary:
      "Admins verify and enrich reports, assign departments, and escalate if needed.",
    bullets: [
      "Photo and detail verification",
      "Add SLA targets or internal notes",
      "Reassign or escalate complaints",
    ],
    icon: <Shield className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 4,
    title: "Staff Assignment",
    role: "Staff Action",
    summary:
      "Nearest available staff is auto-notified based on location and workload.",
    bullets: [
      "Auto-assign jobs",
      "Push notifications or SMS alerts",
      "Optimized route guidance",
    ],
    icon: <Users className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 5,
    title: "Real-time Updates",
    role: "System Action",
    summary:
      "Citizens receive live status updates via app, email, or SMS during the process.",
    bullets: [
      "Time-stamped progress logs",
      "Two-way communication for clarifications",
      "Photo-based updates",
    ],
    icon: <Clock className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 6,
    title: "Resolution & Feedback",
    role: "Completion",
    summary:
      "Complaint closure verified by citizens with feedback for performance tracking.",
    bullets: [
      "Completion proof submitted",
      "Citizen verification or reopening",
      "Feedback analytics collected",
    ],
    icon: <CheckCircle className="w-5 h-5 text-indigo-400" />,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" },
  }),
};

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-black ">
      {/* HERO */}

      <header className="min-h-screen relative overflow-hidden bg-black">
        <div className="absolute left-[1230px] top-[10px] w-[223px] h-[223px] rounded-full bg-[#C623FF]/30 blur-3xl"></div>
        <div className="absolute left-[-42px] top-[417px] w-[223px] h-[223px] rounded-full bg-[#2D64FF]/30 blur-3xl"></div>

        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 20 }}
            className="absolute -left-40 -top-40 w-[540px] h-[540px] rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 opacity-40 blur-3xl"
          />
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 0.98, 1] }}
            transition={{ repeat: Infinity, duration: 24 }}
            className="absolute -right-56 -bottom-40 w-[640px] h-[640px] rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 opacity-30 blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                Municipal Issues
                <span className="block text-indigo-100">
                  Resolved with speed & clarity
                </span>
              </h1>
              <p className="text-lg text-indigo-100 max-w-2xl">
                ResolveHub modernizes civic reporting with location-aware
                submissions, AI triage, and transparent resolution flows —
                making municipal services faster and more accountable.
              </p>

              <div className="flex flex-wrap gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 text-indigo-700 font-semibold rounded-lg shadow-xl hover:-translate-y-1 transition-transform"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white/95 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link
                    to={
                      user?.role === "admin"
                        ? "/admin"
                        : user?.role === "staff"
                        ? "/staff"
                        : "/dashboard"
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 text-indigo-700 font-semibold rounded-lg shadow-xl hover:-translate-y-1 transition-transform"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { number: "24/7", label: "Service" },
                    { number: "3", label: "Roles" },
                    { number: "100%", label: "Transparent" },
                    { number: "Fast", label: "Response" },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white">
                        {s.number}
                      </div>
                      <div className="text-indigo-200 text-sm mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="absolute -bottom-8 left-6 w-44 bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-700/50"
              >
                <div className="flex items-center gap-3 ">
                  <div className="bg-indigo-600/20 rounded-lg p-2">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-200">
                      Nearby Reports
                    </div>
                    <div className="text-xs text-gray-400">
                      View heatmap & cluster data
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
        
      </header>

      {/* FEATURES */}
      <section className="py-16 px-6 relative">
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-gradient-to-r from-green-400 to-emerald-500 text-sm font-semibold px-4 py-1 rounded-full mb-4"
          >
            ⚙️ Smart Governance Tools
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Comprehensive Municipal Management
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-400 max-w-3xl mx-auto text-lg mb-16"
          >
            Tools for citizens, staff and admins — reporting, assignment, tracking and analytics.
          </motion.p>
            <div className="absolute left-[-102px] top-[417px] w-[223px] h-[223px] rounded-full bg-[#2D64FF]/30 blur-3xl"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative bg-[#14141A] border border-transparent hover:border-gray-800 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="text-green-400 mb-5">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Animated underline */}
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 group-hover:w-1/2 group-hover:-translate-x"></span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute left-[1330px] top-[440px] w-[223px] h-[223px] rounded-full bg-[#C623FF]/30 blur-3xl"></div>

      </section>

      {/* HOW IT WORKS - Fixed alternating layout with center line */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-gray-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 ">
          <div className="text-center mb-16">
            <span className="px-4 py-1 text-xs uppercase tracking-wider bg-indigo-500/20 rounded-full text-indigo-400">
              Streamlined Process
            </span>
            <h2 className="text-4xl font-extrabold mt-4">How ResolveHub Works</h2>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
              A complete, AI-powered journey from complaint submission to verified resolution — built for speed, accuracy, and accountability.
            </p>
          </div>

          {/* center vertical line (md and up) */}
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-12 bottom-12 transform -translate-x-1/2 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-25" />

            <div className="space-y-12">
              {processSteps.map((step, index) => {
                const isLeft = index % 2 === 0; // index 0 => left (1 is left)
                return (
                  <motion.div
                    key={step.id}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.25 }}
                    custom={index}
                    className="grid grid-cols-1 md:grid-cols-12 items-center gap-4"
                  >
                    {/* LEFT column (card on left for even index) */}
                    <div className={`md:col-span-5 ${isLeft ? "md:flex md:justify-end" : ""}`}>
                      {isLeft && (
                        <div className="w-full md:max-w-lg">
                          {/* Small circle on mobile inside card header */}
                          <div className="md:hidden flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-semibold text-white">
                              {step.id}
                            </div>
                            <div className="px-2 py-1 text-xs rounded-full bg-indigo-600/20 text-indigo-300 font-medium">
                              {step.role}
                            </div>
                            
                          </div>

                          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-indigo-500/20 transition">
                            <div className="hidden md:flex items-center gap-3 mb-3">
                              <div className="px-2 py-1 text-xs rounded-full bg-indigo-600/20 text-indigo-400 font-medium">
                                {step.role}
                              </div>
                              <div className="text-indigo-400">{step.icon}</div>
                            </div>

                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-gray-400 mb-4">{step.summary}</p>
                            <ul className="list-disc pl-5 text-gray-400 space-y-1 text-sm">
                              {step.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CENTER column: number circle */}
                    <div className="md:col-span-2 flex justify-center">
                      <div className="relative z-10 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-gray-900/80">
                          {step.id}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT column (card on right for odd index) */}
                    <div className={`md:col-span-5 ${!isLeft ? "md:flex md:justify-start" : ""}`}>
                      {!isLeft && (
                        <div className="w-full md:max-w-lg">
                          {/* mobile small circle + role */}
                          <div className="md:hidden flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-semibold text-white">
                              {step.id}
                            </div>
                            <div className="px-2 py-1 text-xs rounded-full bg-indigo-600/20 text-indigo-300 font-medium">
                              {step.role}
                            </div>
                          </div>

                          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-indigo-500/20 transition">
                            <div className="hidden md:flex items-center gap-3 mb-3">
                              <div className="px-2 py-1 text-xs rounded-full bg-indigo-600/20 text-indigo-400 font-medium">
                                {step.role}
                              </div>
                              <div className="text-indigo-400">{step.icon}</div>
                            </div>

                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-gray-400 mb-4">{step.summary}</p>
                            <ul className="list-disc pl-5 text-gray-400 space-y-1 text-sm">
                              {step.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      <div className="absolute left-[-42px] top-[717px] w-[223px] h-[223px] rounded-full bg-[#2D64FF]/30 blur-3xl"></div>
              
        <div className="absolute left-[1380px] top-[140px] w-[223px] h-[223px] rounded-full bg-[#C623FF]/40 blur-3xl"></div>
        <div className="absolute left-[1380px] top-[1440px] w-[223px] h-[223px] rounded-full bg-[#C623FF]/40 blur-3xl"></div>

      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 bg-gradient-to-r from-purple-700 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl md:text-3xl font-semibold mb-3">
              Ready to Improve Your Community?
            </h3>
            <p className="mb-6 text-indigo-100 max-w-2xl mx-auto">
              Join ResolveHub and help make municipal services faster and more
              accountable.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-lg font-semibold shadow"
              >
                Start Reporting Issues
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 text-white rounded-lg"
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">ResolveHub</span>
          </div>
          <p className="text-gray-400 mb-2">
            Making municipalities more responsive and efficient through
            technology.
          </p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ResolveHub. Built for better civic
            engagement.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
