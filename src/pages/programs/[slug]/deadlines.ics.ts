/**
 * /programs/<id>/deadlines.ics: a calendar file with this program's
 * deadlines and reminders, for Apple Calendar, Outlook or Google Calendar.
 */
import type { APIRoute } from 'astro';
import { allDeadlines, getPrograms, shortName, type Program } from '../../../lib/catalog';
import { buildIcs } from '../../../lib/calendar';
import { programLabel } from '../../../lib/labels';

export async function getStaticPaths() {
  const programs = await getPrograms();
  return programs
    .filter((program) => allDeadlines([program]).length > 0)
    .map((program) => ({ params: { slug: program.id }, props: { program } }));
}

export const GET: APIRoute = ({ props }) => {
  const program = (props as { program: Program }).program;
  const label = programLabel(shortName(program), program.data.name);
  const events = allDeadlines([program]).map((d) => ({
    programId: program.id,
    programLabel: label,
    date: d.date,
    label: d.label,
    time: d.time,
    timezone: d.timezone,
    estimated: d.estimated,
  }));
  return new Response(buildIcs(events, `${label}: deadlines`), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
