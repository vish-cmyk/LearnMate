import React, { useState } from 'react';
import { Layers, PieChart, GitCompare, RotateCcw, Plus, Minus } from 'lucide-react';

interface FractionVisualizerProps {
  initialNumerator?: number;
  initialDenominator?: number;
  initialSecondNumerator?: number;
  initialSecondDenominator?: number;
  contextTitle?: string;
  onClose?: () => void;
}

export const FractionVisualizer: React.FC<FractionVisualizerProps> = ({
  initialNumerator = 3,
  initialDenominator = 4,
  initialSecondNumerator = 6,
  initialSecondDenominator = 8,
  contextTitle,
}) => {
  const [mode, setMode] = useState<'bar' | 'circle' | 'compare'>('bar');
  const [num1, setNum1] = useState<number>(Math.min(initialNumerator, 16));
  const [den1, setDen1] = useState<number>(Math.max(initialDenominator, 1));
  const [num2, setNum2] = useState<number>(Math.min(initialSecondNumerator, 16));
  const [den2, setDen2] = useState<number>(Math.max(initialSecondDenominator, 1));

  // Update when props change
  React.useEffect(() => {
    if (initialNumerator) setNum1(initialNumerator);
    if (initialDenominator) setDen1(initialDenominator);
    if (initialSecondNumerator) setNum2(initialSecondNumerator);
    if (initialSecondDenominator) setDen2(initialSecondDenominator);
  }, [initialNumerator, initialDenominator, initialSecondNumerator, initialSecondDenominator]);

  const value1 = Math.min(Math.max(num1 / den1, 0), 2);
  const value2 = Math.min(Math.max(num2 / den2, 0), 2);
  const percentage1 = Math.round(value1 * 100);
  const percentage2 = Math.round(value2 * 100);

  // SVG Pie slices calculation
  const renderCircleSlices = (numerator: number, denominator: number, radius = 70, cx = 90, cy = 90) => {
    const safeDenominator = Math.max(denominator, 1);
    const safeNumerator = Math.min(Math.max(numerator, 0), safeDenominator);
    const slices = [];
    const angleStep = (2 * Math.PI) / safeDenominator;

    for (let i = 0; i < safeDenominator; i++) {
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle = (i + 1) * angleStep - Math.PI / 2;
      const isShaded = i < safeNumerator;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const largeArc = angleStep > Math.PI ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      slices.push(
        <path
          key={i}
          d={pathData}
          className={`${
            isShaded ? 'fill-sky-500 stroke-white' : 'fill-slate-100 stroke-slate-300'
          } transition-all duration-200`}
          strokeWidth="1.5"
        />
      );
    }
    return slices;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Interactive Fraction Visualizer
          </h3>
          <p className="text-xs text-slate-500">
            {contextTitle || 'Explore bar, circle, and equivalent comparison models'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('bar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bar Model</span>
          </button>
          <button
            onClick={() => setMode('circle')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'circle' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Circle / Pie</span>
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="py-5">
        {mode === 'bar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-slate-900">
                Fraction Value: <span className="text-sky-700 font-semibold">{num1}/{den1}</span>
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {percentage1}% of whole · {(num1 / den1).toFixed(3)}
              </span>
            </div>

            {/* Fraction Bar Model */}
            <div className="w-full bg-slate-100 rounded-lg p-1.5 border border-slate-200">
              <div className="grid h-14 w-full gap-1" style={{ gridTemplateColumns: `repeat(${den1}, minmax(0, 1fr))` }}>
                {Array.from({ length: den1 }).map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setNum1(idx + 1)}
                    className={`h-full rounded cursor-pointer transition-all flex items-center justify-center text-xs font-medium select-none ${
                      idx < num1
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                    title={`Piece ${idx + 1} of ${den1}`}
                  >
                    1/{den1}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Click any block above to adjust shaded pieces, or use the controls below:
            </p>

            {/* Stepper Controls */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">Numerator (Top)</span>
                  <span className="text-base font-semibold text-slate-800 font-mono tabular-nums">{num1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNum1(Math.max(0, num1 - 1))}
                    disabled={num1 <= 0}
                    className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Decrease numerator"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setNum1(Math.min(den1, num1 + 1))}
                    disabled={num1 >= den1}
                    className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Increase numerator"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">Denominator (Bottom)</span>
                  <span className="text-base font-semibold text-slate-800 font-mono tabular-nums">{den1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (den1 > 1) {
                        const newDen = den1 - 1;
                        setDen1(newDen);
                        if (num1 > newDen) setNum1(newDen);
                      }
                    }}
                    disabled={den1 <= 1}
                    className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Decrease denominator"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (den1 < 16) setDen1(den1 + 1);
                    }}
                    disabled={den1 >= 16}
                    className="p-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Increase denominator"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'circle' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <svg width="180" height="180" className="mx-auto overflow-visible">
                {renderCircleSlices(num1, den1, 80, 90, 90)}
                <circle cx="90" cy="90" r="14" fill="white" className="stroke-slate-300" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="text-center">
              <span className="inline-block text-sm font-semibold text-slate-900">
                {num1} of {den1} equal slices shaded ({num1}/{den1})
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Each slice represents exactly 1/{den1} of the entire circle.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setNum1(Math.max(0, num1 - 1))}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
              >
                Eat 1 Slice (-1)
              </button>
              <button
                onClick={() => setNum1(Math.min(den1, num1 + 1))}
                className="px-3 py-1.5 text-xs font-medium bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                Add 1 Slice (+1)
              </button>
            </div>
          </div>
        )}

        {mode === 'compare' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fraction 1 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">Fraction A: {num1}/{den1}</span>
                  <span className="font-mono tabular-nums text-slate-500">{percentage1}%</span>
                </div>
                <div className="grid h-10 w-full gap-0.5 bg-slate-200 p-1 rounded" style={{ gridTemplateColumns: `repeat(${den1}, minmax(0, 1fr))` }}>
                  {Array.from({ length: den1 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full rounded-xs ${i < num1 ? 'bg-sky-500' : 'bg-white'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => setNum1(Math.max(0, num1 - 1))}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                  >
                    -1
                  </button>
                  <span className="text-slate-500">{num1} / {den1}</span>
                  <button
                    onClick={() => setNum1(Math.min(den1, num1 + 1))}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Fraction 2 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">Fraction B: {num2}/{den2}</span>
                  <span className="font-mono tabular-nums text-slate-500">{percentage2}%</span>
                </div>
                <div className="grid h-10 w-full gap-0.5 bg-slate-200 p-1 rounded" style={{ gridTemplateColumns: `repeat(${den2}, minmax(0, 1fr))` }}>
                  {Array.from({ length: den2 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full rounded-xs ${i < num2 ? 'bg-emerald-500' : 'bg-white'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => setNum2(Math.max(0, num2 - 1))}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                  >
                    -1
                  </button>
                  <span className="text-slate-500">{num2} / {den2}</span>
                  <button
                    onClick={() => setNum2(Math.min(den2, num2 + 1))}
                    className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Comparison Result Banner */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
              {value1 === value2 ? (
                <div className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-2">
                  <span>Equivalent!</span>
                  <span className="text-slate-400">·</span>
                  <span>{num1}/{den1} and {num2}/{den2} represent the exact same amount.</span>
                </div>
              ) : value1 > value2 ? (
                <div className="text-xs font-semibold text-sky-700 flex items-center justify-center gap-2">
                  <span>{num1}/{den1} is GREATER than {num2}/{den2}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-normal">({percentage1}% vs {percentage2}%)</span>
                </div>
              ) : (
                <div className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-2">
                  <span>{num2}/{den2} is GREATER than {num1}/{den1}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-normal">({percentage2}% vs {percentage1}%)</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span>Model updates dynamically as values change</span>
        <button
          onClick={() => {
            setNum1(initialNumerator);
            setDen1(initialDenominator);
            setNum2(initialSecondNumerator);
            setDen2(initialSecondDenominator);
          }}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Values</span>
        </button>
      </div>
    </div>
  );
};
