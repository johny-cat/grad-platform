/**
 * Helpers for the program catalog (src/data/programs). Used at build time.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ProgramSummary } from './types';
import { todayIso } from './time';

export type Program = CollectionEntry<'programs'>;
export type Deadline = Program['data']['deadlines'][number];

export function firstDeadline(program: Program): Deadline | undefined {
  return [...program.data.deadlines].sort((a, b) => a.date.localeCompare(b.date))[0];
}

/**
 * A date this season, estimated from an official date whose year isn't
 * confirmed for Fall 2027 (a `publishedDeadlines` entry such as "December 1"
 * or "Dec. 1, 2025"). Owner decision, 2026-10-31: show these in countdowns,
 * always labelled "year not confirmed", because most programs keep the same
 * deadline every year.
 */
export interface EstimatedDeadline {
  date: string;
  dateText: string;
  label: string;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
/** Not a fall-entry application date, or no single date to count down to. */
const NOT_FALL_ENTRY = /spring|summer|january admission|rolling|prior to|each semester|fellowship|nominat/i;
/**
 * Fall 2027 entry: dates from September to December fall in 2026, and dates
 * from January to August in 2027 (an "August 1" fall deadline is the one just
 * before the term starts).
 */
const SEASON_FIRST_YEAR = 2026;
const SEASON_START = '2026-08-01';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** The month and day (and year, if printed) in a published date text; for a range, its end. */
function parseDateText(text: string): { month: number; day: number; year?: number } | undefined {
  // Ignore when applications open ("applications open Sept 1", "Open September 1 through ...").
  const cleaned = text.replace(/\bopens?\s+(?:on\s+)?[a-z]+\.?\s*\d{1,2}(?:st|nd|rd|th)?(?:\s+through)?/gi, '');
  const part = cleaned.includes(' - ') ? cleaned.slice(cleaned.lastIndexOf(' - ') + 3) : cleaned;
  const named = /\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s*(\d{1,2})(?:st|nd|rd|th)?\b(?:,?\s*(\d{4}))?/i.exec(part);
  if (named) {
    const day = Number(named[2]);
    const month = MONTHS[(named[1] ?? '').slice(0, 3).toLowerCase()];
    if (!month || day < 1 || day > 31) return undefined;
    return { month, day, year: named[3] ? Number(named[3]) : undefined };
  }
  const numeric = /\b(\d{1,2})\/(\d{1,2})\b/.exec(part);
  if (numeric) {
    const month = Number(numeric[1]);
    const day = Number(numeric[2]);
    return month >= 1 && month <= 12 && day >= 1 && day <= 31 ? { month, day } : undefined;
  }
  return undefined;
}

/** This season's estimated date for one published (older or undated) entry, if it is a fall-entry date. */
export function estimateEntry(entry: { label: string; dateText: string }): string | undefined {
  if (NOT_FALL_ENTRY.test(`${entry.label} ${entry.dateText}`)) return undefined;
  const parsed = parseDateText(entry.dateText);
  if (!parsed) return undefined;
  const printed = parsed.year ? `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}` : undefined;
  if (printed && printed >= SEASON_START) return printed;
  const year = parsed.month >= 9 ? SEASON_FIRST_YEAR : SEASON_FIRST_YEAR + 1;
  return `${year}-${pad(parsed.month)}-${pad(parsed.day)}`;
}

/** Every estimated date this season, earliest first, for a program with no confirmed Fall 2027 deadline. */
export function estimatedDeadlines(program: Program): EstimatedDeadline[] {
  if (program.data.deadlines.length > 0) return [];
  const found: EstimatedDeadline[] = [];
  for (const entry of program.data.publishedDeadlines) {
    const date = estimateEntry(entry);
    if (date) found.push({ date, dateText: entry.dateText, label: entry.label });
  }
  // One entry per date (e.g. US and international on the same day).
  const unique = [...new Map(found.map((e) => [e.date, e])).values()];
  return unique.sort((a, b) => a.date.localeCompare(b.date));
}

/** The next estimated date that hasn't passed when the site is built (else the last one). */
export function estimatedDeadline(program: Program, today: string = todayIso()): EstimatedDeadline | undefined {
  const all = estimatedDeadlines(program);
  return all.find((e) => e.date >= today) ?? all.at(-1);
}

/** One deadline in a "coming up" list: confirmed, or estimated (year not confirmed). */
export interface UpcomingDeadline {
  program: Program;
  date: string;
  time?: string;
  timezone?: string;
  label: string;
  estimated: boolean;
}

/** Every deadline this season, confirmed and estimated, soonest first. */
export function allDeadlines(programs: Program[]): UpcomingDeadline[] {
  return programs
    .flatMap((program) => [
      ...program.data.deadlines.map((d) => ({
        program,
        date: d.date,
        time: d.time,
        timezone: d.timezone,
        label: d.label,
        estimated: false,
      })),
      ...estimatedDeadlines(program).map((e) => ({ program, date: e.date, label: e.label, estimated: true })),
    ])
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        Number(a.estimated) - Number(b.estimated) ||
        sortName(a.program).localeCompare(sortName(b.program)) ||
        a.program.data.name.localeCompare(b.program.data.name),
    );
}

