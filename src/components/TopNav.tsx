import React from 'react';
import { Sparkles, Compass, BookOpen, Layers, CheckCircle2, FlaskConical } from 'lucide-react';

interface TopNavProps {
  activeTab: 'curriculum' | 'lesson' | 'visualizer' | 'personas' | 'report';
  setActiveTab: (tab: 'curriculum' | 'lesson' | 'visualizer' | 'personas' | 'report') => void;
  onQuickStart: () => void;
  hasActiveSession?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickStart,
  hasActiveSession,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => setActiveTab('lesson')}
          className="text-left group flex items-center gap-2 cursor-pointer"
        >
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors whitespace-nowrap shrink-0">
            LearnMate AI
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-normal">
            · NZ Secondary Tutor
          </span>
        </button>

        {/* Zone 2: 4-5 Concise Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'curriculum' ? 'text-sky-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Curriculum</span>
          </button>

          <button
            onClick={() => setActiveTab('lesson')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'lesson' ? 'text-sky-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Year 9 Fractions</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'visualizer' ? 'text-sky-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Visualizer</span>
          </button>

          <button
            onClick={() => setActiveTab('personas')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'personas' ? 'text-sky-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Test Personas</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'report' ? 'text-sky-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lesson Report</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickStart}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{hasActiveSession ? 'Current Lesson' : 'Start Year 9 Maths'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row (only on small screens) */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 gap-4 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'curriculum' ? 'text-sky-700 font-bold' : ''}`}
        >
          Curriculum
        </button>
        <button
          onClick={() => setActiveTab('lesson')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'lesson' ? 'text-sky-700 font-bold' : ''}`}
        >
          Year 9 Fractions
        </button>
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'visualizer' ? 'text-sky-700 font-bold' : ''}`}
        >
          Visualizer
        </button>
        <button
          onClick={() => setActiveTab('personas')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'personas' ? 'text-sky-700 font-bold' : ''}`}
        >
          Test Personas
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'report' ? 'text-sky-700 font-bold' : ''}`}
        >
          Report
        </button>
      </div>
    </header>
  );
};
