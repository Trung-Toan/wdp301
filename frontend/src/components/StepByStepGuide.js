import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Circle, Info, X } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function StepByStepGuide({ steps, title = "Hướng dẫn từng bước", onComplete, showSkip = true }) {
    const [currentStep, setCurrentStep] = useState(0);
    const { settings } = useAccessibility();
    const isLarge = settings.largeFont || settings.elderlyMode;

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

    return (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 ${isLarge ? 'accessibility-large-font' : ''}`}>
            <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full ${isLarge ? 'p-8' : 'p-6'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 bg-blue-600 rounded-xl ${isLarge ? 'p-4' : ''}`}>
                            <Info className={`text-white ${isLarge ? 'h-7 w-7' : 'h-6 w-6'}`} />
                        </div>
                        <div>
                            <h2 className={`font-bold text-gray-900 ${isLarge ? 'text-2xl' : 'text-xl'}`}>
                                {title}
                            </h2>
                            <p className={`text-gray-600 ${isLarge ? 'text-lg' : 'text-sm'}`}>
                                Bước {currentStep + 1} / {steps.length}
                            </p>
                        </div>
                    </div>
                    {showSkip && (
                        <button
                            onClick={handleSkip}
                            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isLarge ? 'p-3' : ''}`}
                            aria-label="Bỏ qua"
                        >
                            <X className={`text-gray-600 ${isLarge ? 'h-6 w-6' : 'h-5 w-5'}`} />
                        </button>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`${
                                        index <= currentStep
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    } rounded-full ${isLarge ? 'w-12 h-12' : 'w-10 h-10'} flex items-center justify-center font-bold transition-all`}
                                >
                                    {index < currentStep ? (
                                        <CheckCircle className={isLarge ? 'h-6 w-6' : 'h-5 w-5'} />
                                    ) : (
                                        <span className={isLarge ? 'text-lg' : 'text-base'}>{index + 1}</span>
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 ${
                                            index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                        } ${isLarge ? 'mt-3 mb-2' : 'mt-2 mb-1'} mx-2`}
                                        style={{ width: '100%', maxWidth: '100px' }}
                                    />
                                )}
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* Content */}
                <div className={`mb-6 ${isLarge ? 'space-y-6' : 'space-y-4'}`}>
                    <div className={`flex items-start gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 ${isLarge ? 'p-6' : ''}`}>
                        <div className={`p-2 bg-blue-600 rounded-lg flex-shrink-0 ${isLarge ? 'p-3' : ''}`}>
                            <Info className={`text-white ${isLarge ? 'h-6 w-6' : 'h-5 w-5'}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-gray-900 mb-2 ${isLarge ? 'text-xl' : 'text-lg'}`}>
                                {currentStepData.title}
                            </h3>
                            <p className={`text-gray-700 leading-relaxed ${isLarge ? 'text-lg' : 'text-base'}`}>
                                {currentStepData.description}
                            </p>
                            {currentStepData.image && (
                                <div className="mt-4">
                                    <img
                                        src={currentStepData.image}
                                        alt={currentStepData.title}
                                        className="rounded-lg border-2 border-gray-200 max-w-full"
                                    />
                                </div>
                            )}
                            {currentStepData.tips && currentStepData.tips.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className={`font-semibold text-gray-900 ${isLarge ? 'text-lg' : 'text-base'}`}>
                                        Mẹo:
                                    </p>
                                    <ul className={`list-disc list-inside space-y-1 text-gray-700 ${isLarge ? 'text-lg' : 'text-base'}`}>
                                        {currentStepData.tips.map((tip, tipIndex) => (
                                            <li key={tipIndex}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${isLarge ? 'px-8 py-4 text-lg' : ''}`}
                    >
                        <ChevronLeft className={isLarge ? 'h-6 w-6' : 'h-5 w-5'} />
                        Trước
                    </button>
                    <button
                        onClick={handleNext}
                        className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold ${isLarge ? 'px-8 py-4 text-lg' : ''}`}
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                <CheckCircle className={isLarge ? 'h-6 w-6' : 'h-5 w-5'} />
                                Hoàn thành
                            </>
                        ) : (
                            <>
                                Tiếp theo
                                <ChevronRight className={isLarge ? 'h-6 w-6' : 'h-5 w-5'} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

