import { 
  Shield,
  Users,
  Clock,
  Globe,
  Heart,
  Award,
  Target,
  Zap,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const stats = [
    { icon: Users, value: '50K+', label: 'Active Citizens', color: 'text-blue-600' },
    { icon: CheckCircle, value: '25K+', label: 'Complaints Resolved', color: 'text-green-600' },
    { icon: Clock, value: '2.4 days', label: 'Avg Resolution Time', color: 'text-purple-600' },
    { icon: Star, value: '4.8/5', label: 'Satisfaction Rating', color: 'text-yellow-600' }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Report issues in seconds with our intuitive interface and smart categorization.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy controls.'
    },
    {
      icon: MapPin,
      title: 'Location Aware',
      description: 'GPS integration and interactive maps for precise issue reporting and tracking.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Collaborative platform connecting citizens, staff, and administrators.'
    },
    {
      icon: Target,
      title: 'AI Powered',
      description: 'Intelligent triage system for automatic categorization and staff assignment.'
    },
    {
      icon: Globe,
      title: 'Always Available',
      description: '24/7 accessibility across all devices with real-time notifications.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      bio: 'Leading digital transformation in municipal services with 8+ years experience.',
      avatar: 'SJ',
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      bio: 'Building scalable solutions for smart cities and citizen engagement platforms.',
      avatar: 'MC',
      color: 'from-green-500 to-blue-600'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      bio: 'Creating intuitive experiences that make government services accessible to everyone.',
      avatar: 'ER',
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'David Park',
      role: 'Operations Lead',
      bio: 'Ensuring smooth operations and continuous improvement of municipal workflows.',
      avatar: 'DP',
      color: 'from-yellow-500 to-red-600'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Platform Launch', description: 'ResolveHub goes live in pilot municipalities' },
    { year: '2021', title: 'AI Integration', description: 'Smart triage and automatic categorization deployed' },
    { year: '2022', title: 'Mobile App', description: 'Native mobile applications for iOS and Android' },
    { year: '2023', title: 'Analytics Dashboard', description: 'Advanced reporting and performance insights' },
    { year: '2024', title: '50K Users', description: 'Reached 50,000 active users across 25 cities' },
    { year: '2025', title: 'Global Expansion', description: 'International deployment and multi-language support' }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-pink-600 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                ResolveHub
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Transforming how communities connect with their local government through 
              innovative technology and citizen-centric design.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/help"
                className="inline-flex items-center gap-2 px-8 py-4 border border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4 ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gray-50 dark:bg-municipal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                We believe that every citizen deserves efficient, transparent, and responsive 
                municipal services. ResolveHub bridges the gap between communities and local 
                government through cutting-edge technology.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our platform empowers citizens to report issues easily while providing 
                government officials with the tools they need to respond quickly and effectively.
              </p>
              <div className="flex items-center gap-4">
                <Heart className="w-6 h-6 text-red-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Built with passion for better communities
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <Award className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Award Winning Platform</h3>
                <p className="mb-6">
                  Recognized for innovation in digital government services and citizen engagement.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Best Digital Innovation 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Smart City Excellence Award</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Citizens Choice Winner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose ResolveHub?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built from the ground up with modern technology and user-centered design principles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full mb-6">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-50 dark:bg-municipal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Passionate individuals working to improve communities worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <div className={`w-20 h-20 bg-gradient-to-r ${member.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <div className="text-primary-600 dark:text-primary-400 font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {member.bio}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Key milestones in building better communities through technology.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 to-pink-600"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-start gap-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {milestone.year.slice(-2)}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {milestone.title}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {milestone.year}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Have questions or want to learn more? We'd love to hear from you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <Mail className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-white font-medium">Email</div>
              <div className="text-purple-200">hello@resolvehub.com</div>
            </div>
            <div className="text-center">
              <Phone className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-white font-medium">Phone</div>
              <div className="text-purple-200">+1 (555) 123-4567</div>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-white font-medium">Address</div>
              <div className="text-purple-200">123 Innovation St, Tech City</div>
            </div>
          </div>
          
          <Link 
            to="/help"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Contact Support <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;