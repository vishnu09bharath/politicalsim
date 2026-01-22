"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import * as THREE from "three";

const GLOBE_RADIUS = 1.6;

const LOIS = [
  { label: "U.S. Federal Procurement", lat: 38.9072, lon: -77.0369 },
  { label: "Amazon Web Services (AWS)", lat: 47.6062, lon: -122.3321 },
  { label: "Palantir Technologies", lat: 39.7392, lon: -104.9903 },
  { label: "U.S. Department of Defense", lat: 38.8719, lon: -77.0563 },
  { label: "Joint Operations Command (SOCOM)", lat: 27.9506, lon: -82.4572 },
  { label: "U.S. Intelligence Community (ODNI)", lat: 38.9072, lon: -77.0369 },
  { label: "Google Cloud", lat: 37.3861, lon: -122.0839 },
  { label: "Israeli Defense Forces (AI Targeting)", lat: 32.0853, lon: 34.7818 },
  { label: "European Union Procurement", lat: 50.8503, lon: 4.3517 },
  { label: "Microsoft", lat: 47.673988, lon: -122.121513 },
  { label: "Local Law Enforcement (LAPD)", lat: 34.0522, lon: -118.2437 },
  { label: "Axon Enterprise", lat: 33.4942, lon: -111.9261 },
  { label: "Courts (Wisconsin)", lat: 43.0731, lon: -89.4012 },
  { label: "Equivant / Northpointe", lat: 40.7989, lon: -81.3784 },
  { label: "UN Governance", lat: 40.7128, lon: -74.006 },
  { label: "OpenAI", lat: 37.7749, lon: -122.4194 },
];

