import { AddressInfo } from 'node:net';

process.env.NODE_ENV = 'test';
delete process.env.GEMINI_API_KEY;

const { app } = await import('../server.ts');

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Session API assertion failed: ${message}`);
}

async function post(baseUrl: string, path: string, body: Record<string, unknown> = {}) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function runSessionApiTests(): Promise<void> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const startResponse = await post(baseUrl, '/api/tutor/session/start', {
      initialPhase: 'diagnostic',
      initialTopicId: 'numerators-denominators',
      initialQuestionId: 'diag-1',
    });
    const started = await startResponse.json() as any;
    assert(startResponse.status === 200 && started.success, 'session should start successfully');
    assert(started.snapshot.activeQuestion.id === 'diag-1', 'session should return its first diagnostic question');
    assert(!('correctAnswer' in started.snapshot.activeQuestion), 'session response must not expose the correct answer');
    assert(!('commonMisconceptions' in started.snapshot.activeQuestion), 'session response must not expose answer-pattern keys');

    const sessionId = started.sessionId as string;
    const staleResponse = await post(baseUrl, `/api/tutor/session/${sessionId}/answer`, {
      questionId: 'diag-2',
      studentMessage: '6/15',
    });
    assert(staleResponse.status === 409, 'server must reject an answer for a question that is not active');

    const firstAnswerResponse = await post(baseUrl, `/api/tutor/session/${sessionId}/answer`, {
      questionId: 'diag-1',
      studentMessage: '3/8',
    });
    const firstAnswer = await firstAnswerResponse.json() as any;
    assert(firstAnswerResponse.status === 200 && firstAnswer.data.assessment === 'correct', 'server must correctly assess the first answer');
    assert(firstAnswer.snapshot.totalAttempts === 1 && firstAnswer.snapshot.correctCount === 1, 'server must own the session counters');

    const advanceResponse = await post(baseUrl, `/api/tutor/session/${sessionId}/advance`);
    const advanced = await advanceResponse.json() as any;
    assert(advanceResponse.status === 200 && advanced.advanced, 'server should advance after a correct answer');
    assert(advanced.snapshot.activeQuestion.id === 'diag-2', 'server should choose the next diagnostic question');

    const secondAnswerResponse = await post(baseUrl, `/api/tutor/session/${sessionId}/answer`, {
      questionId: 'diag-2',
      studentMessage: '6/15',
    });
    const secondAnswer = await secondAnswerResponse.json() as any;
    assert(secondAnswer.data.assessment === 'correct', 'server should accept an equivalent fraction answer');

    const finishResponse = await post(baseUrl, `/api/tutor/session/${sessionId}/finish`, {
      assessmentCompleted: false,
    });
    const finished = await finishResponse.json() as any;
    assert(finishResponse.status === 200 && finished.success, 'session should produce an early-exit report');
    assert(finished.summary.assessmentCompleted === false, 'early exit must not claim assessment completion');

    const expiredResponse = await post(baseUrl, `/api/tutor/session/${sessionId}/advance`);
    assert(expiredResponse.status === 404, 'finished session should be removed from server memory');

    console.log('  ✓ PASS: HTTP session lifecycle, server-owned assessment, and answer-key privacy');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

await runSessionApiTests();
