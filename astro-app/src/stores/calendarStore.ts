import { atom } from 'nanostores';

/** Whether the calendar view is active (true) or the list view (false). */
export const isCalendarView = atom<boolean>(false);