const LOI_CONNECTIONS: Array<{
  from: string;
  to: string;
  width?: number;
  title?: string;
  content?: string;
}> = [
  {
    from: "U.S. Federal Procurement",
    to: "Amazon Web Services (AWS)",
    width: 0.02,
    title: "U.S. Federal Procurement → AWS",
    content:
      "Origin: General Services Administration (GSA), Washington, DC, USA\n\n" +
      "Shifting To: Amazon Web Services HQ, Seattle, WA, USA\n\n" +
      "Origin of Responsibility: Public infrastructure governance\n\n" +
      "Responsibility Shift: State → Private cloud infrastructure\n\n" +
      "Summary: Public digital governance is transferred through procurement. Decision capacity moves from federal institutions to privately owned compute infrastructure.\n\n" +
      "Claim Chain: GSA: ‘We procure services.’ | AWS: ‘We provide infrastructure.’\n\n" +
      "System Meaning: Governance becomes technical dependency.",
  },
  {
    from: "Amazon Web Services (AWS)",
    to: "Palantir Technologies",
    width: 0.02,
    title: "AWS → Palantir",
    content:
      "Origin: AWS, Seattle, WA, USA\n\n" +
      "Shifting To: Palantir Technologies HQ, Denver, CO, USA\n\n" +
      "Origin of Responsibility: Infrastructure authority\n\n" +
      "Responsibility Shift: Compute → Decision architecture\n\n" +
      "Summary: Authority shifts from infrastructure provision to data modeling and decision architecture. Control moves from capacity to cognition.\n\n" +
      "Claim Chain: AWS: ‘We host systems.’ | Palantir: ‘We build analytics platforms.’\n\n" +
      "System Meaning: Power moves from hardware to interpretation.",
  },
  {
    from: "Palantir Technologies",
    to: "U.S. Department of Defense",
    width: 0.02,
    title: "Palantir → U.S. Department of Defense",
    content:
      "Origin: Palantir Technologies, Denver, CO, USA\n\n" +
      "Shifting To: Pentagon, Arlington, VA, USA\n\n" +
      "Origin of Responsibility: Algorithmic system design\n\n" +
      "Responsibility Shift: Vendor logic → State operational use\n\n" +
      "Summary: Decision frameworks move from private development into military operations. Judgment is embedded before deployment.\n\n" +
      "Claim Chain: Palantir: ‘We provide tools.’ | DoD: ‘We decide how to use them.’\n\n" +
      "System Meaning: Authority is embedded upstream.",
  },
  {
    from: "U.S. Department of Defense",
    to: "Joint Operations Command (SOCOM)",
    width: 0.02,
    title: "U.S. DoD → Joint Operations Command",
    content:
      "Origin: Pentagon, Arlington, VA, USA\n\n" +
      "Shifting To: SOCOM HQ, Tampa, FL, USA\n\n" +
      "Origin of Responsibility: Strategic command authority\n\n" +
      "Responsibility Shift: Policy command → Operational execution\n\n" +
      "Summary: Strategic authority becomes operational automation. Decisions transition from governance structures into execution systems.\n\n" +
      "Claim Chain: DoD: ‘We authorize missions.’ | Command units: ‘We execute orders.’\n\n" +
      "System Meaning: Governance becomes procedural.",
  },
  {
    from: "U.S. Intelligence Community (ODNI)",
    to: "Google Cloud",
    width: 0.02,
    title: "U.S. Intelligence → Google Cloud",
    content:
      "Origin: ODNI, Washington, DC, USA\n\n" +
      "Shifting To: Google HQ, Mountain View, CA, USA\n\n" +
      "Origin of Responsibility: State intelligence governance\n\n" +
      "Responsibility Shift: Public intelligence → Private AI infrastructure\n\n" +
      "Summary: Intelligence capacity is transferred to privately owned AI infrastructure. Analysis becomes platform-dependent.\n\n" +
      "Claim Chain: ODNI: ‘We oversee intelligence.’ | Google: ‘We provide AI services.’\n\n" +
      "System Meaning: Cognition becomes outsourced.",
  },
  {
    from: "Google Cloud",
    to: "Israeli Defense Forces (AI Targeting)",
    width: 0.02,
    title: "Google → Israeli Defense Forces",
    content:
      "Origin: Google Cloud, Mountain View, CA, USA\n\n" +
      "Shifting To: IDF Headquarters, Tel Aviv, Israel\n\n" +
      "Origin of Responsibility: AI infrastructure design\n\n" +
      "Responsibility Shift: Platform logic → Lethal operations\n\n" +
      "Summary: Decision systems cross jurisdictional boundaries. Responsibility fragments across national and corporate lines.\n\n" +
      "Claim Chain: Google: ‘We provide cloud services.’ | IDF: ‘We make operational decisions.’\n\n" +
      "System Meaning: Transnational governance without accountability.",
  },
  {
    from: "European Union Procurement",
    to: "Microsoft",
    width: 0.02,
    title: "EU Procurement → Microsoft",
    content:
      "Origin: European Commission, Brussels, Belgium\n\n" +
      "Shifting To: Microsoft HQ, Redmond, WA, USA\n\n" +
      "Origin of Responsibility: Public digital governance\n\n" +
      "Responsibility Shift: EU sovereignty → Corporate infrastructure\n\n" +
      "Summary: Digital sovereignty is restructured through procurement. Governance becomes dependent on foreign private platforms.\n\n" +
      "Claim Chain: EU: ‘We regulate technology.’ | Microsoft: ‘We provide platforms.’\n\n" +
      "System Meaning: Regulation without control.",
  },
  {
    from: "Local Law Enforcement (LAPD)",
    to: "Axon Enterprise",
    width: 0.02,
    title: "Local Law Enforcement → Axon",
    content:
      "Origin: Los Angeles Police Department, Los Angeles, CA, USA\n\n" +
      "Shifting To: Axon Enterprise HQ, Scottsdale, AZ, USA\n\n" +
      "Origin of Responsibility: Public safety governance\n\n" +
      "Responsibility Shift: Civic authority → Corporate surveillance systems\n\n" +
      "Summary: Policing authority becomes platform-mediated. Enforcement is shaped by proprietary systems.\n\n" +
      "Claim Chain: Police: ‘We enforce the law.’ | Axon: ‘We provide technology.’\n\n" +
      "System Meaning: Surveillance governance without transparency.",
  },
  {
    from: "Courts (Wisconsin)",
    to: "Equivant / Northpointe",
    width: 0.02,
    title: "Courts → COMPAS (Equivant)",
    content:
      "Origin: Wisconsin State Courts, Madison, WI, USA\n\n" +
      "Shifting To: Equivant HQ, Canton, OH, USA\n\n" +
      "Origin of Responsibility: Judicial judgment\n\n" +
      "Responsibility Shift: Legal reasoning → Algorithmic risk scoring\n\n" +
      "Summary: Sentencing authority becomes statistical assessment. Justice is transformed into probability.\n\n" +
      "Claim Chain: Courts: ‘Judges decide.’ | Vendor: ‘We provide risk tools.’\n\n" +
      "System Meaning: Law becomes computation.",
  },
  {
    from: "UN Governance",
    to: "OpenAI",
    width: 0.02,
    title: "UN Governance → OpenAI",
    content:
      "Origin: United Nations HQ, New York City, USA\n\n" +
      "Shifting To: OpenAI HQ, San Francisco, CA, USA\n\n" +
      "Origin of Responsibility: Global governance authority\n\n" +
      "Responsibility Shift: Multilateral governance → Private AI architecture\n\n" +
      "Summary: Global governance becomes technologically mediated. Norms are shaped by model design.\n\n" +
      "Claim Chain: UN: ‘We set norms.’ | OpenAI: ‘We build models.’\n\n" +
      "System Meaning: Normative power becomes technical power.",
  },
];

