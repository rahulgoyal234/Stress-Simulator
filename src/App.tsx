import { useState, useRef } from 'react';
import { Hero } from './components/Hero';
import { InputCard } from './components/InputCard';
import { ResultView } from './components/ResultView';
import { Scene3D } from './components/Scene3D';
import { Footer } from './components/Footer';
import { IntensityLevel, StressTestResult } from './types/stress';

export default function App() {
  const [situation, setSituation] = useState('');
  const [intensity, setIntensity] = useState<IntensityLevel>('Severe');
  const [loading, setLoading] = useState(false);
  const [reRunning, setReRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StressTestResult | null>(null);

  const inputSectionRef = useRef<HTMLDivElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRunStressTest = async () => {
    if (!situation.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stress-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          situation: situation.trim(),
          intensity
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with status ${response.status}`
        );
      }

      const data: StressTestResult = await response.json();
      setResult(data);

      // Smooth scroll to results
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    } catch (err: any) {
      console.error('Error running stress test:', err);
      setError(
        err.message ||
          'Failed to complete stress test. Please ensure the prompt is clear and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddShock = async (newShock: string) => {
    if (!newShock.trim() || reRunning || !result) return;

    setReRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/stress-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          situation: situation.trim(),
          intensity,
          newShock: newShock.trim(),
          previousSummary: result.summary,
          previousBreakingPoint: result.breaking_point
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with status ${response.status}`
        );
      }

      const data: StressTestResult = await response.json();
      setResult(data);

      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error('Error adding shock:', err);
      setError(
        err.message ||
          'Failed to re-simulate with new shock. Please verify input and retry.'
      );
    } finally {
      setReRunning(false);
    }
  };

  const handleClear = () => {
    setSituation('');
    setError(null);
  };

  // 3D scene status
  const sceneStatus: 'idle' | 'running' | 'result' =
    loading || reRunning ? 'running' : result ? 'result' : 'idle';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-violet-500/30 selection:text-white font-sans relative">
      {/* Three.js 3D Background */}
      <Scene3D status={sceneStatus} result={result} />

      {/* Main content scroll container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <Hero onScrollClick={handleScrollToInput} />

        {/* Input Crucible Section */}
        <section ref={inputSectionRef} className="py-12 sm:py-16">
          <InputCard
            situation={situation}
            setSituation={setSituation}
            intensity={intensity}
            setIntensity={setIntensity}
            loading={loading}
            error={error}
            onSubmit={handleRunStressTest}
            onClear={handleClear}
          />
        </section>

        {/* Results Section */}
        {result && (
          <section ref={resultSectionRef}>
            <ResultView
              result={result}
              onAddShock={handleAddShock}
              reRunning={reRunning}
            />
          </section>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
