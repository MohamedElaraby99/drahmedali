import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      company: "TechCorp",
      rating: 5,
      text: "The courses here transformed my career. I went from knowing nothing about programming to landing my dream job in just 6 months!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "UX Designer",
      company: "DesignStudio",
      rating: 5,
      text: "The quality of instruction is outstanding. The instructors are industry professionals who really know their stuff.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      company: "GrowthCo",
      rating: 5,
      text: "I love the flexibility of learning at my own pace. The community support is incredible too!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of satisfied learners who have transformed their careers with our courses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDhDMTYuMjY4IDggMTAgMTQuMjY4IDEwIDIyQzEwIDI5LjczMiAxNi4yNjggMzYgMjQgMzZDMzEuNzMyIDM2IDM4IDI5LjczMiAzOCAyMkMzOCAxNC4yNjggMzEuNzMyIDggMjQgOFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+Cg==';
                    }}
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-blue-400 w-4 h-4" />
                ))}
              </div>

              <div className="relative">
                <FaQuoteLeft className="absolute -top-2 -left-2 text-blue-200 dark:text-blue-800 text-2xl" />
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-6">
                  "{testimonial.text}"
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-blue-400 w-4 h-4" />
              ))}
            </div>
            <span className="text-gray-900 dark:text-white font-semibold ml-2">
              4.9/5 Average Rating
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection; 