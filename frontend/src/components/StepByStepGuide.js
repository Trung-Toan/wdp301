import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Circle, Info, X, Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function StepByStepGuide({ steps, title = "Hướng dẫn từng bước", onComplete, showSkip = true }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const { settings } = useAccessibility();
    const isLarge = settings.largeFont || settings.elderlyMode;

    // Animation when step changes
    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 300);
        return () => clearTimeout(timer);
    }, [currentStep]);

    if (!steps || steps.length === 0) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            if (onComplete) onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        if (onComplete) onComplete();
    };

    const currentStepData = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className={`fixed inset-0 bg-black/75 backdrop-blur-md z-[10000] flex items-center justify-center p-4 animate-fadeIn ${isLarge ? 'accessibility-large-font' : ''}`}>
            <div className={`bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-100 opacity-100'}`}>
                {/* Header with Gradient */}
                <div className="sticky top-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-6 lg:p-8 rounded-t-3xl flex items-center justify-between shadow-lg z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                            <BookOpen className={`${isLarge ? 'h-7 w-7' : 'h-6 w-6'} animate-pulse`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className={`font-bold text-white mb-1 ${isLarge ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'}`}>
                                {title}
                            </h2>
                            <p className={`text-white/90 ${isLarge ? 'text-base lg:text-lg' : 'text-sm lg:text-base'}`}>
                                Bước {currentStep + 1} / {steps.length}
                            </p>
                        </div>
                    </div>
                    {showSkip && (
                        <button
                            onClick={handleSkip}
                            className={`p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 active:scale-90 flex-shrink-0 ${isLarge ? 'p-3' : ''}`}
                            aria-label="Bỏ qua"
                        >
                            <X className={`text-white ${isLarge ? 'h-6 w-6' : 'h-5 w-5'}`} />
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out shadow-lg"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Content with Scroll */}
                <div className="p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
                    {/* Progress Steps Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {steps.map((step, index) => (
                            <React.Fragment key={index}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`relative ${
                                            index < currentStep
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110'
                                                : index === currentStep
                                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-4 ring-blue-200 scale-110'
                                                : 'bg-gray-200 text-gray-400'
                                        } rounded-full ${isLarge ? 'w-12 h-12' : 'w-10 h-10'} flex items-center justify-center font-bold transition-all duration-300`}
                                    >
                                        {index < currentStep ? (
                                            <CheckCircle className={`${isLarge ? 'h-6 w-6' : 'h-5 w-5'} animate-in fade-in`} />
                                        ) : (
                                            <span className={`${isLarge ? 'text-lg' : 'text-base'} font-bold`}>{index + 1}</span>
                                        )}
                                        {index === currentStep && (
                                            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                                        )}
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                            index < currentStep 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                                : index === currentStep
                                                ? 'bg-gradient-to-r from-green-500 via-blue-500 to-gray-200'
                                                : 'bg-gray-200'
                                        } ${isLarge ? 'mx-3' : 'mx-2'}`}
                                        style={{ maxWidth: '80px' }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step Content with Enhanced Design */}
                    <div 
                        className={`relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200/50 shadow-lg overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-100 scale-100'} ${isLarge ? 'p-8' : 'p-6'}`}
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl"></div>
                        
                        <div className="relative flex items-start gap-4 lg:gap-6">
                            {/* Icon */}
                            <div className={`p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex-shrink-0 transform hover:scale-110 transition-transform duration-200 ${isLarge ? 'p-5' : ''}`}>
                                <Info className={`text-white ${isLarge ? 'h-7 w-7' : 'h-6 w-6'}`} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-gray-900 mb-3 ${isLarge ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'}`}>
                                    {currentStepData.title}
                                </h3>
                                <p className={`text-gray-700 leading-relaxed mb-4 ${isLarge ? 'text-lg lg:text-xl' : 'text-base lg:text-lg'}`}>
                                    {currentStepData.description}
                                </p>
                                
                                {/* Image if available */}
                                {currentStepData.image && (
                                    <div className="mt-4 mb-4 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                                        <img
                                            src={currentStepData.image}
                                            alt={currentStepData.title}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}
                                
                                {/* Tips Section */}
                                {currentStepData.tips && currentStepData.tips.length > 0 && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200/50 shadow-md">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lightbulb className={`text-amber-600 ${isLarge ? 'h-6 w-6' : 'h-5 w-5'}`} />
                                            <p className={`font-bold text-amber-900 ${isLarge ? 'text-lg lg:text-xl' : 'text-base lg:text-lg'}`}>
                                                Mẹo hữu ích:
                                            </p>
                                        </div>
                                        <ul className={`space-y-2.5 ${isLarge ? 'text-base lg:text-lg' : 'text-sm lg:text-base'}`}>
                                            {currentStepData.tips.map((tip, tipIndex) => (
                                                <li key={tipIndex} className="flex items-start gap-2.5 text-amber-800">
                                                    <Sparkles className={`text-amber-500 flex-shrink-0 mt-1 ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                                    <span className="leading-relaxed">{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="sticky bottom-0 bg-white border-t-2 border-gray-200/50 p-6 lg:p-8 rounded-b-3xl shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                        {/* Step Indicator for Mobile */}
                        <div className="sm:hidden w-full text-center mb-2">
                            <div className="text-sm text-gray-600 font-medium">
                                Bước {currentStep + 1} của {steps.length}
                            </div>
                        </div>
                        
                        {/* Previous Button */}
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className={`group flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 ${isLarge ? 'px-8 py-4 text-lg min-h-[56px]' : 'min-h-[48px]'}`}
                        >
                            <ChevronLeft className={`${isLarge ? 'h-6 w-6' : 'h-5 w-5'} group-hover:-translate-x-1 transition-transform duration-200`} />
                            <span>Trước</span>
                        </button>
                        
                        {/* Next/Complete Button */}
                        <button
                            onClick={handleNext}
                            className={`group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 overflow-hidden ${isLarge ? 'px-8 py-4 text-lg min-h-[56px]' : 'min-h-[48px]'} flex-1 sm:flex-initial`}
                        >
                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                            
                            {currentStep === steps.length - 1 ? (
                                <>
                                    <CheckCircle className={`${isLarge ? 'h-6 w-6' : 'h-5 w-5'} relative z-10`} />
                                    <span className="relative z-10 font-bold">Hoàn thành</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10">Tiếp theo</span>
                                    <ChevronRight className={`${isLarge ? 'h-6 w-6' : 'h-5 w-5'} relative z-10 group-hover:translate-x-1 transition-transform duration-200`} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

