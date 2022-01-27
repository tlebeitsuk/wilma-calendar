import ical from "node-ical";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import sv from "dayjs/locale/sv";

dayjs.extend(customParseFormat);
dayjs.locale(sv);

let schedule = {};

// Generate schema
for (let i = 0; i < 14; i++) {
  const today = dayjs();
  schedule[today.add(i, "day").format("DD.MM.YYYY")] = [];
}

// Get data from url

const url = ""; // TODO: Add url here

const response = await fetch(url);
const text = await response.text();
const data = ical.parseICS(text);

// Filter vevents
const events = Object.values(data).filter((event) => event.type === "VEVENT");

events.forEach((event) => {
  const date = dayjs(event.start);
  const start = dayjs(event.start);
  const end = dayjs(event.end);

  // Single event
  if (schedule[date.format("DD.MM.YYYY")]) {
    schedule[date.format("DD.MM.YYYY")].push({
      title: event.summary,
      description: event.description,
      resources: event.resources,
      location: event.location,
      start: dayjs(date)
        .set("hour", start.hour())
        .set("minute", start.minute())
        .format("HH:mm"),
      end: dayjs(date)
        .set("hour", end.hour())
        .set("minute", end.minute())
        .format("HH.mm"),
      duration: dayjs(event.end).diff(event.start, "minutes"),
    });
  }

  // Recurring event
  if (event.rrule) {
    const dates = event.rrule.between(
      dayjs().startOf("day").toDate(),
      dayjs().add(1, "week").toDate()
    );

    dates.forEach((d) => {
      const date = dayjs(d);

      schedule[date.format("DD.MM.YYYY")].push({
        title: event.summary,
        description: event.description,
        resources: event.resources,
        location: event.location,
        start: dayjs(date)
          .set("hour", start.hour())
          .set("minute", start.minute())
          .format("HH:mm"),
        end: dayjs(date)
          .set("hour", end.hour())
          .set("minute", end.minute())
          .format("HH.mm"),
        duration: dayjs(event.end).diff(event.start, "minutes"),
      });
    });
  }
});

// Create elements
Object.keys(schedule).forEach((key) => {
  // Only show dates with events
  if (schedule[key].length !== 0) {
    // Create list
    const listElement = document.createElement("ul");
    document.getElementById("schedule").appendChild(listElement);

    // Date
    const dateElement = document.createElement("h2");
    dateElement.innerText = dayjs(key, "DD.MM.YYYY").format("dddd DD MMMM");
    listElement.appendChild(dateElement);

    // Events
    schedule[key].forEach((event) => {
      const eventsElement = document.createElement("li");
      listElement.appendChild(eventsElement);

      eventsElement.innerHTML = `
        <div class="event" style="height: ${event.duration}px">
            <div class="info">
                <div class="title">${event.title}</div>
                <div class="teacher">${event.resources.split(",")[0]}</div>
            </div>
            <div class="time">
                <div class="start">${event.start}</div>
                <div class="end">${event.end}</div>
            </div>
        </div>
    `;
    });
  }
});
