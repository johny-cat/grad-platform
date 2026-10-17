/**
 * The program catalog: one JSON file per program in src/data/programs/.
 * The file name is the program's permanent ID ("slug"), e.g.
 * stanford-biosciences-phd.json -> /programs/stanford-biosciences-phd/
 *
 * Rules (see docs/DATA.md):
 *  - Every fact must come from an official page listed in `sources`.
 *  - If an official page does not say something, leave the field out.
 *    The site then shows "Not stated on official pages". Never guess.
 *  - The build fails if a file does not match this schema.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const deadline = z.object({
  label: z.string().min(2),
  date: isoDate,
  /** 24-hour local time, e.g. "23:59". Leave out if the page gives no time. */
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  /** IANA time zone, e.g. "America/Los_Angeles". Required when time is given. */
  timezone: z.string().optional(),
  note: z.string().optional(),
});

const source = z.object({
  url: z.url(),
  label: z.string().min(2),
  checked: isoDate,
});

export const programSchema = z
  .object({
    name: z.string().min(2),
    institution: z.string().min(2),
    institutionShort: z.string().optional(),
    country: z.string().regex(/^[A-Z]{2}$/, 'ISO 3166-1 alpha-2 code, e.g. US'),
    location: z.string().optional(),
    degree: z.enum(['phd', 'masters', 'other']),
    /** Broad field used for filters, e.g. "biology". Lowercase with dashes. */
    field: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    /** How students are admitted: a whole program, an individual lab, or a funded project. */
    admissionModel: z.enum(['program', 'lab', 'project']),
    summary: z.string().max(300).optional(),
    officialUrl: z.url(),
    applyUrl: z.url().optional(),
    /** The admissions cycle these details describe, e.g. "fall-2027". */
    cycle: z.string().regex(/^(fall|spring|summer|winter)-\d{4}$/),
    deadlines: z.array(deadline),
    timeline: z
      .object({
        interviews: z.string().optional(),
        decisions: z.string().optional(),
      })
      .optional(),
    requirements: z.object({
      gre: z.enum(['required', 'optional', 'not-required', 'not-accepted', 'unknown']),
      english: z
        .object({
          toefl: z.string().optional(),
          ielts: z.number().optional(),
          duolingo: z.number().optional(),
          note: z.string().optional(),
        })
        .optional(),
      applicationFee: z
        .object({
          amount: z.number().nonnegative(),
          currency: z.string().length(3),
          waiver: z.enum(['available', 'domestic-only', 'not-available', 'unknown']),
          note: z.string().optional(),
        })
        .optional(),
      letters: z
        .object({
          min: z.number().int().positive(),
          max: z.number().int().positive().optional(),
        })
        .optional(),
      documents: z.array(z.string()).optional(),
      note: z.string().optional(),
    }),
    funding: z
      .object({
        /** All admitted students are funded (per official pages). */
        allFunded: z.boolean().optional(),
        coversInternational: z.enum(['yes', 'limited', 'no', 'unknown']),
        stipend: z
          .object({
            amount: z.number().positive(),
            currency: z.string().length(3),
            period: z.enum(['year', 'month']),
            year: z.string(),
          })
          .optional(),
        note: z.string().optional(),
      })
      .optional(),
    international: z
      .object({
        accepted: z.enum(['yes', 'no', 'unknown']),
        note: z.string().optional(),
      })
      .optional(),
    sources: z.array(source).min(1),
    lastChecked: isoDate,
  })
  .strict();

export type ProgramData = z.infer<typeof programSchema>;

const programs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/programs' }),
  schema: programSchema,
});

export const collections = { programs };
