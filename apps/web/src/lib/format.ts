const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC', // project and task dates are calendar dates stored at UTC midnight
});

export const formatDate = (iso: string | null | undefined, fallback = '—') =>
  iso ? dateFormatter.format(new Date(iso)) : fallback;

/** `YYYY-MM-DD` for <input type="date">. */
export const toDateInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '');

const todayUtc = () => new Date().toISOString().slice(0, 10);

export const isOverdue = (dueDate: string | null, status: string) =>
  Boolean(dueDate) && status !== 'COMPLETED' && dueDate!.slice(0, 10) < todayUtc();

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
