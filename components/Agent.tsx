"use client";

import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { z } from 'zod';
import { leadSchema } from '@/lib/lead';

const steps = [
  { key: 'name', label: "What's your name?", placeholder: 'Jane Doe', required: true },
  { key: 'email', label: 'Work email?', placeholder: 'jane@company.com', required: true },
  { key: 'company', label: 'Company name?', placeholder: 'Acme Inc', required: true },
  { key: 'website', label: 'Current website (if any)?', placeholder: 'https://acme.com', required: false },
  { key: 'services', label: 'What do you need?', placeholder: 'New site, redesign, SEO, etc.', required: true },
  { key: 'budget', label: 'Rough budget?', placeholder: '$5k - $15k', required: false },
  { key: 'timeline', label: 'Timeline?', placeholder: '2-4 weeks', required: false },
  { key: 'goals', label: 'Top 1-2 goals?', placeholder: 'Increase conversions, improve brand, faster load time', required: true },
] as const;

type StepKey = typeof steps[number]['key'];

type LeadDraft = Partial<z.infer<typeof leadSchema>> & Record<StepKey, string | undefined>;

export default function Agent() {
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<LeadDraft>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { id?: string; message: string; payload: any }>(null);
  const [error, setError] = useState<string | null>(null);

  const progress = ((current) / steps.length) * 100;

  const summary = useMemo(() => generateSummary(values), [values]);

  const step = steps[current];

  function onNext() {
    if (!step) return;
    const v = (values[step.key] || '').trim();
    if (step.required && v.length === 0) return;
    if (current < steps.length - 1) setCurrent((c) => c + 1);
  }

  function onBack() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = buildPayload(values);
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to submit');
      setResult({ id: data?.id, message: 'Submitted successfully', payload: data?.payload ?? payload });
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const done = current >= steps.length;

  return (
    <div className="grid gap-6">
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full bg-primary-600" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>

      {!done ? (
        <div className="grid gap-4">
          <div className="text-lg md:text-xl font-medium">{step.label}</div>
          <input
            className="input"
            placeholder={step.placeholder}
            value={values[step.key] || ''}
            onChange={(e) => setValues((v) => ({ ...v, [step.key]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onNext();
            }}
            autoFocus
          />
          <div className="flex items-center gap-3">
            <button className={clsx('btn', 'min-w-24')} onClick={onBack} disabled={current === 0}>Back</button>
            <button
              className={clsx('btn', 'min-w-24')}
              onClick={onNext}
              disabled={step.required && !(values[step.key] || '').trim()}
            >Next</button>
            <div className="text-slate-400 text-sm">Step {current + 1} of {steps.length}</div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Tailored Value Summary</h2>
            <div className="card p-4 text-slate-200 whitespace-pre-wrap">
              {summary}
            </div>
            <div className="flex gap-3">
              <button className="btn" onClick={() => copyToClipboard(summary)}>Copy Summary</button>
            </div>
          </div>
          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Your Details</h2>
            <div className="grid gap-3 text-slate-200">
              {steps.map((s) => (
                <div key={s.key} className="grid gap-1">
                  <div className="text-sm text-slate-400">{s.label}</div>
                  <div className="card p-3">{values[s.key] || '?'}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="btn" onClick={onSubmit} disabled={submitting}>
                {submitting ? 'Submitting?' : 'Submit Lead'}
              </button>
              <button className="btn bg-slate-700 hover:bg-slate-600" onClick={() => setCurrent(0)}>Start Over</button>
            </div>
            {error && <div className="text-red-400">{error}</div>}
            {result && (
              <div className="card p-3 grid gap-2">
                <div className="text-green-400">{result.message}</div>
                <button className="btn w-fit" onClick={() => copyToClipboard(JSON.stringify(result.payload, null, 2))}>Copy Lead JSON</button>
                <a className="btn w-fit bg-emerald-600 hover:bg-emerald-500" href={`mailto:${values.email}?subject=Web%20Design%20Project&body=${encodeURIComponent(summary)}`}>Email Me This</a>
              </div>
            )}
          </div>
        </div>
      )}

      {!done && (
        <div className="text-slate-300 text-sm">
          Your answers will generate a tailored plan and quote range.
        </div>
      )}

      {current < steps.length && (
        <button
          className="btn w-full md:w-auto"
          onClick={() => setCurrent(steps.length)}
        >Skip to Summary</button>
      )}
    </div>
  );
}

function buildPayload(values: LeadDraft) {
  return leadSchema.parse({
    name: values.name?.trim() || '',
    email: values.email?.trim() || '',
    company: values.company?.trim() || '',
    website: (values.website || '').trim() || undefined,
    services: values.services?.trim() || '',
    budget: (values.budget || '').trim() || undefined,
    timeline: (values.timeline || '').trim() || undefined,
    goals: values.goals?.trim() || '',
    source: 'agent',
  });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function generateSummary(values: LeadDraft) {
  const name = values.name || 'there';
  const company = values.company || 'your team';
  const services = values.services || 'web design';
  const goals = values.goals || 'improve your site';
  const timeline = values.timeline || 'your preferred timeline';
  const budget = values.budget || 'your budget range';
  const website = values.website || 'your current site';

  return [
    `Hi ${name}, here?s a focused plan for ${company}:`,
    '',
    `Objectives: ${goals}.` ,
    '',
    'Recommended Work:',
    `? ${services} tailored to your brand and audience`,
    '? Conversion-focused layouts with clear CTAs',
    '? Responsive, fast-loading pages (LCP < 2.5s targets)',
    '? SEO-ready structure and analytics setup',
    website ? `? Content and UX updates informed by current site: ${website}` : '? Content strategy and UX guidance',
    '',
    'Timeline & Budget:',
    `? Estimated timeline: ${timeline}`,
    `? Budget guidance: ${budget}`,
    '',
    'Next Steps:',
    '? Share any brand assets or references',
    '? We?ll map a site structure and low-fidelity wireframes',
    '? Then finalize scope and quote',
  ].join('\n');
}
