"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const GLOBE_RADIUS = 1.6;

const LOIS = [
  { lat: 37.7749, lon: -122.4194, label: "San Francisco" },
  { lat: 51.5074, lon: -0.1278, label: "London" },
];

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const createGlowTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255, 235, 150, 0.9)");
  gradient.addColorStop(0.6, "rgba(255, 215, 120, 0.4)");
  gradient.addColorStop(1, "rgba(255, 215, 120, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createLabelTexture = (label: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "600 28px 'Geist Sans', sans-serif";
  context.fillStyle = "rgba(255, 236, 170, 0.95)";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(255, 210, 120, 0.65)";
  context.shadowBlur = 8;
  context.fillText(label, 8, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createLandMaskTexture = async () => {
  const response = await fetch("/data/land.geojson");
  if (!response.ok) return null;
  const geojson = (await response.json()) as {
    type: string;
    features?: Array<{
      geometry?: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][] | number[][][][];
      };
    }>;
  };

  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);

  const project = ([lon, lat]: number[]) => {
    const x = ((lon + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    return [x, y];
  };

  const drawPolygon = (rings: number[][][]) => {
    context.beginPath();
    rings.forEach((ring) => {
      ring.forEach((coordinate, index) => {
        const [x, y] = project(coordinate);
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.closePath();
    });
    context.fill("evenodd");
  };

  context.fillStyle = "rgba(255, 255, 255, 1)";

  const features = geojson.features ?? [];
  features.forEach((featureItem) => {
    const geometry = featureItem.geometry;
    if (!geometry) return;
    if (geometry.type === "Polygon") {
      drawPolygon(geometry.coordinates as number[][][]);
    } else if (geometry.type === "MultiPolygon") {
      (geometry.coordinates as number[][][][]).forEach((rings) => drawPolygon(rings));
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export default function GlobeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f7d26a"),
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
    });
    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 48);
    const wireframeGlobe = new THREE.Mesh(globeGeometry, wireframeMaterial);
    wireframeGlobe.renderOrder = 3;
    globeGroup.add(wireframeGlobe);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f9df85"),
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const glowGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.02, 48, 48);
    const glowGlobe = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowGlobe);

    const continentMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f8d67c"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true,
      alphaTest: 0.5,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const continentGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.03, 64, 64);
    const continents = new THREE.Mesh(continentGeometry, continentMaterial);
    continents.renderOrder = 2;
    globeGroup.add(continents);

    let landMaskTexture: THREE.Texture | null = null;
    createLandMaskTexture().then((texture) => {
      if (!texture) return;
      landMaskTexture = texture;
      continentMaterial.alphaMap = texture;
      continentMaterial.map = null;
      continentMaterial.opacity = 0.8;
      continentMaterial.depthWrite = false;
      continentMaterial.needsUpdate = true;
    });

    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);

    const markerGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffe29a"),
    });
    const glowTexture = createGlowTexture();
    const pulseTargets: Array<{ sprite: THREE.Sprite; baseScale: number }> = [];
    const markerTextures: THREE.Texture[] = [];

    if (glowTexture) {
      markerTextures.push(glowTexture);
    }

    LOIS.forEach((loi) => {
      const markerGroup = new THREE.Group();
      const position = latLonToVector3(loi.lat, loi.lon, GLOBE_RADIUS * 1.05);
      markerGroup.position.copy(position);
      markersGroup.add(markerGroup);

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.renderOrder = 3;
      markerGroup.add(marker);

      if (glowTexture) {
        const glowMaterial = new THREE.SpriteMaterial({
          map: glowTexture,
          color: new THREE.Color("#ffe6a6"),
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const glow = new THREE.Sprite(glowMaterial);
        const baseScale = 0.35;
        glow.scale.set(baseScale, baseScale, baseScale);
        glow.renderOrder = 3;
        markerGroup.add(glow);
        pulseTargets.push({ sprite: glow, baseScale });
      }

      const labelTexture = createLabelTexture(loi.label);
      if (labelTexture) {
        markerTextures.push(labelTexture);
        const labelMaterial = new THREE.SpriteMaterial({
          map: labelTexture,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        });
        const label = new THREE.Sprite(labelMaterial);
        label.scale.set(0.6, 0.15, 1);
        const normal = position.clone().normalize();
        label.position.copy(normal.multiplyScalar(0.18));
        label.renderOrder = 3;
        markerGroup.add(label);
      }
    });

    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let spinVelocity = 0;

    const onPointerDown = (event: PointerEvent) => {
      isDragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.003;
      globeGroup.rotation.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, globeGroup.rotation.x)
      );
      spinVelocity = deltaX * 0.0008;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointerleave", onPointerUp);

    const resizeRenderer = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / height;
      const fovRadians = (camera.fov * Math.PI) / 180;
      const fitHeightDistance = GLOBE_RADIUS / Math.tan(fovRadians / 2);
      const fitWidthDistance =
        GLOBE_RADIUS / Math.tan((2 * Math.atan(Math.tan(fovRadians / 2) * camera.aspect)) / 2);
      camera.position.z = Math.max(fitHeightDistance, fitWidthDistance) * 1.2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, true);
    };

    resizeRenderer();
    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);

    let animationFrame: number;
    const animate = () => {
      if (!isDragging) {
        globeGroup.rotation.y += 0.002 + spinVelocity;
        spinVelocity *= 0.95;
      }
      const time = performance.now() * 0.002;
      pulseTargets.forEach((target, index) => {
        const pulse = 1 + Math.sin(time + index) * 0.25;
        target.sprite.scale.setScalar(target.baseScale * pulse);
      });
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointerleave", onPointerUp);
      renderer.dispose();
      globeGeometry.dispose();
      glowGeometry.dispose();
      continentGeometry.dispose();
      markerGeometry.dispose();
      wireframeMaterial.dispose();
      glowMaterial.dispose();
      continentMaterial.dispose();
      markerMaterial.dispose();
      markerTextures.forEach((texture) => texture.dispose());
      if (landMaskTexture) landMaskTexture.dispose();
      markersGroup.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Sprite) {
          child.material.dispose();
        }
      });
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}
