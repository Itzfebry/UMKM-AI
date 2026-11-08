"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MOTION } from "@/lib/motion";

/**
 * Latar WebGL dekoratif (partikel tiga dimensi) untuk hero landing dan halaman masuk.
 *
 * Aturan yang dipakai (skill threejs + gsap):
 * - `three` diimpor dinamis di dalam effect, jadi tidak ikut bundel awal halaman;
 * - hanya satu instance renderer per canvas dan selalu dibuang saat unmount (geometry,
 *   material, renderer, observer) supaya konteks WebGL tidak menumpuk;
 * - animasi dikendarai GSAP ticker, bukan requestAnimationFrame manual, dan dijeda saat
 *   canvas keluar layar atau tab tidak aktif;
 * - `prefers-reduced-motion` hanya menggambar satu bingkai diam;
 * - tanpa dukungan WebGL canvas tidak digambar sama sekali, latar CSS yang sudah ada tetap tampil.
 */
export function AmbientCanvas({
  className = "",
  density = 900,
  color = "#8CC7C4",
}: {
  className?: string;
  density?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let teardown: (() => void) | undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
      } catch {
        return; // WebGL tidak tersedia: biarkan latar CSS yang bekerja.
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
      camera.position.z = 14;

      const count = Math.max(200, Math.round(density * (window.innerWidth < 768 ? 0.5 : 1)));
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 34;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 0.09,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const resize = () => {
        // Ukuran diambil dari kotak canvas sendiri: latar `fixed` selebar viewport tidak sama
        // dengan lebar elemen induknya, dan itu membuat gambar diregangkan.
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };

      const spin = { angle: 0, tilt: 0 };
      const render = () => {
        points.rotation.y = spin.angle;
        points.rotation.x = spin.tilt;
        renderer.render(scene, camera);
      };

      const ticker = gsap.to(spin, { angle: Math.PI * 2, duration: MOTION.canvasSpin, ease: "none", repeat: -1, onUpdate: render });

      resize();

      if (reduceMotion) {
        // Bingkai diam saja: tetap ada tekstur, tidak ada gerak.
        ticker.pause();
        render();
      }

      const observer = new ResizeObserver(resize);
      observer.observe(canvas);

      const setPaused = (paused: boolean) => (paused ? ticker.pause() : ticker.play());
      const onVisibility = () => setPaused(document.visibilityState !== "visible");
      document.addEventListener("visibilitychange", onVisibility);

      // Gerak otomatis >5 detik: pengguna harus bisa menghentikannya (WCAG 2.2.2) — jeda saat
      // penunjuk berada di atas latar atau saat fokus keyboard masuk ke area yang sama.
      const onEnter = () => setPaused(true);
      const onLeave = () => setPaused(document.visibilityState !== "visible");
      const surface = canvas.parentElement ?? canvas;
      surface.addEventListener("pointerenter", onEnter);
      surface.addEventListener("pointerleave", onLeave);
      surface.addEventListener("focusin", onEnter);
      surface.addEventListener("focusout", onLeave);

      const inView = new IntersectionObserver((entries) => setPaused(!(entries[0]?.isIntersecting ?? true)), { threshold: 0 });
      inView.observe(canvas);

      teardown = () => {
        ticker.kill();
        document.removeEventListener("visibilitychange", onVisibility);
        surface.removeEventListener("pointerenter", onEnter);
        surface.removeEventListener("pointerleave", onLeave);
        surface.removeEventListener("focusin", onEnter);
        surface.removeEventListener("focusout", onLeave);
        inView.disconnect();
        observer.disconnect();
        points.removeFromParent();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [density, color]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