/** The date a program sorts by: its confirmed deadline, else its estimated one. */
function sortDate(program: Program): string {
  return firstDeadline(program)?.date ?? estimatedDeadline(program)?.date ?? '9999-12-31';
}

/** A university's name for sorting: "The Ohio State University" sorts under O. */
function universitySortName(name: string): string {
  return name.replace(/^The /, '');
}

function sortName(program: Program): string {
  return universitySortName(program.data.institution);
}

export interface University {
  name: string;
  /** In the same order as getPrograms(): soonest deadline first, then by name. */
  programs: Program[];
}

/** Programs grouped by university, universities A to Z. */
export async function getUniversities(): Promise<University[]> {
  const groups = new Map<string, Program[]>();
  for (const program of await getPrograms()) {
    const list = groups.get(program.data.institution);
    if (list) list.push(program);
    else groups.set(program.data.institution, [program]);
  }
  return [...groups]
    .map(([name, programs]) => ({ name, programs }))
    .sort((a, b) => universitySortName(a.name).localeCompare(universitySortName(b.name)));
}

/** All programs, soonest deadline first, then by university and program name. */
export async function getPrograms(): Promise<Program[]> {
  const all = await getCollection('programs');
  return all.sort((a, b) => {
    const da = sortDate(a);
    const db = sortDate(b);
    return (
      da.localeCompare(db) ||
      sortName(a).localeCompare(sortName(b)) ||
      a.data.name.localeCompare(b.data.name)
    );
  });
}

export function shortName(program: Program): string {
  return program.data.institutionShort ?? program.data.institution;
}

/** Small, serialisable version of a program for interactive parts of the page. */
export function toSummary(program: Program): ProgramSummary {
  const deadline = firstDeadline(program);
  const estimated = deadline ? undefined : estimatedDeadline(program);
  return {
    slug: program.id,
    name: program.data.name,
    institution: program.data.institution,
    short: shortName(program),
    country: program.data.country,
    deadline: deadline
      ? { date: deadline.date, time: deadline.time, timezone: deadline.timezone }
      : estimated
        ? { date: estimated.date, estimated: true }
        : undefined,
    ...(program.data.tracks ? { tracks: program.data.tracks } : {}),
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
  return ['optional', 'not-required', 'not-accepted'].includes(program.data.requirements?.gre ?? 'unknown');
}

/** Listed with only its basics; deadline and requirements not checked yet. */
export function isPending(program: Program): boolean {
  return program.data.details === 'pending';
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
  return [d.name, d.institution, d.institutionShort, ...(d.tracks ?? []), d.location, countryName(d.country), fieldLabel(d.field)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
