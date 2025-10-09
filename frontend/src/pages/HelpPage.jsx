// src/pages/HelpPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, FileText, HelpCircle } from 'lucide-react';

const HelpPage = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: 'How do I submit a complaint?',
      answer: 'Click on "Submit Complaint" from the homepage, fill in the details, add photos if needed, and submit. You\'ll receive a tracking ID.'
    },
    {
      question: 'How can I track my complaint status?',
      answer: 'Use the "Check Status" feature with your complaint ID or registered phone number to get real-time updates.'
    },
    {
      question: 'What if my complaint is not resolved in time?',
      answer: 'Complaints are automatically escalated if they exceed the SLA timeline. You can also manually escalate using the complaint detail page.'
    },
    {
      question: 'Can I submit complaints anonymously?',
      answer: 'Yes, you can toggle the "Submit Anonymously" option during submission. You\'ll still receive a tracking ID for updates.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Help Center</h1>
            <p className="text-sm text-gray-400">Get support and answers to common questions</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <Phone className="h-8 w-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Call Support</h3>
            <p className="text-sm text-gray-400 mb-2">24/7 helpline for urgent issues</p>
            <p className="font-medium">1800-XXX-XXXX</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <Mail className="h-8 w-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-gray-400 mb-2">Get help via email</p>
            <p className="font-medium">support@resolvehub.gov</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-400 mb-2">Chat with our support team</p>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">Start Chat</button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <HelpCircle className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index}>
                <h4 className="font-medium">{item.question}</h4>
                <p className="text-gray-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Guidelines & Best Practices</h2>
          </div>
          <div>
            <h4 className="font-medium mb-2">Submitting Effective Complaints</h4>
            <ul className="text-gray-400 ml-4 space-y-1">
              <li>• Provide clear and specific descriptions</li>
              <li>• Include photos or videos when possible</li>
              <li>• Mention exact location details</li>
              <li>• Select appropriate category</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
