import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function QuizModal({ quest, isOpen, onClose }) {
  const { quizQuestions, claimQuest, addToast } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  if (!isOpen || !quest) return null;

  const questions = quizQuestions[quest.id] || [];

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl max-w-sm text-center">
          <p className="text-slate-300 text-sm">No quiz questions loaded for this quest.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">Close</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const handleSelectOption = (index) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: index
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setSubmitted(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    const res = await claimQuest(quest.id, selectedAnswers);
    setIsClaiming(false);
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentStep(0);
    setSubmitted(false);
  };

  const score = calculateScore();
  const isPerfect = score === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{quest.title}</h3>
              <p className="text-xs text-purple-300">Reward: +{quest.points} Student Points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <div className="mt-5">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-blue-400">QUESTION {currentStep + 1} OF {questions.length}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                {quest.difficulty}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h4 className="text-base font-semibold text-white mb-4 leading-snug">
              {currentQ.question}
            </h4>

            {/* Options List */}
            <div className="space-y-2.5 mb-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/20 text-white font-semibold shadow-md shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'border-blue-400 bg-blue-500 text-white font-bold'
                          : 'border-slate-700 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Nav Footer */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQ.id] === undefined}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLastQuestion ? 'Submit Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="mt-5 text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-3 ${
                isPerfect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isPerfect ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h4 className="text-xl font-bold text-white">
              {isPerfect ? 'Stellar Quiz Passed! 🎉' : 'Keep Learning! 📚'}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              You scored <span className="font-bold text-white">{score}</span> out of{' '}
              <span className="font-bold text-white">{questions.length}</span> correct.
            </p>

            {/* Answer Explanations Review */}
            <div className="mt-4 max-h-48 overflow-y-auto space-y-2 text-left p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div key={q.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                      {isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      )}
                      <span>Q{idx + 1}: {q.question}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-5">
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex gap-3">
              {!isPerfect ? (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Quiz</span>
                </button>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>{isClaiming ? 'Claiming Reward...' : `Claim +${quest.points} Points & Badge`}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
