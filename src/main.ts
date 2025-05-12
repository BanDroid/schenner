import "@gabrielfins/ripple-effect";
import "@/style.css";

import Alpine from "alpinejs";
import { Schedule } from "@/types/schedule";
import { generateEncodedSvg } from "@/utils/satori";
import { generateThemes } from "@/utils/dynamic-colors";
window.Alpine = Alpine;

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const schedules: Schedule[] = days.map((day) => ({
  nameOfDay: day,
  eventDescription: "",
}));

Alpine.store("theme", {
  tailwind: "awf",
});

Alpine.data("inputs", () => ({
  schedules,
  artwork: new File([], ""),
  artist: "",
  output: "",
  loading: false,
  error: "",
  async generate() {
    this.loading = true;
    // generate svg -> display preview in img tag and output img tag -> draw image from output img tag based on the element width and height.
    if (!this.artwork.name) {
      this.loading = false;
      this.error = "Artwork is required.";
      (
        document.getElementById("errorModal") as HTMLDialogElement | null
      )?.showModal();
      return;
    }
    try {
      const themes = await generateThemes(this.artwork as File);
      const encodedSvg = await generateEncodedSvg(themes, this);
      this.output = encodedSvg;
      const canvas = document.getElementById(
        "canvas-output"
      ) as HTMLCanvasElement | null;
      if (!canvas) throw new Error("Canvas element is not initialized.");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.addEventListener("load", function () {
        ctx?.drawImage(img, 0, 0);
      });
      img.setAttribute(
        "src",
        "data:image/svg+xml;charset=utf-8;base64," + this.output
      );
    } catch (error) {
      console.error(error);
      (
        document.getElementById("errorModal") as HTMLDialogElement | null
      )?.showModal();
    } finally {
      this.loading = false;
    }
  },
  download(format: "png" | "jpg") {
    const canvas = document.getElementById(
      "canvas-output"
    ) as HTMLCanvasElement | null;
    if (!canvas) throw new Error("Canvas element is not initialized.");
    const downloadUrl = canvas.toDataURL(`image/${format}`, 100);
    const link = document.createElement("a");
    link.download = `schenner.${format}`;
    link.href = downloadUrl;
    link.click();
  },
}));

Alpine.start();
