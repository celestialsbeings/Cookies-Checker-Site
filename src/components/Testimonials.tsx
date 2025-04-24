import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex M.',
    role: 'Professional Developer',
    content: 'The cookie validation service is incredibly fast and reliable. It has saved me countless hours of manual work.',
  },
  {
    name: 'Sarah K.',
    role: 'Security Researcher',
    content: 'Best cookie checker bot I\'ve used. The multi-platform support and quick response times are outstanding.',
  },
  {
    name: 'Michael R.',
    role: 'Web Developer',
    content: 'The subscription plans are very reasonable, and the bot\'s features exceed expectations. Highly recommended!',
  },
];

const Testimonials = () => {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {testimonials.map((testimonial, index) => (
        <div 
          key={index} 
          className="group p-6 rounded-2xl bg-gray-800/30 backdrop-blur border border-gray-700
            hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="relative">
            {/* Background glow effect */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-colors"></div>
            
            {/* Quote icon */}
            <Quote className="relative w-8 h-8 text-purple-400 mb-4 transform group-hover:scale-110 transition-transform" />
          </div>
          
          <p className="text-gray-300 mb-6 leading-relaxed">{testimonial.content}</p>
          
          <div className="border-t border-gray-700 pt-4 mt-auto">
            <p className="font-semibold text-white">{testimonial.name}</p>
            <p className="text-sm text-purple-400">{testimonial.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;