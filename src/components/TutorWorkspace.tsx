import React, { useState, useRef, useEffect } from 'react';
import {
  FRACTION_TOPICS,
  FRACTIONS_QUESTION_BANK,
} from '../data/fractionsCurriculum';
import {
  FractionQuestion,
  ChatMessage,
  ConceptMasteryRecord,
  StudentSessionSummary,
} from '../types';
import { FractionVisualizer } from './FractionVisualizer';
import {
  Send,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Sparkles,
  Award,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TutorWorkspaceProps {
  onFinishLesson: (summary: StudentSessionSummary, records: ConceptMasteryRecord[]) => void;
  initialTopicIndex?: number;
  initialPhase?: 'diagnostic' | 'guided_practice' | 'independent_assessment';
  initialQuestionId?: string;
}

export const TutorWorkspace: React.FC<TutorWorkspaceProps> = ({
  onFinishLesson,
  initialTopicIndex = 0,
  initialPhase = 'diagnostic',
  initialQuestionId,
}) => {
  // Determine starting topic and question if initialQuestionId is provided
  const targetQuestion = initialQuestionId
    ? FRACTIONS_QUESTION_BANK.find((q) => q.id === initialQuestionId)
    : null;

  const resolvedTopicIdx = targetQuestion
    ? FRACTION_TOPICS.findIndex((t) => t.id === targetQuestion.topicId)
    : initialTopicIndex;

  // Session Progression State
  const [currentTopicIdx, setCurrentTopicIdx] = useState<number>(
    resolvedTopicIdx >= 0 ? resolvedTopicIdx : 0
  );
  const [currentPhase, setCurrentPhase] = useState<'diagnostic' | 'guided_practice' | 'independent_assessment'>(
    initialPhase
  );

  // Filtered Question list based on phase & topic
  const activeQuestions = FRACTIONS_QUESTION_BANK.filter((q) => {
    if (currentPhase === 'diagnostic') return q.stage === 'diagnostic';
    if (currentPhase === 'independent_assessment') return q.stage === 'independent_assessment';
    const topic = FRACTION_TOPICS[currentTopicIdx];
    return q.stage === 'guided_practice' && q.topicId === topic.id;
  });

  const startingQuestionIdx = targetQuestion
    ? Math.max(0, activeQuestions.findIndex((q) => q.id === targetQuestion.id))
    : 0;

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(startingQuestionIdx);
  const [overrideQuestionId, setOverrideQuestionId] = useState<string | null>(initialQuestionId || null);

  const activeQuestion: FractionQuestion =
    (overrideQuestionId ? FRACTIONS_QUESTION_BANK.find((q) => q.id === overrideQuestionId) : null) ||
    activeQuestions[currentQuestionIdx] ||
    activeQuestions[0] ||
    FRACTIONS_QUESTION_BANK[0];

  // Check if unattempted challenge question exists for current concept
  const availableChallenge = FRACTIONS_QUESTION_BANK.find(
    (q) =>
      q.topicId === activeQuestion.topicId &&
      q.difficulty === 'challenge' &&
      q.id !== activeQuestion.id
  );

  // Student inputs
  const [studentInput, setStudentInput] = useState<string>('');
  const [inputNum, setInputNum] = useState<string>('');
  const [inputDen, setInputDen] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);
  const [lastAttemptCorrect, setLastAttemptCorrect] = useState<boolean | null>(null);

  // Adaptive Notification
  const [adaptiveToast, setAdaptiveToast] = useState<{ title: string; subtitle: string } | null>(null);

  // Statistics
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());

  // Topic mastery records - tracked separately per concept
  const [conceptRecords, setConceptRecords] = useState<Record<string, ConceptMasteryRecord>>(() => {
    const records: Record<string, ConceptMasteryRecord> = {};
    FRACTION_TOPICS.forEach((t) => {
      records[t.id] = {
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
      };
    });
    return records;
  });

  // UI Panels
  const [showVisualizer, setShowVisualizer] = useState<boolean>(false);
  const [showWorkedExample, setShowWorkedExample] = useState<boolean>(false);
  const [scratchpadText, setScratchpadText] = useState<string>('');

  // Initial welcome message
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (initialPhase === 'guided_practice') {
      const topic = FRACTION_TOPICS[resolvedTopicIdx >= 0 ? resolvedTopicIdx : 0];
      return [
        {
          id: 'init-scenario',
          sender: 'tutor',
          text: `Kia ora! We're focusing on **${topic.title}** (${topic.description}).\n\nI'll be monitoring your understanding step by step. Here is your practice question on the right. Give it your best shot!`,
          timestamp: 'Just now',
          recommendedAction: 'reinforce',
        },
      ];
    }
    return [
      {
        id: 'init-1',
        sender: 'tutor',
        text: `Kia ora! Welcome to LearnMate AI, your Year 9 Mathematics fractions companion.\n\nBefore we dive into the lessons, let's start with a quick 3-question diagnostic. This helps me understand what you already know so I can tailor the pace and challenges specifically for you!\n\nHere is our first question on the right. Give it a go whenever you're ready!`,
        timestamp: 'Just now',
        recommendedAction: 'reinforce',
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Current concept tracking record
  const currentConceptRecord =
    conceptRecords[activeQuestion.topicId] || {
      topicId: activeQuestion.topicId,
      topicTitle: activeQuestion.topicTitle,
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
    };

  // Submit student's answer
  const handleSubmitAnswer = async () => {
    let answerText = '';
    if (activeQuestion.questionType === 'multiple_choice') {
      answerText = selectedOption;
    } else if (inputNum !== '' && inputDen !== '') {
      answerText = `${inputNum}/${inputDen}`;
    } else {
      answerText = studentInput.trim();
    }

    if (!answerText) return;

    setIsSubmitting(true);

    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: `My answer is: ${answerText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, studentMsg]);
    setTotalAttempts((prev) => prev + 1);

    try {
      // Send concept-specific performance trackers with authoritative questionId
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentMessage: answerText,
          questionId: activeQuestion.id,
          currentTopic: activeQuestion.topicTitle,
          consecutiveMistakes: currentConceptRecord.consecutiveMistakes,
          conceptConsecutiveMistakes: currentConceptRecord.consecutiveMistakes,
          conceptConsecutiveCorrect: currentConceptRecord.consecutiveCorrect,
          conceptMisconceptions: currentConceptRecord.misconceptionsEncountered,
          wasRecovering: currentConceptRecord.hasUnresolvedMistake,
          studentLevel:
            currentConceptRecord.consecutiveCorrect >= 1
              ? 'advanced'
              : currentConceptRecord.consecutiveMistakes >= 1
              ? 'needs_support'
              : 'standard',
          studentHistory: chatMessages.slice(-4),
        }),
      });

      const resData = await response.json();
      const tutorData = resData.data;

      let newQuestionNotice = '';
      const isCorrect = tutorData.assessment === 'correct';
      setLastAttemptCorrect(isCorrect);
      setHasAnsweredCurrent(true);

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);

        // Update concept record with recovery and consecutive tracking
        setConceptRecords((prev) => {
          const rec = prev[activeQuestion.topicId] || currentConceptRecord;
          const newSuccesses = rec.successes + 1;
          const newAttempts = rec.attempts + 1;
          const score = Math.round((newSuccesses / newAttempts) * 100);
          const newConsecutiveCorrect = rec.consecutiveCorrect + 1;

          // Requirement 3: Answering correctly clears any unresolved mistake on this concept
          const hasUnresolved = false;

          // Requirement 2: Two consecutive correct answers on this concept
          let status: ConceptMasteryRecord['status'] = 'understood';
          if (newAttempts >= 2 && score >= 80 && newConsecutiveCorrect >= 2) {
            status = 'mastered';
          } else if (score >= 60) {
            status = 'understood';
          } else {
            status = 'needs_practice';
          }

          // Requirement 3: Actual Adaptive Question Selection after 2 consecutive correct answers on this concept
          if (newConsecutiveCorrect >= 2) {
            const challengeQ = FRACTIONS_QUESTION_BANK.find(
              (q) =>
                q.topicId === activeQuestion.topicId &&
                q.difficulty === 'challenge' &&
                q.id !== activeQuestion.id
            );
            if (challengeQ) {
              setOverrideQuestionId(challengeQ.id);
              setAdaptiveToast({
                title: 'Adaptive Escalation: Challenge Question Loaded!',
                subtitle: `Two in a row on this concept! Stepping up difficulty: "${challengeQ.prompt.slice(0, 50)}..."`,
              });
            } else {
              setAdaptiveToast({
                title: 'Concept Competence Verified',
                subtitle: 'Two in a row on this concept! Ready to advance to the next module.',
              });
            }
            setTimeout(() => setAdaptiveToast(null), 5000);
          }

          return {
            ...prev,
            [activeQuestion.topicId]: {
              ...rec,
              attempts: newAttempts,
              successes: newSuccesses,
              correctAnswers: rec.correctAnswers + 1,
              incorrectAnswers: rec.incorrectAnswers,
              consecutiveCorrect: newConsecutiveCorrect,
              consecutiveMistakes: 0,
              demonstratedUnderstanding: newConsecutiveCorrect >= 2 || rec.hasUnresolvedMistake,
              currentDifficultyLevel: newConsecutiveCorrect >= 2 ? 'challenge' : rec.currentDifficultyLevel,
              hasUnresolvedMistake: hasUnresolved,
              score,
              status,
              notes: `${newSuccesses} of ${newAttempts} answered correctly (${score}%). Demonstrated understanding.`,
            },
          };
        });

        try {
          confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
        } catch {
          // ignore
        }
      } else {
        setIncorrectCount((prev) => prev + 1);

        // Requirement 1 & 4 & 5: Track error on THIS concept and record gap
        setConceptRecords((prev) => {
          const rec = prev[activeQuestion.topicId] || currentConceptRecord;
          const newAttempts = rec.attempts + 1;
          const score = Math.round((rec.successes / newAttempts) * 100);
          const newConsecutiveMistakes = rec.consecutiveMistakes + 1;
          const newMisconceptions = tutorData.misconception
            ? [...rec.misconceptionsEncountered, tutorData.misconception]
            : rec.misconceptionsEncountered;

          // Check if same misconception occurred twice on this concept
          const sameMisconceptionCount = tutorData.misconception
            ? newMisconceptions.filter((m) => m === tutorData.misconception).length
            : 0;

          newQuestionNotice = '';
          // Requirement 4: After two repeated errors on the same concept, change explanation, visual method, AND provide new question!
          if (sameMisconceptionCount >= 2 || newConsecutiveMistakes >= 2) {
            setShowVisualizer(true);
            const remedialQ =
              FRACTIONS_QUESTION_BANK.find(
                (q) =>
                  q.topicId === activeQuestion.topicId &&
                  q.id !== activeQuestion.id &&
                  (q.id.includes('remedial') || q.id.includes('whittakers'))
              ) ||
              FRACTIONS_QUESTION_BANK.find(
                (q) =>
                  q.topicId === activeQuestion.topicId &&
                  q.id !== activeQuestion.id &&
                  q.stage === 'guided_practice' &&
                  q.difficulty === 'intro'
              );

            if (remedialQ) {
              setOverrideQuestionId(remedialQ.id);
              newQuestionNotice = `\n\n**Fresh Visual Practice Question Provided:**\n*${remedialQ.prompt}*`;
              setAdaptiveToast({
                title: 'Teaching Strategy Shifted & New Question Provided',
                subtitle: `Switched approach to visual bar model with a fresh question: "${remedialQ.prompt.slice(0, 50)}..."`,
              });
            } else {
              setAdaptiveToast({
                title: 'Teaching Strategy Shifted',
                subtitle: 'Detected repeated difficulty on this concept. Switching to interactive visual model.',
              });
            }
            setTimeout(() => setAdaptiveToast(null), 5000);
          }

          return {
            ...prev,
            [activeQuestion.topicId]: {
              ...rec,
              attempts: newAttempts,
              successes: rec.successes,
              correctAnswers: rec.correctAnswers,
              incorrectAnswers: rec.incorrectAnswers + 1,
              consecutiveMistakes: newConsecutiveMistakes,
              consecutiveCorrect: 0,
              demonstratedUnderstanding: false,
              currentDifficultyLevel: (sameMisconceptionCount >= 2 || newConsecutiveMistakes >= 2) ? 'intro' : rec.currentDifficultyLevel,
              hasUnresolvedMistake: true, // Marked as requiring practice until demonstrated!
              misconceptionsEncountered: newMisconceptions,
              score,
              status: 'needs_practice',
              notes: `${rec.successes} of ${newAttempts} passed (${score}%). Unresolved learning gap—requires follow-up demonstration.`,
            },
          };
        });

        if (tutorData.visualPrompt) {
          setShowVisualizer(true);
        }
      }

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: tutorData.message + (newQuestionNotice ? `\n\n${newQuestionNotice}` : ''),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assessment: tutorData.assessment,
        misconceptionDiagnosed: tutorData.misconception,
        recommendedAction: tutorData.recommendedAction,
        visualPrompt: tutorData.visualPrompt,
      };

      setChatMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Try again on current question to demonstrate understanding before advancing
  const handleTryAgain = () => {
    setHasAnsweredCurrent(false);
    setLastAttemptCorrect(null);
    setStudentInput('');
    setInputNum('');
    setInputDen('');
    setSelectedOption('');
  };

  // Ask for a Socratic hint without giving answer
  const handleAskHint = async () => {
    setIsSubmitting(true);
    const hintMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: 'Could I please have a hint? I’m a bit stuck on what to do first.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, hintMsg]);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentMessage: 'Can you give me a gentle hint for this question?',
          questionId: activeQuestion.id,
          currentTopic: activeQuestion.topicTitle,
          studentLevel: 'standard',
        }),
      });
      const data = await response.json();
      const tutorData = data.data;

      const tutorHintMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: tutorData.message || (activeQuestion.hints[0] ?? 'Look closely at the denominator!'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'hint',
      };
      setChatMessages((prev) => [...prev, tutorHintMsg]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: activeQuestion.hints[0] || 'Take a close look at the denominator (the bottom number)!',
          timestamp: 'Just now',
          recommendedAction: 'hint',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requirement 1: Separate option to leave the lesson early without marking concepts as mastered
  const handleLeaveLessonEarly = () => {
    const recordsList = Object.values(conceptRecords).map((rec) => {
      // Any concept with unresolved errors or incomplete consecutive practice cannot be mastered
      if (rec.hasUnresolvedMistake || (rec.attempts > 0 && rec.consecutiveCorrect < 2)) {
        return {
          ...rec,
          status: 'needs_practice' as const,
          demonstratedUnderstanding: false,
          notes: 'Student exited lesson early without demonstrating mastery on this concept.',
        };
      }
      return rec;
    });

    const masteredList = recordsList
      .filter((r) => r.status === 'mastered' && !r.hasUnresolvedMistake && r.consecutiveCorrect >= 2)
      .map((r) => r.topicTitle);

    const needsPracticeList = recordsList
      .filter((r) => r.status === 'needs_practice' || r.hasUnresolvedMistake)
      .map((r) => r.topicTitle);

    const summary: StudentSessionSummary = {
      sessionDurationSeconds: Math.round((Date.now() - sessionStartTime) / 1000),
      totalAttempted: totalAttempts,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      accuracyPercentage: totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0,
      conceptsMastered: masteredList,
      conceptsRequiringPractice: needsPracticeList,
      addressedMisconceptions: Array.from(
        new Set(recordsList.flatMap((r) => r.misconceptionsEncountered))
      ),
      recommendedNextSteps: [
        'Resume practice to resolve active learning gaps.',
        'Use visual models for concepts requiring practice before next session.',
      ],
      assessmentCompleted: false,
    };

    onFinishLesson(summary, recordsList);
  };

  // Requirement 3: Adaptive Question Selection - Load harder challenge question
  const handleLoadChallengeQuestion = () => {
    if (!availableChallenge) return;
    setOverrideQuestionId(availableChallenge.id);
    setHasAnsweredCurrent(false);
    setLastAttemptCorrect(null);
    setStudentInput('');
    setInputNum('');
    setInputDen('');
    setSelectedOption('');
    setChatMessages((prev) => [
      ...prev,
      {
        id: `tutor-chal-${Date.now()}`,
        sender: 'tutor',
        text: `Awesome initiative! You chose the challenge question. Here is your **Challenge Problem** for ${currentTopic.title}:\n\n*${availableChallenge.prompt}*`,
        timestamp: 'Just now',
        recommendedAction: 'advance',
      },
    ]);
  };

  // Requirement 3: Adaptive Question Selection - Move forward to next topic
  const handleMoveToNextTopic = () => {
    setHasAnsweredCurrent(false);
    setLastAttemptCorrect(null);
    setStudentInput('');
    setInputNum('');
    setInputDen('');
    setSelectedOption('');
    setOverrideQuestionId(null);

    if (currentTopicIdx < FRACTION_TOPICS.length - 1) {
      const nextIdx = currentTopicIdx + 1;
      setCurrentTopicIdx(nextIdx);
      setCurrentQuestionIdx(0);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `topic-next-${Date.now()}`,
          sender: 'tutor',
          text: `Ka pai! Moving forward to **${FRACTION_TOPICS[nextIdx].title}**!\n${FRACTION_TOPICS[nextIdx].description}`,
          timestamp: 'Just now',
          recommendedAction: 'advance',
        },
      ]);
    } else {
      setCurrentPhase('independent_assessment');
      setCurrentQuestionIdx(0);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assess-start-${Date.now()}`,
          sender: 'tutor',
          text: `Tino pai rawa atu! You have worked through all guided modules. Let's start the Independent Assessment!`,
          timestamp: 'Just now',
          recommendedAction: 'advance',
        },
      ]);
    }
  };

  // Advance to next question or next phase
  const handleNextQuestion = () => {
    if (!lastAttemptCorrect) return;

    setHasAnsweredCurrent(false);
    setLastAttemptCorrect(null);
    setStudentInput('');
    setInputNum('');
    setInputDen('');
    setSelectedOption('');

    // If currently in diagnostic
    if (currentPhase === 'diagnostic') {
      if (currentQuestionIdx < activeQuestions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
        setOverrideQuestionId(null);
      } else {
        // Transition to Guided Practice: retain user selection or route to diagnosed learning gap
        setCurrentPhase('guided_practice');
        setCurrentQuestionIdx(0);
        setOverrideQuestionId(null);
        let targetTopic = resolvedTopicIdx >= 0 ? resolvedTopicIdx : 0;
        let diagnosisDebrief = '';

        // Check if diagnostic revealed an unresolved learning gap
        const gapTopic = FRACTION_TOPICS.findIndex((t) => conceptRecords[t.id]?.hasUnresolvedMistake);
        if (gapTopic >= 0) {
          targetTopic = gapTopic;
          const gapConcept = FRACTION_TOPICS[gapTopic];
          diagnosisDebrief = `Based on your diagnostic responses, we detected an area in **${gapConcept.title}** that will benefit from hands-on visual practice. Strengthening this now will make future fraction problems much simpler!`;
        } else if (resolvedTopicIdx >= 0) {
          targetTopic = resolvedTopicIdx;
          diagnosisDebrief = `Great work on the diagnostic! Your foundational baselines are looking steady, so we're diving right into your selected topic: **${FRACTION_TOPICS[targetTopic].title}**.`;
        } else {
          targetTopic = 0;
          diagnosisDebrief = `Ka pai! You've set your learning baseline. Let's begin with **${FRACTION_TOPICS[0].title}** to ensure your conceptual core is rock-solid.`;
        }

        setCurrentTopicIdx(targetTopic);

        const targetTopicData = FRACTION_TOPICS[targetTopic] || FRACTION_TOPICS[0];
        setChatMessages((prev) => [
          ...prev,
          {
            id: `diag-end-${Date.now()}`,
            sender: 'tutor',
            text: `Ka pai! Diagnostic check completed. 🎉\n\n${diagnosisDebrief}\n\n**Next Module: ${targetTopicData.title}**\n${targetTopicData.description}`,
            timestamp: 'Just now',
            recommendedAction: 'advance',
          },
        ]);
      }
      return;
    }

    // If in guided practice
    if (currentPhase === 'guided_practice') {
      setOverrideQuestionId(null);

      if (currentQuestionIdx < activeQuestions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
      } else {
        // Advance to next topic
        if (currentTopicIdx < FRACTION_TOPICS.length - 1) {
          const nextIdx = currentTopicIdx + 1;
          setCurrentTopicIdx(nextIdx);
          setCurrentQuestionIdx(0);

          setChatMessages((prev) => [
            ...prev,
            {
              id: `topic-next-${Date.now()}`,
              sender: 'tutor',
              text: `Awesome progress! You’ve completed the practice for ${FRACTION_TOPICS[currentTopicIdx].title}.\n\nNext up: **${FRACTION_TOPICS[nextIdx].title}**!\n${FRACTION_TOPICS[nextIdx].description}`,
              timestamp: 'Just now',
              recommendedAction: 'advance',
            },
          ]);
        } else {
          // Transition to independent assessment
          setCurrentPhase('independent_assessment');
          setCurrentQuestionIdx(0);

          setChatMessages((prev) => [
            ...prev,
            {
              id: `assess-start-${Date.now()}`,
              sender: 'tutor',
              text: `Tino pai rawa atu! You have worked through all 7 core fraction learning modules. 🌟\n\nLet's do a brief 3-question Independent Mastery Assessment to verify your understanding and create your End-of-Lesson Learning Summary Report. Ready?`,
              timestamp: 'Just now',
              recommendedAction: 'advance',
            },
          ]);
        }
      }
      return;
    }

    // If in independent assessment
    if (currentPhase === 'independent_assessment') {
      if (currentQuestionIdx < activeQuestions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
        setOverrideQuestionId(null);
      } else {
        handleCompleteLesson();
      }
    }
  };

  const handleCompleteLesson = () => {
    const recordsList = Object.values(conceptRecords);

    // Requirement 3 & 5: Never claim concept is mastered if hasUnresolvedMistake is true!
    const masteredList = recordsList
      .filter((r) => r.status === 'mastered' && !r.hasUnresolvedMistake)
      .map((r) => r.topicTitle);

    const needsPracticeList = recordsList
      .filter((r) => r.status === 'needs_practice' || r.hasUnresolvedMistake)
      .map((r) => r.topicTitle);

    const summary: StudentSessionSummary = {
      sessionDurationSeconds: Math.round((Date.now() - sessionStartTime) / 1000),
      totalAttempted: totalAttempts,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      accuracyPercentage: totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0,
      conceptsMastered: masteredList,
      conceptsRequiringPractice: needsPracticeList,
      addressedMisconceptions: currentConceptRecord.misconceptionsEncountered,
      recommendedNextSteps: [
        'Explore Mixed Numbers & Improper Fractions (e.g. 7/4 = 1 3/4)',
        'Connect Fractions to Decimals & Percentages (Year 9 Number Strand)',
      ],
      assessmentCompleted: currentPhase === 'independent_assessment',
    };

    onFinishLesson(summary, recordsList);
  };

  const currentTopic = FRACTION_TOPICS[currentTopicIdx] || FRACTION_TOPICS[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Adaptive Toast Alert */}
      {adaptiveToast && (
        <div className="p-3 bg-sky-900 text-white rounded-lg border border-sky-700 text-xs flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">{adaptiveToast.title}</span>
              <span className="text-slate-300 text-2xs block">{adaptiveToast.subtitle}</span>
            </div>
          </div>
          <button
            onClick={() => setAdaptiveToast(null)}
            className="text-xs text-sky-200 hover:text-white shrink-0 font-medium px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Session Progress Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm">
              Y9
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
                <span className="uppercase tracking-wider">
                  {currentPhase === 'diagnostic'
                    ? 'Diagnostic Assessment'
                    : currentPhase === 'guided_practice'
                    ? `Module ${currentTopic.order} of 7: ${currentTopic.title}`
                    : 'Independent Mastery Check'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 font-normal">
                  Question {currentQuestionIdx + 1} of {activeQuestions.length}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {currentPhase === 'diagnostic'
                  ? 'Baseline Knowledge Discovery'
                  : currentPhase === 'guided_practice'
                  ? currentTopic.title
                  : 'Independent Mastery Assessment'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-emerald-700 font-semibold">{correctCount} Correct</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">{totalAttempts} Attempted</span>
            </div>

            <button
              onClick={handleCompleteLesson}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-slate-600" />
              <span>Finish & View Report</span>
            </button>
          </div>
        </div>

        {/* 7-Step Progression Tracker */}
        <div className="grid grid-cols-7 gap-1.5 mt-4 pt-3 border-t border-slate-100">
          {FRACTION_TOPICS.map((topic, i) => {
            const isCompleted = i < currentTopicIdx || currentPhase === 'independent_assessment';
            const isCurrent = i === currentTopicIdx && currentPhase === 'guided_practice';
            const rec = conceptRecords[topic.id];
            const hasGap = rec?.hasUnresolvedMistake;

            return (
              <div
                key={topic.id}
                className="group relative cursor-pointer"
                onClick={() => {
                  setCurrentPhase('guided_practice');
                  setCurrentTopicIdx(i);
                  setCurrentQuestionIdx(0);
                }}
              >
                <div
                  className={`h-2 rounded-full transition-all ${
                    hasGap
                      ? 'bg-amber-400'
                      : isCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-sky-500'
                      : 'bg-slate-200'
                  }`}
                />
                <span className="hidden sm:block text-2xs text-slate-500 truncate mt-1">
                  {topic.order}. {topic.title.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Zone Sandbox Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Friendly Tutor Conversation Area */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 flex flex-col h-[650px] shadow-xs">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                LM
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  LearnMate AI Companion
                </h3>
                <p className="text-2xs text-emerald-700 font-medium">
                  Patient Socratic Tutor · Concept Adaptive
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVisualizer(!showVisualizer)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  showVisualizer
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showVisualizer ? 'Hide Visualizer' : 'Open Visualizer'}</span>
              </button>
            </div>
          </div>

          {/* Chat Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isTutor ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isTutor && (
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xs font-bold shrink-0 mt-0.5">
                      LM
                    </div>
                  )}

                  <div
                    className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                      isTutor
                        ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                        : 'bg-slate-900 text-white rounded-tr-xs'
                    }`}
                  >
                    {isTutor && msg.misconceptionDiagnosed && (
                      <div className="flex items-center gap-1.5 text-2xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Insight: {msg.misconceptionDiagnosed}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line">{msg.text}</div>

                    <div
                      className={`text-2xs ${
                        isTutor ? 'text-slate-400' : 'text-slate-400'
                      } text-right pt-1`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Helper Actions & Ask Bar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAskHint}
                disabled={isSubmitting || hasAnsweredCurrent}
                className="px-2.5 py-1 text-2xs font-semibold bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3 text-amber-600" />
                <span>Ask for a Socratic hint</span>
              </button>

              <button
                onClick={() => setShowWorkedExample(!showWorkedExample)}
                className="px-2.5 py-1 text-2xs font-semibold bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3 text-sky-600" />
                <span>{showWorkedExample ? 'Hide Rule & Example' : 'Review Concept Rule'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Zone: Interactive Practice Question Area */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Question Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  {activeQuestion.topicTitle}
                </span>
                {currentConceptRecord.consecutiveCorrect >= 1 && (
                  <span className="text-2xs font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    {currentConceptRecord.consecutiveCorrect} in a row
                  </span>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                  activeQuestion.difficulty === 'challenge'
                    ? 'bg-amber-100 text-amber-800'
                    : activeQuestion.difficulty === 'standard'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activeQuestion.difficulty.toUpperCase()}
              </span>
            </div>

            {/* Question Prompt */}
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {activeQuestion.prompt}
              </p>

              {activeQuestion.mathExpression && (
                <div className="mt-2 text-center py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-base font-bold font-mono text-slate-800">
                    {activeQuestion.mathExpression}
                  </span>
                </div>
              )}
            </div>

            {/* Answer Input Method */}
            <div className="space-y-3 pt-2">
              {activeQuestion.questionType === 'multiple_choice' && activeQuestion.options ? (
                <div className="space-y-2">
                  {activeQuestion.options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedOption === opt.value
                          ? 'border-sky-500 bg-sky-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mc_option"
                        value={opt.value}
                        checked={selectedOption === opt.value}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        disabled={hasAnsweredCurrent}
                        className="mt-0.5 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs text-slate-800 font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Your Fraction Answer:
                  </div>

                  {/* Dual Numerator / Denominator Box for Clean Fraction Inputs */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-300 w-32">
                      <input
                        type="text"
                        placeholder="Top"
                        value={inputNum}
                        onChange={(e) => setInputNum(e.target.value)}
                        disabled={hasAnsweredCurrent}
                        className="w-full text-center py-1 font-mono text-base font-bold text-slate-900 bg-white border border-slate-200 rounded focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                      <div className="w-full h-0.5 bg-slate-400 my-1.5" />
                      <input
                        type="text"
                        placeholder="Bottom"
                        value={inputDen}
                        onChange={(e) => setInputDen(e.target.value)}
                        disabled={hasAnsweredCurrent}
                        className="w-full text-center py-1 font-mono text-base font-bold text-slate-900 bg-white border border-slate-200 rounded focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="text-xs text-slate-500 flex-1">
                      <span>Or type standard notation (equivalent forms accepted):</span>
                      <input
                        type="text"
                        placeholder="e.g. 3/4 or 16"
                        value={studentInput}
                        onChange={(e) => setStudentInput(e.target.value)}
                        disabled={hasAnsweredCurrent}
                        className="mt-1 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col gap-2">
                {!hasAnsweredCurrent ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || (!selectedOption && !inputNum && !studentInput)}
                    className="w-full py-2.5 px-4 bg-sky-600 text-white font-semibold text-xs rounded-lg hover:bg-sky-700 transition-colors shadow-xs disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Checking with Tutor...' : 'Submit Answer'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                ) : lastAttemptCorrect ? (
                  currentConceptRecord.consecutiveCorrect >= 2 && availableChallenge ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleLoadChallengeQuestion}
                        className="w-full py-2.5 px-4 bg-sky-600 text-white font-semibold text-xs rounded-lg hover:bg-sky-700 transition-colors shadow-xs flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Take on Harder Challenge Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleMoveToNextTopic}
                        className="w-full py-2 px-4 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
                      >
                        <span>Move Forward to Next Topic</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 px-4 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )
                ) : (
                  /* Requirement 1: Removed 'Understood, Next'. Student MUST retry to demonstrate understanding. Separate leave option provided. */
                  <div className="space-y-2">
                    <button
                      onClick={handleTryAgain}
                      className="w-full py-2.5 px-4 bg-sky-600 text-white font-semibold text-xs rounded-lg hover:bg-sky-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try Again to Demonstrate Understanding</span>
                    </button>
                    <div className="text-center pt-1">
                      <button
                        onClick={handleLeaveLessonEarly}
                        className="text-2xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
                      >
                        Leave lesson early (will not mark current concept as mastered)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Answer Result Banner */}
              {hasAnsweredCurrent && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    lastAttemptCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {lastAttemptCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">
                      {lastAttemptCorrect ? 'Correct! Tino pai!' : 'Guided Feedback Provided'}
                    </span>
                    <p className="mt-0.5 text-2xs leading-relaxed">
                      {lastAttemptCorrect
                        ? 'You demonstrated solid conceptual understanding. Check the tutor conversation on the left!'
                        : 'Review the friendly explanation from LearnMate on the left, then click "Try Again" to demonstrate understanding!'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Worked Example & Key Rule Drawer */}
          {showWorkedExample && (
            <div className="bg-sky-50/70 rounded-xl border border-sky-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-800">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Concept Rule & Worked Example</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {currentTopic.keyRule}
              </p>
              <div className="p-3 bg-white rounded-lg border border-sky-200 space-y-2 text-xs">
                <span className="font-semibold text-sky-900 block">
                  Example: {currentTopic.workedExample.question}
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-2xs">
                  {currentTopic.workedExample.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
                <div className="font-semibold text-emerald-700 text-2xs pt-1 border-t border-slate-100">
                  Result: {currentTopic.workedExample.answer}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Visualizer Embed (when toggled or triggered) */}
          {showVisualizer && (
            <FractionVisualizer
              initialNumerator={activeQuestion.visualModel?.numerator || 3}
              initialDenominator={activeQuestion.visualModel?.denominator || 4}
              initialSecondNumerator={activeQuestion.visualModel?.secondNumerator || 6}
              initialSecondDenominator={activeQuestion.visualModel?.secondDenominator || 8}
              contextTitle={`Visual model for ${activeQuestion.topicTitle}`}
            />
          )}

          {/* Student Scratchpad */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Digital Working Scratchpad</span>
              <button
                onClick={() => setScratchpadText('')}
                className="text-2xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Clear</span>
              </button>
            </div>
            <textarea
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
              placeholder="Use this space to write notes, factors, or working steps..."
              rows={3}
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
