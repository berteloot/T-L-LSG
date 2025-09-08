'use client';

import { useState } from 'react';
import AssessmentForm from '@/components/AssessmentForm';
import ContactModal from '@/components/ContactModal';
import Header from '@/components/Header';
import LSGIcon from '@/components/LSGIcon';
import { z } from 'zod';

interface AssessmentFormData {
  company_roles: string[];
  primary_focus: string;
  operational_footprint: string;
  company_size: string;
  improvement_areas: string[];
  pressure_areas: string[];
  system_count: string;
  performance_tracking: string;
  leadership_views: string;
  ai_concerns?: Record<string, string>;
  business_goal?: string;
  guided_support?: string;
  company?: string;
  email?: string;
  consent?: boolean;
  sector?: string;
  region?: string;
}

interface ContactData {
  email: string;
  company: string;
  consent: boolean;
}

interface AssessmentResult {
  score: number;
  tier: string;
  message?: string;
  aiReport?: string;
  company?: string;
  breakdown: Record<string, number>;
  maxScore: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentFormData | null>(null);

  const handleAssessmentComplete = (data: Record<string, unknown>) => {
    setAssessmentData(data as unknown as AssessmentFormData);
    setShowContactModal(true);
  };

  const handleContactSubmit = async (contactData: ContactData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate that we have assessment data
      if (!assessmentData) {
        throw new Error('Assessment data is missing. Please complete the assessment first.');
      }

      // Prepare the submission data
      const submissionData = {
        ...assessmentData,
        ...contactData,
        // Ensure required fields are present
        email: contactData.email,
        company: contactData.company,
        consent: contactData.consent
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Submission failed with status ${response.status}`);
      }

      // Extract the result from the API response
      const { result, aiReport } = responseData;
      
      setResult({
        ...result,
        aiReport
      });
    } catch (err: unknown) {
      console.error('Submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowContactModal(false);
    setResult(null);
    setError(null);
    setAssessmentData(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative bg-white/80 backdrop-blur-sm border-b border-neutral-200/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center">
              {/* Logo and Brand */}
              <div className="mb-8 animate-volumetric-slide">
                <div className="flex justify-center mb-6">
                  <img 
                    src="/LSG_Logo_Horizontal_RGB_Lean Blue.png" 
                    alt="LSG Logo" 
                    className="h-12 sm:h-16 w-auto"
                  />
                </div>
                <h1 className="section-title mb-2">Transportation & Logistics Assessment Platform</h1>
              </div>
              
              {/* Main Headline */}
              <h2 className="display-title mb-4 sm:mb-6 animate-functional-reveal">
                Discover Your AI Readiness
                <span className="block text-lean-blue">in Transportation & Logistics</span>
              </h2>
              
              <p className="text-lg sm:text-xl text-trust-navy mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-functional-guide">
                Get personalized insights and actionable recommendations to accelerate your digital transformation journey in the T&L industry.
              </p>
              
              {/* Version Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Stable Version 1.0.0
              </div>
              
              {/* Key Benefits - LSG Brand Design */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-neutral-200/50 shadow-sm hover:shadow-brand transition-all duration-200">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <LSGIcon name="analytics" size="md" className="text-lean-blue" />
                  </div>
                  <h3 className="card-title mb-2 text-sm sm:text-base">12 Key Areas</h3>
                  <p className="small-text text-xs sm:text-sm">Comprehensive evaluation across all critical T&L functions</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-neutral-200/50 shadow-sm hover:shadow-brand transition-all duration-200">
                  <div className="w-12 h-12 bg-aqua-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <LSGIcon name="ai" size="md" className="text-aqua-600" />
                  </div>
                  <h3 className="card-title mb-2 text-sm sm:text-base">Instant Results</h3>
                  <p className="small-text text-xs sm:text-sm">AI-powered report delivered to your email in minutes</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-neutral-200/50 shadow-sm hover:shadow-brand transition-all duration-200 relative">
                  <div className="w-12 h-12 bg-lavender-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <LSGIcon name="truck" size="md" className="text-lavender-600" />
                  </div>
                  <h3 className="card-title mb-2 text-sm sm:text-base">Actionable Insights</h3>
                  <p className="small-text text-xs sm:text-sm">Personalized recommendations for your specific needs</p>
                  {/* Solar Orange Night accent */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-solar-orange-night rounded-full opacity-40"></div>
                </div>
              </div>
              
              {/* Time Estimate */}
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-trust-navy text-sm font-medium animate-functional-reveal">
                <LSGIcon name="clock" size="sm" className="mr-2" />
                Takes about 5-7 minutes to complete
              </div>
              
              {/* Solar Orange Night Accent */}
              <div className="mt-4 flex justify-center">
                <div className="w-2 h-2 bg-solar-orange-night rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Assessment */}
      {error ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 animate-functional-reveal">
            <div className="flex">
              <div className="flex-shrink-0">
                <LSGIcon name="error" size="md" className="text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-forma font-semibold text-red-800">Submission Error</h3>
                <div className="mt-1 sm:mt-2 text-sm sm:text-base text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AssessmentForm onSubmit={handleAssessmentComplete} isLoading={isLoading} />

      {/* Footer */}
      <div className="bg-midnight-core border-t border-solar-orange-night mt-16 sm:mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="text-white mb-4 sm:mb-6">
              <p className="text-lg sm:text-xl font-forma font-semibold mb-1">T&L LSG Assessment Platform</p>
              <p className="text-sm text-neutral-400">Empowering Transportation & Logistics with AI</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-neutral-400">
              <a href="/privacy-policy" className="hover:text-lean-blue transition-colors duration-300">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-lean-blue transition-colors duration-300">Terms of Service</a>
            </div>
            <div className="mt-6 text-xs text-neutral-500">
              <p>© 2025 T&L LSG. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && assessmentData && (
        <ContactModal
          isOpen={showContactModal}
          onClose={handleCloseModal}
          onSubmit={handleContactSubmit}
          isLoading={isLoading}
          result={result}
          assessmentData={assessmentData}
        />
      )}
    </div>
  );
}
