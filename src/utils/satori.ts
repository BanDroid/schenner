import satori, { type FontWeight, type FontStyle } from "satori";
import { html } from "satori-html";

import { type IMaterialDynamicColorsTheme } from "material-dynamic-colors/src/cdn/interfaces";
import { Schedule } from "@/types/schedule";

async function loadFonts() {
  return {
    fonts: Promise.all([
      await (
        await fetch("/externals/fonts/quicksand/static/Quicksand-Light.ttf")
      ).arrayBuffer(),
      await (
        await fetch("/externals/fonts/quicksand/static/Quicksand-Regular.ttf")
      ).arrayBuffer(),
      await (
        await fetch("/externals/fonts/quicksand/static/Quicksand-Medium.ttf")
      ).arrayBuffer(),
      await (
        await fetch("/externals/fonts/quicksand/static/Quicksand-SemiBold.ttf")
      ).arrayBuffer(),
      await (
        await fetch("/externals/fonts/quicksand/static/Quicksand-Bold.ttf")
      ).arrayBuffer(),
    ]),
    weights: [300, 400, 500, 600, 700],
  };
}

function getWeekDatesMondayToSunday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

  // Calculate how many days to subtract to get to Monday
  const daysFromMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);

  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    // Monday to Sunday
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date);
  }

  return weekDates;
}

function scheduleBoxes(
  themes: IMaterialDynamicColorsTheme,
  schedules: Schedule[]
) {
  const week = getWeekDatesMondayToSunday();

  return schedules
    .map(
      (schedule, index) => `
    <li style="gap: 1rem; ${
      (index + 1) % 2 == 0 ? "transform: translate(28px, 0);" : ""
    }"
      tw="bg-[${themes.dark.primary}] text-[${
        themes.dark.onPrimary
      }] px-12 py-4 flex flex-row rounded-full border-4 border-[${
        themes.dark.inversePrimary
      }]"
    >
      <div style="gap: 0.5rem;" tw="flex-1 flex flex-col">
        <span tw="text-4xl font-light">${schedule.nameOfDay}</span>
        <span tw="text-4xl font-medium">${
          schedule.eventDescription || "No schedule"
        }</span>
      </div>
      <span tw="text-5xl flex items-center justify-center">
        ${week[index].toLocaleDateString(navigator.language, {
          month: "short",
          day: "numeric",
        })}
      </span>
    </li>
  `
    )
    .join("");
}

export async function generateEncodedSvg(
  themes: IMaterialDynamicColorsTheme,
  data: {
    schedules: Schedule[];
    artwork: File;
    artist: string;
    error: string;
    output: string;
    generate(): Promise<void>;
  }
) {
  const loadedFonts = await loadFonts().catch(console.error);
  const fonts = (await loadedFonts!.fonts).map((font, index) => ({
    data: font,
    weight: loadedFonts!.weights[index] as FontWeight,
    name: "quicksand",
    style: "normal" as FontStyle,
  }));

  const svg = await satori(
    html(`
      <div
        style="background-image: radial-gradient(circle at 25px 25px, ${
          themes.dark.inversePrimary
        } 3%, transparent 0%), radial-gradient(circle at 75px 75px, ${
      themes.dark.inversePrimary
    } 3%, transparent 0%);
          backgroundSize: 100px 100px;"
        tw="bg-[${themes.dark.primaryContainer}]
          text-[${themes.dark.onPrimaryContainer}]
          w-full h-full flex justify-center"
      >
        <img
          src="${URL.createObjectURL(data.artwork)}"
          style="object-fit: cover; object-position: center;
            maskImage: linear-gradient(to right, black 70%, transparent);
            WebkitMaskImage: linear-gradient(to right, black 70%, transparent);"
          tw="absolute top-0 left-0 w-1/2 h-full opacity-90"
        />
        <div
          style="text-shadow: 0 0 10px black;"
          tw="flex-2 flex items-end justify-center p-8 text-4xl font-semibold"
        >
          ${data.artist ? ["@", data.artist].join("") : ""}
        </div>
        <ul style="gap: 1rem;" tw="flex-3 flex flex-col items-stretch justify-center p-8 mr-12">
          ${scheduleBoxes(themes, data.schedules)}
        </ul>
      </div>
    `),
    {
      width: 1920,
      height: 1080,
      fonts,
    }
  );
  return btoa(svg);
}
