import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Plugin hanya didaftarkan di browser; aman dipanggil berulang.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
