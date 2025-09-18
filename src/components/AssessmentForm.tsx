'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { questions } from '@/data/questions';
import LSGIcon from '@/components/LSGIcon';

// Simple form data type without strict validation
type AssessmentFormData = Record<string, any>;

interface AssessmentFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export default function AssessmentForm({ onSubmit, isLoading }: AssessmentFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Memoize questions to prevent hydration issues
  const stableQuestions = useMemo(() => questions, []);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    register,
  } = useForm<AssessmentFormData>({
    defaultValues: createDefaultValues(),
  });

  function createDefaultValues() {
    const defaults: Record<string, any> = {};
    
    stableQuestions.forEach(question => {
      if (question.type === 'single') {
        defaults[question.id] = '';
      } else if (question.type === 'multi') {
        defaults[question.id] = [];
      } else if (question.type === 'ranking') {
        defaults[question.id] = {};
      }
    });
    
    return defaults;
  }

  const watchedValues = watch();

  useEffect(() => {
    setIsClient(true);
    setCurrentQuestion(0);
    reset(createDefaultValues());
  }, [reset]);

  // Multi-select with "None" exclusivity and optional maxSelections
  const handleMultiSelect = (
    questionId: keyof AssessmentFormData,
    value: string,
    maxSelections?: number
  ) => {
    const currentValues = (watchedValues[questionId] as string[]) || [];

    if (value === 'none') {
      // Selecting None clears others; deselecting None leaves empty
      if (currentValues.includes('none')) {
        setValue(questionId, [] as any);
      } else {
        setValue(questionId, ['none'] as any);
      }
      return;
    }

    // Selecting any real option deselects None
    const base = currentValues.filter((x) => x !== 'none');

    if (currentValues.includes(value)) {
      // Deselect option
      const newValues = base.filter((x) => x !== value);
      setValue(questionId, newValues as any);
    } else {
      // Select option
      let newValues = [...base, value];

      if (maxSelections && newValues.length > maxSelections) {
        // Keep most recent selections within the cap
        newValues = newValues.slice(-maxSelections);
      }

      setValue(questionId, newValues as any);
    }
  };

  const handleSingleSelect = (questionId: keyof AssessmentFormData, value: string) =>
    setValue(questionId, value as any);

  const handleRankingSelect = (questionId: keyof AssessmentFormData, optionValue: string, levelValue: string) => {
    const currentRanking = (watchedValues[questionId] as Record<string, string>) || {};
    const newRanking = { ...currentRanking };
    newRanking[optionValue] = levelValue;
    setValue(questionId, newRanking as any);
  };

  const canProceed = () => {
    if (currentQuestion >= stableQuestions.length) return true; // Company info section
    
    const q = stableQuestions[currentQuestion];
    const val = watchedValues[q.id as keyof AssessmentFormData];
    
    if (q.type === 'multi') {
      return Array.isArray(val) && val.length > 0;
    }
    if (q.type === 'ranking') {
      const ranking = val as Record<string, string> || {};
      return q.rankingOptions?.every((option: any) => ranking[option.value]);
    }
    return Boolean(val);
  };

  const canGoBack = () => currentQuestion > 0;

  const nextQuestion = () => {
    if (currentQuestion < stableQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isLastQuestion = currentQuestion >= stableQuestions.length - 1;

  // Custom validation function
  const validateCurrentStep = () => {
    // Validate current question
    const q = stableQuestions[currentQuestion];
    const val = watchedValues[q.id as keyof AssessmentFormData];
    
    if (q.type === 'multi') {
      if (!Array.isArray(val) || val.length === 0) {
        alert('Please select at least one option');
        return false;
      }
    } else if (q.type === 'ranking') {
      const ranking = val as Record<string, string> || {};
      const allRanked = q.rankingOptions?.every((option: any) => ranking[option.value]);
      if (!allRanked) {
        alert('Please complete the ranking for all items');
        return false;
      }
    } else {
      if (!val || val.trim() === '') {
        alert('Please select an option');
        return false;
      }
    }
    
    return true;
  };

  const handleFormSubmit = (data: AssessmentFormData) => {
    if (validateCurrentStep()) {
      if (isLastQuestion) {
        // If this is the last question, submit the form data to trigger the ContactModal
        onSubmit(data);
      } else {
        // Otherwise, go to next question
        nextQuestion();
      }
    }
  };

  const renderQuestion = () => {

    const question = stableQuestions[currentQuestion];
    const currentValue = watchedValues[question.id as keyof AssessmentFormData];

    return (
      <div className="question-card">
        <div className="mb-10 animate-volumetric-slide">
          <h2 className="question-title">
            {question.title}
          </h2>
          <div className="question-subtitle">
            {question.subtitle.split('\n').map((line, index) => (
              <p key={index} className={index > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container animate-functional-reveal">
          <div className="progress-info">
            <span className="small-text text-trust-navy">
              Question {currentQuestion + 1} of {stableQuestions.length}
            </span>
            <span className="small-text text-lean-blue font-medium">
              {isClient ? Math.round(((currentQuestion + 1) / stableQuestions.length) * 100) : 0}% Complete
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: isClient ? `${((currentQuestion + 1) / stableQuestions.length) * 100}%` : '0%' }}
            ></div>
            {/* Solar Orange Night accent dot */}
            <div className="absolute right-0 top-0 w-1 h-2 bg-solar-orange-night rounded-full opacity-60"></div>
          </div>
        </div>


        <div className="mb-8">
          {renderQuestionType(question, currentValue)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-neutral-200 animate-functional-guide">
          <button
            type="button"
            onClick={prevQuestion}
            disabled={!canGoBack()}
            className={`
              group relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm
              transition-all duration-200 transform hover:scale-102 active:scale-98
              ${!canGoBack() 
                ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 border border-neutral-200' 
                : 'bg-gradient-to-r from-lavender-100 to-lavender-200 text-trust-navy border-2 border-lavender-400 hover:border-lavender-500 hover:from-lavender-200 hover:to-lavender-300 shadow-lg hover:shadow-xl'
              }
            `}
          >
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 mr-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-lavender-700 group-hover:text-trust-navy transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </div>
              Previous
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            type="submit"
            disabled={!canProceed() || isLoading}
            className={`
              group relative overflow-hidden px-8 py-3 rounded-xl font-semibold text-sm
              transition-all duration-200 transform hover:scale-102 active:scale-98
              ${(!canProceed() || isLoading) 
                ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400' 
                : 'bg-lean-blue text-white shadow-brand hover:shadow-brand-hover hover:bg-momentum-blue'
              }
            `}
          >
            <div className="flex items-center justify-center">
              {isLastQuestion ? (isLoading ? 'Submitting...' : 'Submit AI Readiness Quick Check') : 'Next'}
              {!isLastQuestion && (
                <div className="w-5 h-5 ml-2 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderQuestionType = (question: any, currentValue: any) => {
    switch (question.type) {
      case 'single':
        return (
          <div className="space-y-4 animate-volumetric-scale">
            <div className="question-type-single mb-6">
              <div className="flex items-center">
                <LSGIcon name="check" size="sm" className="mr-3" />
                <span className="font-forma font-semibold">Single Choice - Select one option</span>
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {question.options?.map((option: any, index: number) => (
                <label
                  key={option.value}
                  className={`
                    option-card group
                    ${currentValue === option.value ? 'selected' : ''}
                    animate-functional-reveal
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name={question.id}
                    checked={currentValue === option.value}
                    onChange={() => handleSingleSelect(question.id, option.value)}
                  />
                  <div className="option-content">
                    <div className={`
                      option-radio
                      ${currentValue === option.value
                        ? 'border-lean-blue bg-lean-blue'
                        : 'border-neutral-300 group-hover:border-lean-blue'
                      }
                    `}>
                      {currentValue === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full animate-scale-in"></div>
                      )}
                    </div>
                    <div className="option-text">
                      <div className="option-label">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="option-description">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'multi':
        return (
          <div className="space-y-4 animate-volumetric-scale">
            <div className="question-type-multi mb-6">
              <div className="flex items-center">
                <LSGIcon name="check" size="sm" className="mr-3" />
                <span className="font-forma font-semibold">
                  Multiple Choice - Select {question.maxSelections ? `up to ${question.maxSelections}` : 'all that apply'}
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {question.options?.map((option: any, index: number) => {
                const isSelected = (currentValue as string[])?.includes(option.value) || false;
                return (
                  <label
                    key={option.value}
                    className={`
                      option-card group
                      ${isSelected ? 'selected' : ''}
                      animate-functional-reveal
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => handleMultiSelect(question.id, option.value, question.maxSelections)}
                    />
                    <div className="option-content">
                      <div className={`
                        option-checkbox
                        ${isSelected
                          ? 'border-lean-blue bg-lean-blue'
                          : 'border-neutral-300 group-hover:border-lean-blue'
                        }
                      `}>
                        {isSelected && (
                          <LSGIcon name="check" size="sm" className="text-white animate-scale-in" />
                        )}
                      </div>
                      <div className="option-text">
                        <div className="option-label">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="option-description">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-6 animate-volumetric-scale">
            <div className="question-type-ranking mb-6">
              <div className="flex items-center">
                <LSGIcon name="arrow-up" size="sm" className="mr-3" />
                <span className="font-forma font-semibold">Rank each concern</span>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl shadow-volumetric border border-neutral-200 animate-functional-reveal">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left p-4 sm:p-6 font-forma font-semibold text-midnight-core text-sm sm:text-base">Concern</th>
                    {question.rankingLevels?.map((level: any) => (
                      <th key={level.value} className="text-center p-4 sm:p-6 font-forma font-semibold text-midnight-core text-sm sm:text-base">
                        {level.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {question.rankingOptions?.map((option: any, index: number) => (
                    <tr key={option.value} className={`border-b border-neutral-200 last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}>
                      <td className="p-4 sm:p-6 font-forma font-medium text-midnight-core text-sm sm:text-base">
                        {option.label}
                      </td>
                      {question.rankingLevels?.map((level: any) => {
                        const currentRanking = currentValue as Record<string, string> || {};
                        const isSelected = currentRanking[option.value] === level.value;
                        
                        return (
                          <td key={level.value} className="text-center p-4 sm:p-6">
                            <label className="cursor-pointer group">
                              <input
                                type="radio"
                                name={`${question.id}_${option.value}`}
                                className="sr-only"
                                checked={isSelected}
                                onChange={() => handleRankingSelect(question.id, option.value, level.value)}
                              />
                              <div className={`
                                w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200 group-hover:scale-102
                                ${isSelected
                                  ? 'border-lean-blue bg-lean-blue text-white shadow-brand'
                                  : 'border-neutral-300 hover:border-lean-blue hover:bg-primary-50'
                                }
                              `}>
                                {isSelected && (
                                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-scale-in"></div>
                                )}
                              </div>
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-aqua-50 py-8 sm:py-12">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {renderQuestion()}
      </form>
    </div>
  );
}