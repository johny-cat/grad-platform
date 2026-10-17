-- GENERATED FILE. Do not edit by hand.
-- Source: src/data/programs/*.json  (run: npm run catalog:sql)
-- Apply in Supabase: SQL Editor -> paste -> Run. Safe to run again any time.

begin;

insert into public.programs (slug, name, institution, country, field, degree)
values
  ('harvard-bbs-phd', 'Biological and Biomedical Sciences (BBS) PhD', 'Harvard University', 'US', 'biology', 'phd'),
  ('mit-biology-phd', 'Biology PhD', 'Massachusetts Institute of Technology', 'US', 'biology', 'phd'),
  ('rockefeller-bioscience-phd', 'David Rockefeller Graduate Program in Bioscience', 'The Rockefeller University', 'US', 'biology', 'phd'),
  ('scripps-research-phd', 'Doctoral Program in Chemical and Biological Sciences', 'Scripps Research', 'US', 'biology', 'phd'),
  ('stanford-biosciences-phd', 'Biosciences PhD Programs', 'Stanford University', 'US', 'biology', 'phd'),
  ('ucsf-bms-phd', 'Biomedical Sciences (BMS) PhD', 'University of California, San Francisco', 'US', 'biology', 'phd'),
  ('washu-dbbs-phd', 'Division of Biology and Biomedical Sciences (DBBS) PhD', 'Washington University in St. Louis', 'US', 'biology', 'phd')
on conflict (slug) do update
  set name        = excluded.name,
      institution = excluded.institution,
      country     = excluded.country,
      field       = excluded.field,
      degree      = excluded.degree,
      active      = true,
      updated_at  = now();

-- Programs removed from the repository stay in the database (so old results
-- keep their program) but are marked inactive.
update public.programs
   set active = false, updated_at = now()
 where active
   and slug not like 'test-%'
   and slug not in ('harvard-bbs-phd', 'mit-biology-phd', 'rockefeller-bioscience-phd', 'scripps-research-phd', 'stanford-biosciences-phd', 'ucsf-bms-phd', 'washu-dbbs-phd');

commit;
