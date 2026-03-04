import db from "@/database/models";

const { CalendarEvent, Sequelize } = db;
const { Op } = Sequelize;

export { Op };

export function findCalendarEvents(where, options = {}) {
  return CalendarEvent.findAll({ where, ...options });
}

export function createCalendarEvent(payload) {
  return CalendarEvent.create(payload);
}

export function findCalendarEventById(eventId, options = {}) {
  return CalendarEvent.findOne({ where: { event_id: eventId, deleted: null }, ...options });
}

export function updateCalendarEventInstance(event, updates) {
  return event.update(updates);
}
