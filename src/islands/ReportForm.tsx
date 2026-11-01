import { useEffect, useMemo, useState } from 'preact/hooks';
import { isConnected, isDemo, submitResult } from '../lib/api';
import { ensureSession } from '../lib/session';
import { localTodayIso } from '../lib/time';
import {
  APPLICANT_LABELS,
  CHANNEL_LABELS,
  DECISIONS,
  DECISION_LABELS,
  GPA_LABELS,
  type Decision,
  type ProgramSummary,
} from '../lib/types';
import { programLabel } from '../lib/labels';

interface Props {
  programs: ProgramSummary[];
  cycleId: string;
  cycleLabel: string;
}

const NOTE_LIMIT = 500;

export default function ReportForm({ programs, cycleId, cycleLabel }: Props) {
  const today = localTodayIso();
  const sorted = useMemo(
    () => [...programs].sort((a, b) => a.short.localeCompare(b.short) || a.name.localeCompare(b.name)),
    [programs],
  );

  const [program, setProgram] = useState('');
  const [query, setQuery] = useState('');
  const [decision, setDecision] = useState<Decision | ''>('');
  const [decidedOn, setDecidedOn] = useState(today);
  const [channel, setChannel] = useState('');
  const [applicantType, setApplicantType] = useState('');
  const [gpaBand, setGpaBand] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // The list is long, so a search box narrows it. The chosen program always stays in the list.
  // An umbrella program also matches its home areas or tracks, and then says which one matched.
  const shown = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches: { p: ProgramSummary; track?: string }[] = [];
    for (const p of sorted) {
      const base = `${p.short} ${p.name} ${p.institution}`.toLowerCase();
      if (words.every((w) => base.includes(w))) {
        matches.push({ p });
        continue;
      }
      const track = p.tracks?.find((t) => {
        const text = `${base} ${t.toLowerCase()}`;
        return words.every((w) => text.includes(w));
      });
      if (track) matches.push({ p, track });
      else if (p.slug === program) matches.push({ p });
    }
    return matches;
  }, [sorted, query, program]);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('program');
    if (slug && programs.some((p) => p.slug === slug)) setProgram(slug);
  }, [programs]);

  const live = isConnected || isDemo;
  if (!live) {
    return (
      <div class="empty">
        <p>Reporting switches on once the database is connected.</p>
      </div>
    );
  }
  if (done) {
    const chosen = programs.find((p) => p.slug === done);
    return (
      <div class="notice notice--success" role="status">
        <p>
          <strong>Posted. Thank you.</strong> Everyone waiting on {chosen ? programLabel(chosen.short, chosen.name) : 'this program'}{' '}
          can see it now.
        </p>
        <p>
          <a href={`/programs/${done}/`}>See all results for this program</a> or{' '}
          <button
            type="button"
            class="link-button"
            onClick={() => {
              setDone(null);
              setDecision('');
              setNote('');
            }}
          >
            report another result
          </button>
          .
        </p>
      </div>
    );
  }

  async function onSubmit(event: Event) {
    event.preventDefault();
    setError(null);
    if (!program) return setError('Choose the program you heard from.');
    if (!decision) return setError('Choose what you heard.');
    if (!decidedOn || decidedOn > today) return setError('Choose the date you heard back. It cannot be in the future.');
    setBusy(true);
    try {
      await ensureSession();
      await submitResult({
        programSlug: program,
        cycleId,
        decision,
        decidedOn,
        channel,
        applicantType,
        gpaBand,
        note,
      });
      setDone(program);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form class="form" onSubmit={onSubmit} noValidate>
      <div class="field">
        <label for="program">Program</label>
        <label class="visually-hidden" for="program-search">
          Find a program by name or university
        </label>
        <input
          id="program-search"
          type="search"
          placeholder="Search by university or program"
          autocomplete="off"
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        />
        <select
          id="program"
          value={program}
          onChange={(e) => setProgram((e.target as HTMLSelectElement).value)}
          required
        >
          <option value="">
            {shown.length === sorted.length
              ? 'Choose a program'
              : shown.length === 0
                ? 'No programs match'
                : `Choose from ${shown.length} ${shown.length === 1 ? 'match' : 'matches'}`}
          </option>
          {shown.map(({ p, track }) => (
            <option value={p.slug}>
              {p.short}: {p.name}
              {track ? ` (includes ${track})` : ''}
            </option>
          ))}
        </select>
        <p class="hint">
          For {cycleLabel}. Program missing? <a href="/about/#corrections">Tell us</a>.
        </p>
      </div>

      <fieldset class="field">
        <legend>What did you hear?</legend>
        <div class="choices">
          {DECISIONS.map((d) => (
            <label class="choice">
              <input
                type="radio"
                name="decision"
                value={d}
                checked={decision === d}
                onChange={() => setDecision(d)}
              />
              <span>
                <span class={`chip chip--${d}`}>{d === 'interview' ? 'Interview invite' : DECISION_LABELS[d]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div class="field">
        <label for="decided-on">Date you heard</label>
        <input
          id="decided-on"
          type="date"
          value={decidedOn}
          max={today}
          onChange={(e) => setDecidedOn((e.target as HTMLInputElement).value)}
          required
        />
      </div>

      <fieldset class="field">
        <legend>How did you hear? (optional)</legend>
        <div class="choices choices--wide">
          {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
            <label class="choice">
              <input
                type="radio"
                name="channel"
                value={value}
                checked={channel === value}
                onClick={() => channel === value && setChannel('')}
                onChange={() => setChannel(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset class="field">
        <legend>You applied as (optional)</legend>
        <div class="choices">
          {Object.entries(APPLICANT_LABELS).map(([value, label]) => (
            <label class="choice">
              <input
                type="radio"
                name="applicant"
                value={value}
                checked={applicantType === value}
                onClick={() => applicantType === value && setApplicantType('')}
                onChange={() => setApplicantType(value)}
              />
              <span>{label.replace(' applicant', '')}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div class="field">
        <label for="gpa">Undergraduate GPA (optional)</label>
        <select id="gpa" value={gpaBand} onChange={(e) => setGpaBand((e.target as HTMLSelectElement).value)}>
          <option value="">Prefer not to say</option>
          {Object.entries(GPA_LABELS).map(([value, label]) => (
            <option value={value}>{label.replace('GPA ', '')} on a 4.0 scale</option>
          ))}
        </select>
        <p class="hint">
          Helps people with a similar GPA see where others got in. Skip it if your grades aren't on a 4.0 scale.
        </p>
      </div>

      <div class="field">
        <label for="note">Note (optional)</label>
        <textarea
          id="note"
          maxLength={NOTE_LIMIT}
          value={note}
          onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
          placeholder="For example: Zoom interview invite for early February."
        />
        <p class="hint">
          Don't include your name or anything that could identify you. {NOTE_LIMIT - note.length} characters left.
        </p>
      </div>

      {error && (
        <p class="notice notice--error" role="alert">
          {error}
        </p>
      )}

      <div>
        <button type="submit" class="btn" disabled={busy}>
          {busy ? 'Posting…' : 'Post result'}
        </button>
      </div>
      <p class="small muted">
        Your report shows the decision, date and anything optional you add. It never shows your name or email.
      </p>
    </form>
  );
}
