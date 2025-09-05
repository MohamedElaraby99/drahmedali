import React from 'react';
import { FaCheck, FaStar, FaCrown, FaRocket } from 'react-icons/fa';

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      icon: FaStar,
      color: "bg-gray-500",
      features: [
        "Access to 10 free courses",
        "Community support",
        "Basic certificates",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Most popular choice",
      icon: FaRocket,
      color: "bg-blue-500",
      features: [
        "Access to all courses",
        "Priority support",
        "Professional certificates",
        "Downloadable content",
        "Live Q&A sessions",
        "Career guidance"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For teams and organizations",
      icon: FaCrown,
      color: "bg-blue-500",
      features: [
        "Everything in Pro",
        "Team management",
        "Custom learning paths",
        "Analytics dashboard",
        "Dedicated support",
        "API access",
        "White-label options"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your Learning Plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start your learning journey with flexible pricing options that fit your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${plan.color} text-white rounded-full mb-4`}>
                  <plan.icon className="text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <FaCheck className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                plan.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
              }`}>
                {plan.name === "Free" ? "Get Started" : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All plans include a 30-day money-back guarantee
          </p>
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
            View detailed comparison →
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 