const CONNECTION_WIDTH_RANGE = { min: 260, max: 520 };

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const createGreatCirclePoints = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  radiusBase: number,
  segments = 256
) => {
  const startDir = start.clone().normalize();
  const endDir = end.clone().normalize();
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const dir = new THREE.Vector3().lerpVectors(startDir, endDir, t).normalize();
    points.push(dir.multiplyScalar(radiusBase));
  }
  return points;
};

const createLabelTexture = (label: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "600 28px Helvetica, Arial, sans-serif";
  context.fillStyle = "rgba(255, 236, 170, 0.95)";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, canvas.width / 2, canvas.height / 2);

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
  const [selectedConnection, setSelectedConnection] = useState<{
    from: string;
    to: string;
    width?: number;
    title?: string;
    content?: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

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
    const canvasEl = renderer.domElement;
    container.appendChild(canvasEl);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f7d26a"),
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      depthTest: true,
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
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const glowGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.02, 48, 48);
    const glowGlobe = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowGlobe);

    const continentMaterialFront = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f8d67c"),
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: true,
      alphaTest: 0.45,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const continentMaterialBack = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#c8a245"),
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      depthTest: false,
      alphaTest: 0.1,
      side: THREE.BackSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const continentGeometryFront = new THREE.SphereGeometry(GLOBE_RADIUS * 1.03, 64, 64);
    const continentGeometryBack = new THREE.SphereGeometry(GLOBE_RADIUS * 1.01, 64, 64);
    const continentsFront = new THREE.Mesh(continentGeometryFront, continentMaterialFront);
    continentsFront.renderOrder = 2.5;
    globeGroup.add(continentsFront);
    const continentsBack = new THREE.Mesh(continentGeometryBack, continentMaterialBack);
    continentsBack.renderOrder = 1.5;
    globeGroup.add(continentsBack);

    let landMaskTexture: THREE.Texture | null = null;
    createLandMaskTexture().then((texture) => {
      if (!texture) return;
      landMaskTexture = texture;
      continentMaterialFront.alphaMap = texture;
      continentMaterialFront.map = null;
      continentMaterialFront.opacity = 1;
      continentMaterialFront.depthWrite = false;
      continentMaterialFront.needsUpdate = true;
      continentMaterialBack.alphaMap = texture;
      continentMaterialBack.map = null;
      continentMaterialBack.opacity = 0.6;
      continentMaterialBack.depthWrite = false;
      continentMaterialBack.needsUpdate = true;
    });

    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    const connectionsGroup = new THREE.Group();
    globeGroup.add(connectionsGroup);
    const pickingGroup = new THREE.Group();
    scene.add(pickingGroup);

    const markerGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffe29a"),
    });
    const markerTextures: THREE.Texture[] = [];
    const connectionGeometries: THREE.BufferGeometry[] = [];
    const pickingGeometries: THREE.BufferGeometry[] = [];
    const connectionMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff4d4d"),
      transparent: false,
      opacity: 1,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
    });
    const pickingMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff0000"),
      transparent: true,
      opacity: 0.01,
      depthWrite: false,
      depthTest: false,
      visible: true,
      side: THREE.DoubleSide,
    });
    const loiPositions = new Map<string, THREE.Vector3>();

    LOIS.forEach((loi) => {
      const markerGroup = new THREE.Group();
      const position = latLonToVector3(loi.lat, loi.lon, GLOBE_RADIUS * 1.05);
      loiPositions.set(loi.label, position.clone());
      markerGroup.position.copy(position);
      markersGroup.add(markerGroup);

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.renderOrder = 3;
      markerGroup.add(marker);

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

    const connectionObjects: THREE.Object3D[] = [];

    LOI_CONNECTIONS.forEach((connection) => {
      const { from, to, width } = connection;
      const start = loiPositions.get(from);
      const end = loiPositions.get(to);
      if (!start || !end) return;
      const points = createGreatCirclePoints(start, end, GLOBE_RADIUS * 1.05, 256);
      const curve = new THREE.CatmullRomCurve3(points);
      const baseRadius = (width ?? 0.02) / 3;
      const geometry = new THREE.TubeGeometry(curve, 512, baseRadius, 16, false);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      connectionGeometries.push(geometry);
      const tube = new THREE.Mesh(geometry, connectionMaterial);
      tube.renderOrder = 2.8;
      tube.userData.connection = connection;
      tube.frustumCulled = false;
      connectionsGroup.add(tube);
      connectionObjects.push(tube);

      const pickGeometry = new THREE.TubeGeometry(curve, 64, baseRadius * 4, 8, false);
      pickGeometry.computeBoundingBox();
      pickGeometry.computeBoundingSphere();
      pickingGeometries.push(pickGeometry);
      const pickTube = new THREE.Mesh(pickGeometry, pickingMaterial);
      pickTube.userData.connection = connection;
      pickTube.frustumCulled = false;
      pickingGroup.add(pickTube);
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

    const onClick = (event: MouseEvent) => {
      if (isDragging) return;
      const rect = canvasEl.getBoundingClientRect();
      const pointer = pointerRef.current;
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(pointer, camera);

      // Update world matrices before raycasting
      globeGroup.updateMatrixWorld(true);
      connectionsGroup.updateMatrixWorld(true);
      pickingGroup.updateMatrixWorld(true);

      const hits = raycaster.intersectObjects(pickingGroup.children, true);
      if (hits.length > 0) {
        const hit = hits[0].object;
        const data = hit.userData.connection;
        if (data) {
          setSelectedConnection(data);
        }
      }
    };

    canvasEl.addEventListener("pointerdown", onPointerDown);
    canvasEl.addEventListener("pointermove", onPointerMove);
    canvasEl.addEventListener("pointerup", onPointerUp);
    canvasEl.addEventListener("pointerleave", onPointerUp);
    canvasEl.addEventListener("click", onClick);

    const resizeRenderer = () => {
      const { width, height } = canvasEl.getBoundingClientRect();
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
      // Sync picking group rotation with globe
      pickingGroup.rotation.copy(globeGroup.rotation);
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvasEl.removeEventListener("pointerdown", onPointerDown);
      canvasEl.removeEventListener("pointermove", onPointerMove);
      canvasEl.removeEventListener("pointerup", onPointerUp);
      canvasEl.removeEventListener("pointerleave", onPointerUp);
      canvasEl.removeEventListener("click", onClick);
      renderer.dispose();
      globeGeometry.dispose();
      glowGeometry.dispose();
      continentGeometryFront.dispose();
      continentGeometryBack.dispose();
      markerGeometry.dispose();
      wireframeMaterial.dispose();
      glowMaterial.dispose();
      continentMaterialFront.dispose();
      continentMaterialBack.dispose();
      markerMaterial.dispose();
      connectionGeometries.forEach((geometry) => geometry.dispose());
      pickingGeometries.forEach((geometry) => geometry.dispose());
      connectionMaterial.dispose();
      pickingMaterial.dispose();
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

  const panelWidth = selectedConnection
    ? Math.min(
        CONNECTION_WIDTH_RANGE.max,
        Math.max(
          CONNECTION_WIDTH_RANGE.min,
          320 + (selectedConnection.content?.length ?? 0) * 2
        )
      )
    : 0;
  const effectivePanelWidth = Math.min(panelWidth || 0, 420);
  const isPanelOpen = Boolean(selectedConnection);
  const panelMinWidth = isPanelOpen ? 280 : 0;
  const [introActive, setIntroActive] = useState(false);

  useEffect(() => {
    const updateIntroFlag = () => {
      setIntroActive(document.body.classList.contains("intro-active"));
    };
    updateIntroFlag();
    const observer = new MutationObserver(updateIntroFlag);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const selectOptions = LOI_CONNECTIONS.map((connection, idx) => ({
    id: `${connection.from}-${connection.to}-${idx}`,
    label: connection.title ?? `${connection.from} → ${connection.to}`,
    data: connection,
  }));

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!value) {
      setSelectedConnection(null);
      return;
    }
    const found = selectOptions.find((opt) => opt.id === value);
    if (found) {
      setSelectedConnection(found.data);
    }
  };

  const selectedId = selectOptions.find(
    (opt) =>
      opt.data.from === selectedConnection?.from &&
      opt.data.to === selectedConnection?.to &&
      opt.data.title === selectedConnection?.title
  )?.id;

  const globeShift = isPanelOpen ? "translateX(-300px)" : "translateX(0px)";

  return (
    <div className="relative flex h-full w-full bg-black text-gray-200">
      <div
        className={`pointer-events-none absolute right-4 top-4 z-50 transition-opacity duration-400 ${
          introActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <select
          className="pointer-events-auto rounded-lg border border-zinc-700 bg-zinc-900/85 px-3 py-2 text-sm text-gray-100 shadow-lg backdrop-blur-md"
          value={selectedId ?? ""}
          onChange={handleSelectChange}
          disabled={introActive}
        >
          <option value="">Select connection…</option>
          {selectOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className="relative flex-1 transition-transform duration-400"
        style={{ transform: globeShift, transitionTimingFunction: "cubic-bezier(0.22, 0.68, 0, 1)" }}
      >
        <div ref={containerRef} className="h-full w-full overflow-hidden" />
      </div>

      <div
        className={`pointer-events-auto absolute top-20 right-4 z-40 bg-zinc-900/85 border border-zinc-700 text-sm text-gray-100 px-4 py-3 backdrop-blur-md shadow-2xl flex flex-col gap-2 rounded-xl transition-all duration-400 ${
          isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          width: isPanelOpen ? `${effectivePanelWidth}px` : "0px",
          minWidth: isPanelOpen ? `${panelMinWidth}px` : "0px",
        }}
      >
        {isPanelOpen && (
          <>
            <div className="text-xs uppercase tracking-wide text-gray-400">Connection</div>
            <div className="text-base font-semibold text-gray-100">
              {selectedConnection?.title ?? `${selectedConnection?.from} → ${selectedConnection?.to}`}
            </div>
            <div className="text-sm leading-relaxed text-gray-100 space-y-2">
              {(selectedConnection?.content || "No content provided.")
                .split(/\n{2,}/)
                .map((block, idx) => (
                  <p key={idx}>{block}</p>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

