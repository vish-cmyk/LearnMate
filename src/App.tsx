import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { CurriculumBrowser } from './components/CurriculumBrowser';
import { TutorWorkspace } from './components/TutorWorkspace';
import { FractionVisualizer } from './components/FractionVisualizer';
import { AcceptanceTestModal } from './components/AcceptanceTestModal';
import { EndLessonReport } from './components/EndLessonReport';
import { ConceptMasteryRecord, StudentSessionSummary } from './types';
import { FRACTION_TOPICS } from './data/fractionsCurriculum';
import { AcceptanceScenario } from './data/acceptanceScenarios';
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'lesson' | 'visualizer' | 'personas' | 'report'>('lesson');
  const [sessionSummary, setSessionSummary] = useState<StudentSessionSummary | null>(null);
  const [conceptRecords, setConceptRecords] = useState<ConceptMasteryRecord[]>(() => {
    return FRACTION_TOPICS.map((t) => ({
      topicId: t.id,
      topicTitle: t.title,
      status: 'not_started',
      score: 0,
      attempts: 0,
      successes: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      consecutiveCorrect: 0,
      consecutiveMistakes: 0,
      demonstratedUnderstanding: false,
      currentDifficultyLevel: 'standard',
      hasUnresolvedMistake: false,
      misconceptionsEncountered: [],
    }));
  });

  const [lessonKey, setLessonKey] = useState<number>(0);
  const [initialTopicIndex, setInitialTopicIndex] = useState<number>(0);
  const [initialPhase, setInitialPhase] = useState<'diagnostic' | 'guided_practice' | 'independent_assessment'>('diagnostic');
  const [initialQuestionId, setInitialQuestionId] = useState<string | undefined>(undefined);

  // When a lesson finishes
  const handleFinishLesson = (summary: StudentSessionSummary, records: ConceptMasteryRecord[]) => {
    setSessionSummary(summary);
    setConceptRecords(records);
    setActiveTab('report');
  };

  const handleRestartLesson = () => {
    setLessonKey((prev) => prev + 1);
    setInitialTopicIndex(0);
    setInitialPhase('diagnostic');
    setInitialQuestionId(undefined);
    setActiveTab('lesson');
  };

  const handleContinuePractice = () => {
    setActiveTab('lesson');
  };

  const handleLoadScenarioIntoLiveSession = (scenario: AcceptanceScenario) => {
    const topicIdx = FRACTION_TOPICS.findIndex((t) => t.id === scenario.targetTopicId);
    setInitialTopicIndex(topicIdx >= 0 ? topicIdx : 0);
    setInitialPhase('guided_practice');
    setInitialQuestionId(scenario.initialQuestionId);
    setLessonKey((prev) => prev + 1);
    setActiveTab('lesson');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      {/* Top Bar Contract (1-line Brand Wordmark - 4-5 nav links - 1 Primary Action) */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickStart={() => {
          setActiveTab('lesson');
        }}
        hasActiveSession={lessonKey > 0}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: CURRICULUM BROWSER */}
        {activeTab === 'curriculum' && (
          <CurriculumBrowser
            onSelectTopic={(topicId: string) => {
              const idx = FRACTION_TOPICS.findIndex((t) => t.id === topicId);
              setInitialTopicIndex(idx >= 0 ? idx : 0);
              setInitialPhase('guided_practice');
              setInitialQuestionId(undefined);
              setLessonKey((prev) => prev + 1);
              setActiveTab('lesson');
            }}
            onLaunchActiveFractions={() => {
              setInitialTopicIndex(0);
              setInitialPhase('guided_practice');
              setInitialQuestionId(undefined);
              setLessonKey((prev) => prev + 1);
              setActiveTab('lesson');
            }}
          />
        )}

        {/* VIEW 2: ACTIVE TUTOR WORKSPACE */}
        {activeTab === 'lesson' && (
          <TutorWorkspace
            key={lessonKey}
            initialTopicIndex={initialTopicIndex}
            initialPhase={initialPhase}
            initialQuestionId={initialQuestionId}
            onFinishLesson={handleFinishLesson}
          />
        )}

        {/* VIEW 3: STANDALONE VISUALIZER SANDBOX */}
        {activeTab === 'visualizer' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
                <span>MATHEMATICAL EXPLORATION STAGE</span>
                <span aria-hidden="true">·</span>
                <span>Visual Geometry & Proportions</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Fraction Concept Sandbox
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Test and visualize fractions interactively. Compare different numerators and denominators to observe equivalent portions, circle angles, and bar partitions in real-time.
              </p>
            </div>

            <FractionVisualizer
              initialNumerator={3}
              initialDenominator={4}
              initialSecondNumerator={6}
              initialSecondDenominator={8}
            />
          </div>
        )}

        {/* VIEW 4: SECTION 10 ACCEPTANCE TEST SUITE */}
        {activeTab === 'personas' && (
          <AcceptanceTestModal
            onLoadScenarioIntoLiveSession={handleLoadScenarioIntoLiveSession}
          />
        )}

        {/* VIEW 5: END-OF-LESSON REPORT */}
        {activeTab === 'report' && (
          sessionSummary ? (
            <EndLessonReport
              summary={sessionSummary}
              conceptRecords={conceptRecords}
              onRestartLesson={handleRestartLesson}
              onContinuePractice={handleContinuePractice}
            />
          ) : (
            <div className="max-w-xl mx-auto bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                No Completed Lesson Session Yet
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Work through practice questions with the LearnMate AI tutor to generate your diagnostic progression summary, strengths breakdown, and recommended next activities.
              </p>
              <button
                onClick={() => setActiveTab('lesson')}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Jump to Year 9 Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        )}
      </main>

      {/* Quiet, Professional Educational Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">LearnMate AI</span>
            <span aria-hidden="true">·</span>
            <span>Your personal learning companion</span>
          </div>

          <div className="flex items-center gap-4 text-2xs text-slate-400">
            <span>Aligned with New Zealand Curriculum (Years 9–13)</span>
            <span aria-hidden="true">·</span>
            <span>Formative Learning Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
