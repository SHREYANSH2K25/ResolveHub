import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageCircle, 
  FileText, 
  HelpCircle, 
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Users,
  Shield,
  Zap
} from 'lucide-react';

const HelpPage = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      question: 'How do I submit a complaint?',
      answer: 'Click on "Submit Complaint" from the homepage, fill in the details including title, description, and location. Add photos if needed for better resolution. Once submitted, you\'ll receive a unique tracking ID to monitor progress.',
      category: 'Getting Started'
    },
    {
      question: 'How can I track my complaint status?',
      answer: 'Use the "Check Status" feature with your complaint tracking ID. You can also view all your complaints in the "My Complaints" section if you\'re logged in. Real-time updates are provided via email and in-app notifications.',
      category: 'Tracking'
    },
    {
      question: 'What if my complaint is not resolved in time?',
      answer: 'Complaints are automatically escalated if they exceed the SLA timeline. You can also manually escalate using the complaint detail page. Priority issues are handled by senior staff members.',
      category: 'Resolution'
    },
    {
      question: 'Can I submit complaints anonymously?',
      answer: 'Yes, you can submit complaints without registering. However, creating an account allows you to track multiple complaints, receive updates, and access additional features.',
      category: 'Privacy'
    },
    {
      question: 'What types of issues can I report?',
      answer: 'You can report various municipal issues including potholes, street lighting, waste management, water supply, traffic problems, and other civic concerns.',
      category: 'Categories'
    },
    {
      question: 'How long does it take to resolve complaints?',
      answer: 'Resolution time varies by category: Emergency issues (24 hours), Infrastructure (7-14 days), Maintenance (3-7 days). You\'ll be notified of expected timelines when you submit.',
      category: 'Timeline'
    }
  ];

  const guidelines = [
    {
      title: 'Submitting Effective Complaints',
      icon: FileText,
      items: [
        'Provide clear and specific descriptions of the issue',
        'Include high-quality photos or videos when possible', 
        'Mention exact location details with landmarks',
        'Select the most appropriate category',
        'Include contact information for follow-up'
      ]
    },
    {
      title: 'Best Practices',
      icon: Zap,
      items: [
        'Check if the issue has already been reported',
        'Be respectful and constructive in your description',
        'Provide context about when the issue started',
        'Update your complaint if the situation changes',
        'Rate the resolution quality after completion'
      ]
    }
  ];

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-10 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Glass Morphism */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/60 border-b border-gray-700/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Help Center</h1>
                <p className="text-gray-300">Get support and answers to common questions</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          
          {/* Header Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl text-center">
              <h1 className="text-4xl font-bold text-white mb-4">How can we help you?</h1>
              <p className="text-gray-300 text-lg mb-6">Find answers, get support, and learn how to make the most of ResolveHub</p>
              
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Phone Support */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6 text-center hover:bg-gray-900/40 transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full border border-green-500/30 mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Call Support</h3>
                <p className="text-gray-300 mb-4">24/7 helpline for urgent issues</p>
                <p className="text-lg font-bold text-green-400">1800-RESOLVE</p>
                <p className="text-sm text-gray-400 mt-2">Available round the clock</p>
              </div>
            </div>

            {/* Email Support */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6 text-center hover:bg-gray-900/40 transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full border border-blue-500/30 mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
                <p className="text-gray-300 mb-4">Get detailed help via email</p>
                <p className="text-lg font-bold text-blue-400">support@resolvehub.gov</p>
                <p className="text-sm text-gray-400 mt-2">Response within 4 hours</p>
              </div>
            </div>

            {/* Live Chat */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6 text-center hover:bg-gray-900/40 transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full border border-purple-500/30 mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Live Chat</h3>
                <p className="text-gray-300 mb-4">Chat with our support team</p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Chat
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
              <div className="flex items-center space-x-3 mb-6 border-b border-gray-700/30 pb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                  <HelpCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
                  <p className="text-gray-300">Find quick answers to common questions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredFaqs.map((item, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg border border-gray-700/30 overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-white mb-1">{item.question}</h4>
                        <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4 border-t border-gray-700/30">
                        <p className="text-gray-300 leading-relaxed pt-4">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {guidelines.map((guide, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
                  <div className="flex items-center space-x-3 mb-6 border-b border-gray-700/30 pb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                      <guide.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{guide.title}</h3>
                  </div>
                  <div className="space-y-3">
                    {guide.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-full border border-indigo-500/30 mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Need More Help?</h3>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Our support team is here to help you with any questions or issues.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                  Contact Support
                </button>
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;