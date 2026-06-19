import React, { useState } from 'react';
import { 
  Mic, 
  BrainCircuit, 
  FileText, 
  LineChart, 
  Sparkles, 
  ArrowRight, 
  Bell 
} from 'lucide-react';

const InterviewPrepComingSoon = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      // Add your Firebase waitlist logic here
    }
  };

  const userFeatures = [
    {
      icon: <Mic className="w-6 h-6 text-violet-500" />,
      title: "Real-Time Voice Simulations",
      description: "Converse naturally with our AI interviewer. Practice speaking your answers aloud and get comfortable with live interactions."
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-blue-500" />,
      title: "Dynamic, Unscripted Questions",
      description: "No two interviews are the same. Our AI listens to your answers and asks intelligent follow-up questions to test your depth of knowledge."
    },
    {
      icon: <FileText className="w-6 h-6 text-emerald-500" />,
      title: "Resume-Tailored Scenarios",
      description: "The AI reads your uploaded resume to grill you specifically on your past projects, tech stack, and unique career history."
    },
    {
      icon: <LineChart className="w-6 h-6 text-rose-500" />,
      title: "Instant Analytics & Feedback",
      description: "Immediately after hanging up, receive a detailed breakdown of your pacing, confidence, keyword usage, and areas to improve."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="relative px-8 py-16 sm:px-16 lg:py-24 text-center bg-gradient-to-b from-violet-50 to-white overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-violet-400 rounded-full blur-[100px] mix-blend-multiply" />
            <div className="absolute top-1/2 left-1/4 bg-blue-300 w-64 h-64 rounded-full blur-[80px] mix-blend-multiply" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-sm font-medium mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Upcoming Feature</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Master the interview, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                before you even step in the room.
              </span>
            </h1>
            
            <p className="max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
              Ace Mind is bringing the ultimate AI-powered mock interview experience to your browser. Prepare for your dream job with real-time voice interactions and hyper-personalized feedback.
            </p>

            {/* Waitlist Form */}
            <form onSubmit={handleNotify} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              <button 
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitted ? "You're on the list!" : "Notify Me"}
                {!submitted && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-8 py-16 sm:px-16 bg-white border-t border-slate-50">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">What you'll get on day one</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
            {userFeatures.map((feature, index) => (
              <div key={index} className="flex gap-4 group">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InterviewPrepComingSoon;