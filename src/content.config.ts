/**
 * The program catalog: one JSON file per program in src/data/programs/.
 * The file name is the program's permanent ID ("slug"), e.g.
 * stanford-biosciences-phd.json -> /programs/stanford-biosciences-phd/
 *
 * Rules (see docs/DATA.md):
 *  - Every fact must come from an official page listed in `sources`.
 *  - If an official page does not say something, leave the field out.
 *    The site then shows "Not stated on official pages". Never guess.
 *  - A program can be listed before its details are checked: set
 *    `details` to "pending" and give only the basics and its official page.
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

const requirements = z.object({
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
    /**
     * For an umbrella program: the home areas, tracks or programs inside it,
     * named exactly as on its official page. Shown on the program page and
     * matched by search, so someone looking for "Neuroscience" finds it.
     */
    tracks: z.array(z.string().min(2)).min(1).optional(),
    /**
     * "checked": every detail in this file was checked on official pages.
     * "pending": listed with only its basics and official page, so people can
     * follow it and report results while its details wait to be checked.
     */
    details: z.enum(['checked', 'pending']).default('checked'),
    /** How students are admitted: a whole program, an individual lab, or a funded project. */
    admissionModel: z.enum(['program', 'lab', 'project']).optional(),
    summary: z.string().max(300).optional(),
    officialUrl: z.url(),
    applyUrl: z.url().optional(),
    /** The admissions cycle these details describe, e.g. "fall-2027". */
    cycle: z.string().regex(/^(fall|spring|summer|winter)-\d{4}$/),
    deadlines: z.array(deadline).default([]),
    timeline: z
      .object({
        interviews: z.string().optional(),
        decisions: z.string().optional(),
      })
      .optional(),
    requirements: requirements.optional(),
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
  .strict()
  .superRefine((program, ctx) => {
    if (program.details === 'checked') {
      for (const key of ['admissionModel', 'requirements'] as const) {
        if (program[key] === undefined) {
          ctx.addIssue({ code: 'custom', path: [key], message: `Required once details are checked` });
        }
      }
      return;
    }
    // A pending program lists only its basics. Once anything else is checked,
    // check everything and set details to "checked" (see docs/DATA.md).
    const extras = ['summary', 'applyUrl', 'timeline', 'requirements', 'funding', 'international', 'admissionModel'] as const;
    for (const key of extras) {
      if (program[key] !== undefined) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'Not allowed while details are pending' });
      }
    }
    if (program.deadlines.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['deadlines'], message: 'Not allowed while details are pending' });
    }
  });

export type ProgramData = z.infer<typeof programSchema>;

const programs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/programs' }),
  schema: programSchema,
});

export const collections = { programs };
