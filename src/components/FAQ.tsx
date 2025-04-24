import React, { useState } from 'react';
import { Quote, ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How do I use the bot?',
    answer: 'Start by visiting @cookies_checkerbot on Telegram and type /start. Follow the bot\'s instructions to access all features and validate your cookies.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept cryptocurrency payments in Litecoin (LTC) and Tether (USDT). For users in India, we also support UPI payments.',
  },
  {
    question: 'What happens after my subscription expires?',
    answer: 'When your subscription expires, you\'ll need to renew it to continue using the bot\'s features. Your data remains saved, but you won\'t be able to perform validations until renewal.',
  },
  {
    question: 'How do I activate my subscription?',
    answer: 'After completing your payment, you\'ll receive a subscription key. Use the /claim <key> command in the bot to activate your subscription.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes, all cryptocurrency transactions are processed securely through the blockchain. We never store your payment information.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {faqs.map((faq, index) => (
        <div 
          key={index}
          className="group relative"
        >
          {/* Card glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          
          <div className="relative rounded-2xl bg-gray-800/50 backdrop-blur border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors pr-8">
                {faq.question}
              </h3>
              <ChevronDown 
                className={`w-6 h-6 text-purple-400 transition-transform duration-300 flex-shrink-0
                  ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            
            <div
              className={`grid transition-all duration-300 ${
                openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-gray-700">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;