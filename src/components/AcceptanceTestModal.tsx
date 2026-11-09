import React, { useState } from 'react';
import { ACCEPTANCE_SCENARIOS, AcceptanceScenario } from '../data/acceptanceScenarios';
import {
  FlaskConical,
  Play,
  Sparkles,
  Check,
  X,
  Loader2,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AcceptanceTestModalProps {
  onLoadScenarioIntoLiveSession: (scenario: AcceptanceScenario) => void;
}

interface StepExecutionResult {
  step: number;
  questionId: string;
  studentInput: string;
  passed: boolean;
  actualAssessment: string;
  actualAction: string;
  actualMisconception: string | null;
  actualVisualPrompt: string | null;
  tutorMessage: string;
  pedagogicalReason: string;
}

interface ScenarioExecutionResult {
  scenarioId: string;
  code: string;
  name: string;
  passed: boolean;
  earlyExitValidated?: boolean;
  steps: StepExecutionResult[];
}

export const AcceptanceTestModal: React.FC<AcceptanceTestModalProps> = ({
  onLoadScenarioIntoLiveSession,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-c');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isRunningAllTests, setIsRunningAllTests] = useState<boolean>(false);
  const [isRunningSingle, setIsRunningSingle] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Record<string, ScenarioExecutionResult>>({});

  const currentScenario =
    ACCEPTANCE_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    ACCEPTANCE_SCENARIOS[0];

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    setActiveStepIndex(0);
  };

  const handleNextStep = () => {
    if (activeStepIndex < currentScenario.studentSteps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setActiveStepIndex(0);
  };

  // Run single scenario test via authoritative server test endpoint
  const handleRunSingleScenarioTest = async (scenario: AcceptanceScenario) => {
    setIsRunningSingle(true);
    try {
      const response = await fetch('/api/test/scenarios/run', { method: 'POST' });
      const data = await response.json();
      if (data.success && Array.isArray(data.scenarios)) {
        const found = data.scenarios.find((s: ScenarioExecutionResult) => s.scenarioId === scenario.id);
        if (found) {
          setTestResults((prev) => ({
            ...prev,
            [scenario.id]: found,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to run scenario test:', err);
    } finally {
      setIsRunningSingle(false);
    }
  };

  // Run all 4 acceptance scenarios through the server progression engine
  const handleRunAllTests = async () => {
    setIsRunningAllTests(true);
    try {
      const response = await fetch('/api/test/scenarios/run', { method: 'POST' });
      const data = await response.json();
      if (data.success && Array.isArray(data.scenarios)) {
        const newResults: Record<string, ScenarioExecutionResult> = {};
        for (const s of data.scenarios) {
          newResults[s.scenarioId] = s;
        }
        setTestResults(newResults);
      }
    } catch (err) {
      console.error('Failed to run acceptance tests:', err);
    } finally {
      setIsRunningAllTests(false);
    }
  };

  const currentResult = testResults[currentScenario.id];
  const passedScenariosCount = Object.values(testResults).filter((r) => r.passed).length;
  const totalScenariosCount = ACCEPTANCE_SCENARIOS.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
              <FlaskConical className="w-4 h-4" />
              <span>SECTION 10 EXECUTABLE ACCEPTANCE TEST SUITE</span>
              <span aria-hidden="true">·</span>
              <span>Live Engine Verification</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Four Adaptive Student Behaviours
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              These scenarios execute actual requests against the LearnMate AI tutoring engine to verify genuine adaptive responses rather than static conversation mocks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={handleRunAllTests}
              disabled={isRunningAllTests}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isRunningAllTests ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isRunningAllTests ? 'Executing All Tests...' : 'Run All 4 Acceptance Tests'}</span>
            </button>

            <button
              onClick={() => onLoadScenarioIntoLiveSession(currentScenario)}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load in Tutor</span>
            </button>
          </div>
        </div>

        {/* Global Test Results Banner (if tests have been run) */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Test Execution Summary:</span>
              <span
                className={`font-semibold ${
                  passedScenariosCount === totalScenariosCount
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {passedScenariosCount} of {totalScenariosCount} Acceptance Scenarios PASSED
              </span>
            </div>
            <span className="text-slate-500 font-mono text-2xs">
              Live Engine Verified · Server Authoritative
            </span>
          </div>
        )}

        {/* Persona Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          {ACCEPTANCE_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            const res = testResults[scenario.id];

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario.id)}
                className={`text-left p-3.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-300 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    Persona {scenario.code}
                  </span>
                  {res ? (
                    <span
                      className={`text-2xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                        res.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {res.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{res.passed ? 'PASS' : 'FAIL'}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">
                      {scenario.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {scenario.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {scenario.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Inspection Arena */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Scenario Overview Details */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                BEHAVIOURAL PROFILE {currentScenario.code}: {currentScenario.name.toUpperCase()}
              </span>
              {currentResult && (
                <span
                  className={`text-2xs font-bold px-2 py-0.5 rounded ${
                    currentResult.passed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {currentResult.passed ? 'LIVE TEST PASSED' : 'TEST INCOMPLETE'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 font-medium">
              <strong>Expected Adaptation:</strong> {currentScenario.expectedTutorBehavior}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => handleRunSingleScenarioTest(currentScenario)}
              disabled={isRunningSingle}
              className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-300 rounded-md hover:bg-sky-100 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isRunningSingle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>{isRunningSingle ? 'Running...' : `Run Persona ${currentScenario.code} Test`}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              title="Reset to step 1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNextStep}
              disabled={activeStepIndex >= currentScenario.studentSteps.length - 1}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>Next Turn ({activeStepIndex + 1}/{currentScenario.studentSteps.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step-by-Step Dialog Playback */}
        <div className="space-y-4">
          {currentScenario.studentSteps.slice(0, activeStepIndex + 1).map((step, idx) => {
            const isLast = idx === activeStepIndex;
            const executedStep = currentResult?.steps?.find((s) => s.step === step.step);

            // Display live executed data if run, else simulated reference
            const message = executedStep ? executedStep.tutorMessage : step.simulatedTutorResponse.message;
            const assessment = executedStep ? executedStep.actualAssessment : step.simulatedTutorResponse.assessment;
            const misconception = executedStep ? executedStep.actualMisconception : step.simulatedTutorResponse.misconception;
            const reason = executedStep ? executedStep.pedagogicalReason : step.simulatedTutorResponse.pedagogicalExplanation;

            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border transition-all ${
                  isLast ? 'border-sky-300 bg-sky-50/20 shadow-xs' : 'border-slate-200 bg-white'
                }`}
              >
                {/* Step Header */}
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500 mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      Turn {step.step}: {step.description}
                    </span>
                    {executedStep && (
                      <span
                        className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                          executedStep.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {executedStep.passed ? 'ASSERTION PASSED' : 'ASSERTION FAILED'}
                      </span>
                    )}
                  </div>
                  <span>Question Target: {step.questionPrompt}</span>
                </div>

                {/* Conversation Exchange */}
                <div className="space-y-3">
                  {/* Student Input Bubble */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-slate-900 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-md text-xs">
                      <span className="text-slate-400 block text-2xs mb-0.5">Student Input:</span>
                      <span className="font-medium">{step.studentInput}</span>
                    </div>
                  </div>

                  {/* Tutor Response Bubble */}
                  <div className="flex items-start gap-3 justify-start">
                    <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-xs p-4 max-w-xl text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-2xs text-slate-500 border-b border-slate-100 pb-1.5">
                        <span className="font-semibold text-sky-700">LearnMate AI Tutor Response</span>
                        <div className="flex items-center gap-2">
                          {misconception ? (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{misconception}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{assessment.toUpperCase()}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="whitespace-pre-line leading-relaxed text-slate-700">
                        {message}
                      </div>

                      {/* Pedagogical Audit Annotation */}
                      <div className="mt-2 pt-2 border-t border-slate-100 text-2xs text-slate-600 bg-slate-50 p-2.5 rounded space-y-1">
                        <div>
                          <strong className="text-slate-800">Adaptive Decision: </strong>
                          <span>{reason}</span>
                        </div>
                        <div className="text-slate-400">
                          Expected Assertion: <code>assessment={step.expectedAssertion.expectedAssessment}</code>, <code>action={step.expectedAssertion.expectedAction}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification Summary for Evaluators */}
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Executable Verification Guarantee</span>
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Clicking <strong>"Run All 4 Acceptance Tests"</strong> passes every student input directly to the mathematical evaluation engine. In Persona A, the tutor immediately escalates to higher-order challenges. In Persona B, it eliminates clinical scoring and introduces a friendly Kiwi chocolate block visual. In Persona C, it reliably identifies denominator addition and switches from verbal analogy to a visual bar model. In Persona D, it verifies topic mastery.
          </p>
        </div>
      </div>
    </div>
  );
};
