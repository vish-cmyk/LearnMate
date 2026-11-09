import React, { useState } from 'react';
import { CURRICULUM_DATA, SUBJECT_OPTIONS } from '../data/curriculumData';
import { SubjectId, YearLevel } from '../types';
import { Calculator, BookOpen, Atom, ArrowRight, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CurriculumBrowserProps {
  onSelectTopic: (topicId: string) => void;
  onLaunchActiveFractions: () => void;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  onLaunchActiveFractions,
}) => {
  const [selectedYear, setSelectedYear] = useState<YearLevel>(9);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('mathematics');

  const filteredTopics = CURRICULUM_DATA.filter(
    (t) => t.year === selectedYear && t.subject === selectedSubject
  );

  const getSubjectIcon = (subId: SubjectId) => {
    switch (subId) {
      case 'mathematics':
        return <Calculator className="w-4 h-4" />;
      case 'english':
        return <BookOpen className="w-4 h-4" />;
      case 'science':
        return <Atom className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Editorial Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>New Zealand Secondary Curriculum</span>
              <span aria-hidden="true">·</span>
              <span>Ages 13–18</span>
              <span aria-hidden="true">·</span>
              <span>Years 9–13</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Curriculum Pathways & Learning Areas
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Select your school year and subject below. All learning areas are mapped directly to official New Zealand secondary curriculum standards.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified Curriculum Framework</span>
          </div>
        </div>

        {/* Year Level Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {([9, 10, 11, 12, 13] as YearLevel[]).map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  selectedYear === yr
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Year {yr} {yr >= 11 ? `(NCEA L${yr - 10})` : ''}
              </button>
            ))}
          </div>

          {/* Subject Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {SUBJECT_OPTIONS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  selectedSubject === sub.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {getSubjectIcon(sub.id)}
                <span>{sub.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Prototype Banner (when on Year 9 Maths) */}
      {selectedYear === 9 && selectedSubject === 'mathematics' && (
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-800">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              <span>ACTIVE WORKING LESSON PROTOTYPE</span>
              <span aria-hidden="true">·</span>
              <span>Year 9 Mathematics</span>
            </div>
            <h2 className="text-lg font-bold text-sky-950">
              Fractions: Concepts, Operations & Practical Applications
            </h2>
            <p className="text-xs text-sky-800 max-w-xl">
              Complete adaptive tutor module covering numerators, denominators, equivalent fractions, simplification, comparison, 4 operations, and word problems with Socratic AI feedback.
            </p>
          </div>

          <button
            onClick={onLaunchActiveFractions}
            className="px-4 py-2.5 bg-sky-600 text-white font-semibold text-xs rounded-lg hover:bg-sky-700 transition-colors shadow-xs flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <span>Launch Fractions Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Topics Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing learning modules for <strong className="text-slate-800">Year {selectedYear} {SUBJECT_OPTIONS.find((s) => s.id === selectedSubject)?.name}</strong>
          </span>
          <span>{filteredTopics.length} learning modules catalogued</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic) => {
            const isActive = topic.status === 'active';
            return (
              <div
                key={topic.id}
                className={`bg-white rounded-xl border p-5 transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-sky-300 ring-1 ring-sky-200 shadow-xs'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <span className="font-medium text-slate-500">
                      {topic.nzCurriculumStrand || 'NZ Curriculum Standard'}
                    </span>

                    {isActive ? (
                      <span className="flex items-center gap-1 text-sky-700 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        <span>Ready to Learn</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 font-medium text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Planned Module</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {isActive ? 'Full adaptive tutor ready' : 'Curriculum blueprint verified'}
                  </span>

                  {isActive ? (
                    <button
                      onClick={onLaunchActiveFractions}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <span>Start Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      In Development
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Disclaimer Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          Official New Zealand Curriculum Architecture Transparency:
        </p>
        <p>
          LearnMate AI follows the New Zealand Curriculum (NZC) learning progressions from Level 4–5 (Years 9–10) through NCEA Levels 1, 2, and 3 (Years 11–13). For this working prototype, <strong>Year 9 Mathematics – Fractions</strong> is the fully implemented interactive learning module. Other curriculum strands are displayed to illustrate the planned multi-year platform architecture without misrepresenting unfinished syllabus units.
        </p>
      </div>
    </div>
  );
};
