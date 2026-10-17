/**
 * Helpers for the program catalog (src/data/programs). Used at build time.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ProgramSummary } from './types';

export type Program = CollectionEntry<'programs'>;
export type Deadline = Program['data']['deadlines'][number];

export function firstDeadline(program: Program): Deadline | undefined {
  return [...program.data.deadlines].sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** All programs, soonest deadline first. */
export async function getPrograms(): Promise<Program[]> {
  const all = await getCollection('programs');
  return all.sort((a, b) => {
    const da = firstDeadline(a)?.date ?? '9999-12-31';
    const db = firstDeadline(b)?.date ?? '9999-12-31';
    return da.localeCompare(db) || a.data.institution.localeCompare(b.data.institution);
  });
}

export function shortName(program: Program): string {
  return program.data.institutionShort ?? program.data.institution;
}

/** Small, serialisable version of a program for interactive parts of the page. */
export function toSummary(program: Program): ProgramSummary {
  const deadline = firstDeadline(program);
  return {
    slug: program.id,
    name: program.data.name,
    institution: program.data.institution,
    short: shortName(program),
    country: program.data.country,
    deadline: deadline
      ? { date: deadline.date, time: deadline.time, timezone: deadline.timezone }
      : undefined,
  };
}

export const GRE_LABELS: Record<string, string> = {
  required: 'Required',
  optional: 'Optional',
  'not-required': 'Not required',
  'not-accepted': 'Not accepted: scores are not considered',
  unknown: '',
};

export function greNotNeeded(program: Program): boolean {
  return ['optional', 'not-required', 'not-accepted'].includes(program.data.requirements.gre);
}

export const WAIVER_LABELS: Record<string, string> = {
  available: 'Fee waivers available',
  'domestic-only': 'Fee waivers for domestic applicants only',
  'not-available': 'No fee waivers',
  unknown: 'Fee waivers not stated',
};

export const INTERNATIONAL_FUNDING_LABELS: Record<string, string> = {
  yes: 'Funding covers international students',
  limited: 'Limited funding for international students',
  no: 'No funding for international students',
  unknown: 'Funding for international students not stated',
};

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function countryName(code: string): string {
  return regionNames.of(code) ?? code;
}

export const FIELD_LABELS: Record<string, string> = {
  biology: 'Biology and biomedical sciences',
};

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/-/g, ' ');
}

/** Lowercase text used by the search box on the programs page. */
export function searchText(program: Program): string {
  const d = program.data;
  return [d.name, d.institution, d.institutionShort, d.location, countryName(d.country), fieldLabel(d.field)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
