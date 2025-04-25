import { EventId } from '../services/xml-parser-service/xml-parser.service';

export const formatEvents = (events: EventId[]): string => {
  let action = '';
  events.forEach((event, idx) => {
    const value = event?.namespace
      ? `${event.namespace}:${event.name}`
      : event.name;
    action += idx ? ` ${value}` : value;
  });

  return action;
};
