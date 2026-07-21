(() => {
  const DAY_NAMES = [
    "Söndag",
    "Måndag",
    "Tisdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lördag",
  ];

  const MONTH_NAMES = [
    "januari",
    "februari",
    "mars",
    "april",
    "maj",
    "juni",
    "juli",
    "augusti",
    "september",
    "oktober",
    "november",
    "december",
  ];

  /** Fredagstider per ISO-vecka (33–52). Mönstret upprepas var 4:e vecka. */
  const FRIDAY_BY_WEEK = {
    33: "09.00–15.30",
    34: "09.00–14.30",
    35: "08.00–14.00",
    36: "07.30–14.00",
    37: "09.00–15.30",
    38: "09.00–14.30",
    39: "08.00–14.00",
    40: "07.30–14.00",
    41: "09.00–15.30",
    42: "09.00–14.30",
    43: "08.00–14.00",
    44: "07.30–14.00",
    45: "09.00–15.30",
    46: "09.00–14.30",
    47: "08.00–14.00",
    48: "07.30–14.00",
    49: "09.00–15.30",
    50: "09.00–14.30",
    51: "08.00–14.00",
    52: "07.30–14.00",
  };

  const FRIDAY_PATTERN = [
    "09.00–15.30", // vecka % 4 === 1
    "09.00–14.30", // === 2
    "08.00–14.00", // === 3
    "07.30–14.00", // === 0
  ];

  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function isEvenWeek(week) {
    return week % 2 === 0;
  }

  function fridayHours(week) {
    if (FRIDAY_BY_WEEK[week]) return FRIDAY_BY_WEEK[week];
    const idx = week % 4 === 0 ? 3 : (week % 4) - 1;
    return FRIDAY_PATTERN[idx];
  }

  function lolloHours(dayIndex, week) {
    const even = isEvenWeek(week);

    switch (dayIndex) {
      case 1: // Måndag
        return { hours: "09.00–17.15", note: null };
      case 2: // Tisdag
        return { hours: "06.00–12.30", note: null };
      case 3: // Onsdag
        return even
          ? { hours: "09.00–13.00", note: "Jämn vecka (JV)" }
          : { hours: "09.00–16.30", note: "Ojämn vecka (OV)" };
      case 4: // Torsdag
        return { hours: "07.15–12.00", note: null };
      case 5: // Fredag
        return {
          hours: fridayHours(week),
          note: `Vecka ${week}`,
        };
      default:
        return { hours: "Ledig", note: "Helg — inget arbete enligt schemat" };
    }
  }

  function logistics(dayIndex, week) {
    const even = isEvenWeek(week);

    switch (dayIndex) {
      case 1:
        return {
          dropoff: "Båda",
          pickup: "Peppe",
          train: "Lollo hem",
          detail:
            "Peppe tar tåg in tidigt, Lollo tar bilen. Peppe hämtar bilen på eftermiddagen och hämtar barnen ca 16:00. Alternativ: ni åker och lämnar tillsammans — Peppe flexar och hämtar 16:00.",
        };
      case 2:
        return {
          dropoff: "Peppe",
          pickup: "Lollo",
          train: "Peppe dit & hem",
          detail: "Lollo tar bilen. Peppe lämnar, Lollo hämtar när barnen slutat.",
        };
      case 3:
        if (even) {
          return {
            dropoff: "Båda",
            pickup: "Lollo",
            train: "Peppe & Lollo",
            detail:
              "JV: Ni åker och lämnar tillsammans. Lollo hämtar med bilen när barnen slutat.",
          };
        }
        return {
          dropoff: "Båda",
          pickup: "Peppe",
          train: "Peppe & Lollo",
          detail:
            "OV: Ni åker och lämnar tillsammans. Peppe hämtar med bilen när barnen slutat.",
        };
      case 4:
        return {
          dropoff: "Peppe",
          pickup: "Lollo",
          train: "Peppe dit & hem",
          detail: "Peppe lämnar, Lollo hämtar.",
        };
      case 5:
        return {
          dropoff: "Peppe",
          pickup: "Peppe",
          train: "—",
          detail:
            "Peppe jobbar hemifrån. Vissa veckor kan Lollo lämna när hon börjar 09.00 eller 09.30. Peppe hämtar alltid när barnen slutat.",
        };
      default:
        return {
          dropoff: "—",
          pickup: "—",
          train: "—",
          detail: "Ingen skollämning/hämtning på helgen enligt schemat.",
        };
    }
  }

  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function formatLongDate(date) {
    return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
  }

  function greetingFor(hour) {
    if (hour < 5) return "God natt";
    if (hour < 10) return "God morgon";
    if (hour < 14) return "Hej";
    if (hour < 18) return "God eftermiddag";
    return "God kväll";
  }

  function personClass(name) {
    const n = name.toLowerCase();
    if (n.includes("lollo") && n.includes("peppe")) return "";
    if (n.includes("lollo")) return "person-lollo";
    if (n.includes("peppe")) return "person-peppe";
    if (n.includes("båda")) return "";
    return "";
  }

  function renderDayCard(date, whenLabel) {
    const week = getISOWeek(date);
    const dayIndex = date.getDay();
    const work = lolloHours(dayIndex, week);
    const log = logistics(dayIndex, week);
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const isToday = whenLabel === "Idag";

    const classes = ["day-card"];
    if (isToday) classes.push("today");
    if (isWeekend) classes.push("weekend");

    return `
      <article class="${classes.join(" ")}">
        <div class="day-label">
          <h2>${DAY_NAMES[dayIndex]}</h2>
          <span class="when">${whenLabel}</span>
        </div>

        <div class="time-block">
          <span class="label">Lollo jobbar</span>
          <span class="hours">${work.hours}</span>
          ${work.note ? `<p class="note">${work.note}</p>` : ""}
        </div>

        ${
          isWeekend
            ? `<p class="detail">${log.detail}</p>`
            : `
        <div class="grid-2">
          <div class="chip">
            <span class="label">Lämnar</span>
            <span class="value ${personClass(log.dropoff)}">${log.dropoff}</span>
          </div>
          <div class="chip">
            <span class="label">Hämtar</span>
            <span class="value ${personClass(log.pickup)}">${log.pickup}</span>
          </div>
          <div class="chip full">
            <span class="label">Tåg</span>
            <span class="value">${log.train}</span>
          </div>
        </div>
        <p class="detail"><strong>Detaljer:</strong> ${log.detail}</p>`
        }
      </article>
    `;
  }

  function render() {
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const week = getISOWeek(now);
    const even = isEvenWeek(week);

    document.getElementById("greeting").textContent = greetingFor(now.getHours());
    document.getElementById("date-line").textContent = formatLongDate(now);
    document.getElementById("week-pill").textContent = `Vecka ${week}`;
    document.getElementById("parity-pill").textContent = even
      ? "Jämn vecka (JV)"
      : "Ojämn vecka (OV)";

    document.getElementById("days").innerHTML =
      renderDayCard(now, "Idag") + renderDayCard(tomorrow, "Imorgon");
  }

  render();
})();
