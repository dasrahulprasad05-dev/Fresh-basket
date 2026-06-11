import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Fruit3DProps {
  fruitType?: 'apple' | 'orange' | 'banana' | 'kiwi' | 'dragon' | 'watermelon' | 'mango' | 'pomegranate' | 'strawberry' | 'grapes' | 'pineapple' | 'litchi' | 'guava' | 'papaya' | 'chikoo' | 'blueberry' | 'jamun' | 'cherry' | 'custard_apple' | 'fig' | 'bael' | 'all';
  productName?: string;
  interactive?: boolean;
}

export const mapNameToFruitInfo = (name: string): {
  type: 'apple' | 'orange' | 'banana' | 'kiwi' | 'dragon' | 'watermelon' | 'mango' | 'pomegranate' | 'strawberry' | 'grapes' | 'pineapple' | 'litchi' | 'guava' | 'papaya' | 'chikoo' | 'blueberry' | 'jamun' | 'cherry' | 'custard_apple' | 'fig' | 'bael';
  color?: string;
  scale?: number;
} => {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes('honeycrisp')) {
    return { type: 'apple', color: '#e11d48' };
  }
  if (lowercaseName.includes('royal gala')) {
    return { type: 'apple', color: '#b71c1c' };
  }
  if (lowercaseName.includes('golden delicious')) {
    return { type: 'apple', color: '#f5d033' };
  }
  if (lowercaseName.includes('cherry') || lowercaseName.includes('cherries')) {
    return { type: 'cherry' };
  }
  if (lowercaseName.includes('bangalore blue')) {
    return { type: 'grapes', color: '#1a0a2e' };
  }
  if (lowercaseName.includes('nashik')) {
    return { type: 'grapes', color: '#8b0000' };
  }
  if (lowercaseName.includes('grapes')) {
    return { type: 'grapes' };
  }
  if (lowercaseName.includes('cavendish banana') || lowercaseName.includes('jalgaon golden')) {
    return { type: 'banana', color: '#f5e642' };
  }
  if (lowercaseName.includes('jalgaon red banana') || lowercaseName.includes('red banana')) {
    return { type: 'banana', color: '#c0392b' };
  }
  if (lowercaseName.includes('nendran')) {
    return { type: 'banana', color: '#c8960c', scale: 1.25 };
  }
  if (lowercaseName.includes('alphonso') || lowercaseName.includes('ratnagiri') || lowercaseName.includes('gir kesar')) {
    return { type: 'mango', color: '#f5a623' };
  }
  if (lowercaseName.includes('langra') || lowercaseName.includes('himsagar')) {
    return { type: 'mango', color: '#a8d400' };
  }
  if (lowercaseName.includes('pineapple')) {
    return { type: 'pineapple' };
  }
  if (lowercaseName.includes('guava')) {
    return { type: 'guava' };
  }
  if (lowercaseName.includes('pomegranate')) {
    return { type: 'pomegranate' };
  }
  if (lowercaseName.includes('litchi') || lowercaseName.includes('lychee')) {
    if (lowercaseName.includes('tezpur')) {
      return { type: 'litchi', color: '#e74c3c' };
    }
    return { type: 'litchi', color: '#c0392b' };
  }
  if (lowercaseName.includes('chikoo') || lowercaseName.includes('sapota')) {
    return { type: 'chikoo' };
  }
  if (lowercaseName.includes('papaya')) {
    return { type: 'papaya' };
  }
  if (lowercaseName.includes('fig') || lowercaseName.includes('anjeer')) {
    return { type: 'fig' };
  }
  if (lowercaseName.includes('bael') || lowercaseName.includes('wood apple')) {
    return { type: 'bael' };
  }
  if (lowercaseName.includes('kiwi')) {
    return { type: 'kiwi' };
  }
  if (lowercaseName.includes('dragon fruit') || lowercaseName.includes('pitaya')) {
    return { type: 'dragon' };
  }
  if (lowercaseName.includes('custard apple') || lowercaseName.includes('sitaphal')) {
    return { type: 'custard_apple' };
  }
  if (lowercaseName.includes('strawberry') || lowercaseName.includes('strawberries')) {
    return { type: 'strawberry' };
  }
  if (lowercaseName.includes('blueberr')) {
    return { type: 'blueberry' };
  }
  if (lowercaseName.includes('jamun') || lowercaseName.includes('blackberry')) {
    return { type: 'jamun' };
  }
  if (lowercaseName.includes('watermelon')) {
    return { type: 'watermelon' };
  }
  if (lowercaseName.includes('nagpur')) {
    return { type: 'orange', color: '#ff6b00' };
  }
  if (lowercaseName.includes('valencia')) {
    return { type: 'orange', color: '#ffa500' };
  }
  if (lowercaseName.includes('coorg') || lowercaseName.includes('khasi') || lowercaseName.includes('mandarin') || lowercaseName.includes('orange')) {
    return { type: 'orange', color: '#ffa500' };
  }
  if (lowercaseName.includes('gooseberry') || lowercaseName.includes('amla')) {
    return { type: 'orange', color: '#7cb518', scale: 0.6 };
  }

  console.warn('No 3D model match for:', name);
  return { type: 'apple' };
};

export const Fruit3D: React.FC<Fruit3DProps> = ({ fruitType, productName, interactive = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 300;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 1.5, 10);
    pointLight.position.set(-2, -2, 2);
    scene.add(pointLight);

    // Group to hold our fruit elements
    const group = new THREE.Group();
    scene.add(group);

    // Resolve fruit parameters
    let resolvedType: string = fruitType || 'apple';
    let resolvedColor: string | undefined = undefined;
    let resolvedScale: number | undefined = undefined;

    if (productName) {
      const info = mapNameToFruitInfo(productName);
      resolvedType = info.type;
      resolvedColor = info.color;
      resolvedScale = info.scale;
    }

    // 5. Build Programmatic Fruit Geometries (Recruiter wow factor)
    const fruitObjects: THREE.Object3D[] = [];

    const createApple = (color?: string, simplified = false) => {
      const appleGroup = new THREE.Group();
      
      // Apple body (slightly flattened sphere)
      const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
      // Deform sphere to make it apple-like (indent top and bottom)
      const posAttr = bodyGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const y = posAttr.getY(i);
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        if (y > 0.8) {
          posAttr.setY(i, y - 0.15 * (1.2 - Math.sqrt(x*x + z*z)));
        } else if (y < -0.8) {
          posAttr.setY(i, y + 0.12 * (1.2 - Math.sqrt(x*x + z*z)));
        }
      }
      bodyGeo.computeVertexNormals();

      const bodyMat = new THREE.MeshStandardMaterial({
        color: color ? new THREE.Color(color) : new THREE.Color(0xe11d48), // Crimson red
        roughness: 0.15,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      appleGroup.add(body);

      if (!simplified) {
        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.6, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 1.35;
        stem.rotation.z = -0.2;
        appleGroup.add(stem);

        // Leaf
        const leafGeo = new THREE.ConeGeometry(0.2, 0.5, 3);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(0.18, 1.45, 0);
        leaf.rotation.z = -0.7;
        appleGroup.add(leaf);
      }

      return appleGroup;
    };

    const createOrange = (color?: string, simplified = false) => {
      const orangeGroup = new THREE.Group();

      // Orange body
      const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: color ? new THREE.Color(color) : new THREE.Color(0xf59e0b), // Amber orange
        roughness: 0.6,
        metalness: 0.0,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      orangeGroup.add(body);

      if (!simplified) {
        // Small green node at top
        const nodeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8);
        const nodeMat = new THREE.MeshStandardMaterial({ color: 0x065f46 });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.y = 1.2;
        orangeGroup.add(node);
      }

      return orangeGroup;
    };

    const createBanana = (color?: string, simplified = false) => {
      const bananaGroup = new THREE.Group();
      
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.2, 0.5, 0),
        new THREE.Vector3(0, -0.6, 0),
        new THREE.Vector3(1.2, 0.7, 0)
      );

      const bodyGeo = new THREE.TubeGeometry(curve, 32, 0.35, 12, false);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: color ? new THREE.Color(color) : new THREE.Color(0xfacc15), // Banana yellow
        roughness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      bananaGroup.add(body);

      if (!simplified) {
        // Black tip at end
        const tipGeo = new THREE.SphereGeometry(0.36, 8, 8);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0x3f2a14 });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(-1.2, 0.5, 0);
        bananaGroup.add(tip);

        // Green stem at other end
        const stemGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(1.2, 0.7, 0);
        stem.rotation.z = 0.5;
        bananaGroup.add(stem);
      }

      return bananaGroup;
    };

    const createKiwi = (simplified = false) => {
      const kiwiGroup = new THREE.Group();

      // Kiwi body (ellipsoid)
      const bodyGeo = new THREE.SphereGeometry(0.85, 16, 16);
      bodyGeo.scale(1, 1.2, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x4a3000, // dark brown
        roughness: 0.95,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      kiwiGroup.add(body);

      if (!simplified) {
        // Fuzzy effect: add ~30 tiny spheres
        const hairGeo = new THREE.SphereGeometry(0.025, 4, 4);
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x3a2400, roughness: 0.95 });
        for (let i = 0; i < 30; i++) {
          const theta = Math.random() * Math.PI;
          const phi = Math.random() * Math.PI * 2;
          const x = 0.85 * Math.sin(theta) * Math.cos(phi);
          const y = 0.85 * 1.2 * Math.cos(theta);
          const z = 0.85 * Math.sin(theta) * Math.sin(phi);
          const hair = new THREE.Mesh(hairGeo, hairMat);
          hair.position.set(x, y, z);
          kiwiGroup.add(hair);
        }

        // Small oval flat patches on ends
        const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 12);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95 });
        const capTop = new THREE.Mesh(capGeo, capMat);
        capTop.position.y = 0.85 * 1.2;
        const capBottom = new THREE.Mesh(capGeo, capMat);
        capBottom.position.y = -0.85 * 1.2;
        kiwiGroup.add(capTop, capBottom);
      }

      return kiwiGroup;
    };

    const createDragon = (simplified = false) => {
      const dragonGroup = new THREE.Group();
      
      const bodyGeo = new THREE.SphereGeometry(1.1, 32, 32);
      bodyGeo.scale(1.0, 1.4, 1.0);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      dragonGroup.add(body);

      if (!simplified) {
        for (let i = 0; i < 8; i++) {
          const spikeGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
          const spikeMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
          const spike = new THREE.Mesh(spikeGeo, spikeMat);
          
          const angle = (i / 8) * Math.PI * 2;
          spike.position.set(Math.cos(angle) * 0.9, (i % 3) * 0.4 - 0.4, Math.sin(angle) * 0.9);
          spike.rotation.x = (i % 3) * 0.5;
          spike.rotation.z = angle + Math.PI / 2;
          dragonGroup.add(spike);
        }
      }

      return dragonGroup;
    };

    const createWatermelon = (simplified = false) => {
      const melonGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x2d5a1b, // base color
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      melonGroup.add(body);

      if (!simplified) {
        // Lighter green stripes (6 TorusGeometry instances slightly rotated)
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x4a7c2f, roughness: 0.2 });
        for (let i = 0; i < 6; i++) {
          const ringGeo = new THREE.TorusGeometry(1.21, 0.04, 4, 40);
          const angle = (i / 6) * Math.PI;
          ringGeo.rotateY(angle);
          ringGeo.rotateX(0.08 * (i % 2 === 0 ? 1 : -1));
          const ring = new THREE.Mesh(ringGeo, ringMat);
          melonGroup.add(ring);
        }

        // Small dried stem nub at top
        const stemGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.15, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d2c1f, roughness: 0.9 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 1.2;
        melonGroup.add(stem);
      }

      return melonGroup;
    };

    const createMango = (color?: string, simplified = false) => {
      const mangoGroup = new THREE.Group();
      
      const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
      bodyGeo.scale(0.85, 1.2, 0.75);
      
      // Deform to kidney/teardrop shape
      const posAttr = bodyGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        if (y > 0) {
          posAttr.setX(i, x - 0.12 * y);
        }
      }
      bodyGeo.computeVertexNormals();

      const bodyMat = new THREE.MeshStandardMaterial({
        color: color ? new THREE.Color(color) : new THREE.Color(0xf5a623), // Alphonso/Kesar
        roughness: 0.4,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      mangoGroup.add(body);

      if (!simplified) {
        // Small bump at stem end
        const bumpGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const bumpMat = new THREE.MeshStandardMaterial({
          color: color ? new THREE.Color(color) : new THREE.Color(0xf5a623),
          roughness: 0.4
        });
        const bump = new THREE.Mesh(bumpGeo, bumpMat);
        bump.position.set(-0.1, 1.15, 0);
        mangoGroup.add(bump);

        // Thin stem
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.9 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(-0.1, 1.25, 0);
        stem.rotation.z = -0.2;
        mangoGroup.add(stem);
      }

      return mangoGroup;
    };

    const createPomegranate = (simplified = false) => {
      const pomGroup = new THREE.Group();
      
      const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
      bodyGeo.scale(1, 0.95, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x8b1a1a, // deep red
        roughness: 0.22,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      pomGroup.add(body);

      if (!simplified) {
        // Calyx base ring
        const ringGeo = new THREE.TorusGeometry(0.25, 0.04, 8, 16);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a0000, roughness: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.94;
        pomGroup.add(ring);

        // Crown star
        for (let i = 0; i < 6; i++) {
          const cylGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.25);
          const cylMat = new THREE.MeshStandardMaterial({ color: 0x3d0000, roughness: 0.6 });
          const cyl = new THREE.Mesh(cylGeo, cylMat);
          const angle = (i / 6) * Math.PI * 2;
          cyl.position.set(Math.cos(angle) * 0.18, 1.02, Math.sin(angle) * 0.18);
          cyl.rotation.x = Math.sin(angle) * 0.4;
          cyl.rotation.z = -Math.cos(angle) * 0.4;
          cyl.rotation.y = angle;
          pomGroup.add(cyl);
        }
      }

      return pomGroup;
    };

    const createStrawberry = (simplified = false) => {
      const strawGroup = new THREE.Group();
      const bodyGeo = new THREE.ConeGeometry(0.9, 1.45, 32);
      bodyGeo.rotateX(Math.PI);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        roughness: 0.18,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      strawGroup.add(body);

      if (!simplified) {
        for (let i = 0; i < 6; i++) {
          const leafGeo = new THREE.ConeGeometry(0.14, 0.42, 4);
          const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          const angle = (i / 6) * Math.PI * 2;
          leaf.position.set(Math.cos(angle) * 0.32, 0.68, Math.sin(angle) * 0.32);
          leaf.rotation.z = -angle - Math.PI / 4;
          strawGroup.add(leaf);
        }

        const seedGeo = new THREE.SphereGeometry(0.024, 8, 8);
        const seedMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1 });
        for (let j = 0; j < 32; j++) {
          const seed = new THREE.Mesh(seedGeo, seedMat);
          const theta = Math.random() * Math.PI * 0.7 + 0.1;
          const phi = Math.random() * Math.PI * 2;
          const radius = 0.88 * (1 - (theta / Math.PI));
          const y = -0.7 + 1.4 * (theta / Math.PI);
          seed.position.set(
            Math.cos(phi) * radius,
            y,
            Math.sin(phi) * radius
          );
          strawGroup.add(seed);
        }
      }

      return strawGroup;
    };

    const createGrapes = (color?: string, simplified = false) => {
      const grapesGroup = new THREE.Group();
      const grapeGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const grapeMat = new THREE.MeshStandardMaterial({
        color: color ? new THREE.Color(color) : new THREE.Color(0x581c87),
        roughness: 0.15,
        metalness: 0.05,
      });

      const positions = simplified ? [
        [0, 0.3, 0],
        [-0.18, 0, 0.18], [0.18, 0, 0.18],
        [0, -0.3, 0]
      ] : [
        [0, 0.55, 0],
        [-0.18, 0.25, 0.18], [0.18, 0.25, 0.18], [0, 0.25, -0.25],
        [-0.28, 0, 0], [0.28, 0, 0], [0, 0, 0.28], [0, 0, -0.28],
        [-0.18, -0.25, 0.12], [0.18, -0.25, 0.12], [0, -0.25, -0.18],
        [0, -0.55, 0]
      ];

      positions.forEach(([x, y, z]) => {
        const grape = new THREE.Mesh(grapeGeo, grapeMat);
        grape.position.set(x, y, z);
        grapesGroup.add(grape);
      });

      if (!simplified) {
        const stemGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.8 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.8;
        stem.rotation.z = 0.22;
        grapesGroup.add(stem);
      }

      return grapesGroup;
    };

    const createPineapple = (simplified = false) => {
      const pineappleGroup = new THREE.Group();

      // Body: octagonal cylinder
      const bodyGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.8, 8, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xc8960c,
        roughness: 0.5,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      pineappleGroup.add(body);

      if (!simplified) {
        // Overlay bumps in grid
        const bumpGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const bumpMat = new THREE.MeshStandardMaterial({ color: 0xa0700a, roughness: 0.6 });
        for (let r = 0; r < 4; r++) {
          const y = -0.7 + (r / 3) * 1.4;
          const radiusAtY = 0.65 - (r / 3) * 0.1;
          const numSpheres = 6;
          const offsetAngle = (r % 2) * (Math.PI / numSpheres);
          for (let s = 0; s < numSpheres; s++) {
            const angle = (s / numSpheres) * Math.PI * 2 + offsetAngle;
            const bump = new THREE.Mesh(bumpGeo, bumpMat);
            bump.position.set(
              Math.cos(angle) * (radiusAtY + 0.02),
              y,
              Math.sin(angle) * (radiusAtY + 0.02)
            );
            pineappleGroup.add(bump);
          }
        }

        // Crown: cones fanned outward at top
        for (let i = 0; i < 6; i++) {
          const coneGeo = new THREE.ConeGeometry(0.08, 0.6, 5);
          const coneMat = new THREE.MeshStandardMaterial({ color: 0x2d7a1f, roughness: 0.5 });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          const angle = (i / 6) * Math.PI * 2;
          cone.position.set(Math.cos(angle) * 0.15, 1.1, Math.sin(angle) * 0.15);
          cone.rotation.x = Math.sin(angle) * 0.35;
          cone.rotation.z = -Math.cos(angle) * 0.35;
          cone.rotation.y = angle;
          pineappleGroup.add(cone);
        }

        const centerConeGeo = new THREE.ConeGeometry(0.08, 0.7, 5);
        const centerConeMat = new THREE.MeshStandardMaterial({ color: 0x2d7a1f, roughness: 0.5 });
        const centerCone = new THREE.Mesh(centerConeGeo, centerConeMat);
        centerCone.position.set(0, 1.25, 0);
        pineappleGroup.add(centerCone);
      }

      return pineappleGroup;
    };

    const createLitchi = (color?: string, simplified = false) => {
      const litchiGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(0.9, 16, 16);
      if (!simplified) {
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          const len = Math.sqrt(x*x + y*y + z*z);
          if (len > 0) {
            const nx = x / len;
            const ny = y / len;
            const nz = z / len;
            const offset = (Math.random() - 0.5) * 0.1; // +/- 0.05
            pos.setX(i, x + nx * offset);
            pos.setY(i, y + ny * offset);
            pos.setZ(i, z + nz * offset);
          }
        }
        bodyGeo.computeVertexNormals();
      }

      const bodyMat = new THREE.MeshStandardMaterial({
        color: color ? new THREE.Color(color) : new THREE.Color(0xc0392b),
        roughness: 0.7,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      litchiGroup.add(body);

      if (!simplified) {
        // Short thin stem
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.9 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.98;
        stem.rotation.z = -0.15;
        litchiGroup.add(stem);

        // Leaf pair
        const leafGeo = new THREE.PlaneGeometry(0.4, 0.2);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.6, side: THREE.DoubleSide });
        const leaf1 = new THREE.Mesh(leafGeo, leafMat);
        leaf1.position.set(0.12, 1.0, 0.05);
        leaf1.rotation.set(0.3, 0.4, 0.5);
        const leaf2 = new THREE.Mesh(leafGeo, leafMat);
        leaf2.position.set(-0.12, 1.0, -0.05);
        leaf2.rotation.set(-0.3, -0.4, -0.5);
        litchiGroup.add(leaf1, leaf2);
      }

      return litchiGroup;
    };

    const createGuava = (simplified = false) => {
      const guavaGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
      bodyGeo.scale(1, 1.1, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xc8e6a0,
        roughness: 0.8,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      guavaGroup.add(body);

      if (!simplified) {
        // Bottom calyx segments
        for (let i = 0; i < 5; i++) {
          const segmentGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.15);
          const segmentMat = new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.8 });
          const segment = new THREE.Mesh(segmentGeo, segmentMat);
          const angle = (i / 5) * Math.PI * 2;
          segment.position.set(Math.cos(angle) * 0.08, -1.1, Math.sin(angle) * 0.08);
          segment.rotation.x = Math.sin(angle) * 0.5 + Math.PI / 2;
          segment.rotation.z = -Math.cos(angle) * 0.5;
          guavaGroup.add(segment);
        }
      }

      return guavaGroup;
    };

    const createPapaya = (simplified = false) => {
      const papayaGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
      bodyGeo.scale(0.8, 1.5, 0.8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf39c12,
        roughness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      papayaGroup.add(body);

      if (!simplified) {
        // Flat ring at bottom
        const ringGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 16);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x995c00, roughness: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = -1.48;
        papayaGroup.add(ring);

        // Stem brown
        const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.9 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 1.55;
        papayaGroup.add(stem);
      }

      return papayaGroup;
    };

    const createChikoo = (simplified = false) => {
      const chikooGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(0.85, 16, 16);
      bodyGeo.scale(1, 1.15, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x8b6914,
        roughness: 0.95,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      chikooGroup.add(body);

      if (!simplified) {
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.95 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.98;
        chikooGroup.add(stem);

        const leafGeo = new THREE.PlaneGeometry(0.2, 0.1);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.95, side: THREE.DoubleSide });
        const leaf1 = new THREE.Mesh(leafGeo, leafMat);
        leaf1.position.set(0.06, 0.98, 0.03);
        leaf1.rotation.set(0.2, 0.3, 0.4);
        const leaf2 = new THREE.Mesh(leafGeo, leafMat);
        leaf2.position.set(-0.06, 0.98, -0.03);
        leaf2.rotation.set(-0.2, -0.3, -0.4);
        chikooGroup.add(leaf1, leaf2);
      }

      return chikooGroup;
    };

    const createBlueberry = (simplified = false) => {
      const blueberryGroup = new THREE.Group();

      if (simplified) {
        const bodyGeo = new THREE.SphereGeometry(0.7, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a235a, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        blueberryGroup.add(body);
        return blueberryGroup;
      }

      const positions = [
        [0, 0, 0],
        [0.4, 0.2, 0.3],
        [-0.4, -0.2, 0.2],
        [0.2, -0.4, -0.3],
        [-0.2, 0.4, -0.4]
      ];

      positions.forEach(([bx, by, bz]) => {
        const berry = new THREE.Group();
        const bodyGeo = new THREE.SphereGeometry(0.38, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x4a235a,
          roughness: 0.2,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        berry.add(body);

        for (let i = 0; i < 5; i++) {
          const cylGeo = new THREE.CylinderGeometry(0.015, 0.008, 0.08);
          const cylMat = new THREE.MeshStandardMaterial({ color: 0x2d1040 });
          const cyl = new THREE.Mesh(cylGeo, cylMat);
          const angle = (i / 5) * Math.PI * 2;
          cyl.position.set(Math.cos(angle) * 0.08, 0.38, Math.sin(angle) * 0.08);
          cyl.rotation.x = Math.sin(angle) * 0.4;
          cyl.rotation.z = -Math.cos(angle) * 0.4;
          berry.add(cyl);
        }

        berry.position.set(bx, by, bz);
        blueberryGroup.add(berry);
      });

      return blueberryGroup;
    };

    const createJamun = (simplified = false) => {
      const jamunGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(0.7, 16, 16);
      bodyGeo.scale(0.85, 1.2, 0.85);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1a0a2e,
        roughness: 0.8,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      jamunGroup.add(body);

      if (!simplified) {
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.95 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.92;
        stem.rotation.z = 0.15;
        jamunGroup.add(stem);
      }

      return jamunGroup;
    };

    const createCherry = (simplified = false) => {
      const cherryGroup = new THREE.Group();

      if (simplified) {
        const bodyGeo = new THREE.SphereGeometry(0.75, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.15 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        cherryGroup.add(body);
        return cherryGroup;
      }

      // Cherry 1
      const c1Geo = new THREE.SphereGeometry(0.55, 16, 16);
      const c1Mat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.15 });
      const c1 = new THREE.Mesh(c1Geo, c1Mat);
      c1.position.set(-0.6, -0.3, 0);
      cherryGroup.add(c1);

      // Cherry 2
      const c2Geo = new THREE.SphereGeometry(0.55, 16, 16);
      const c2Mat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.15 });
      const c2 = new THREE.Mesh(c2Geo, c2Mat);
      c2.position.set(0.6, -0.3, 0);
      cherryGroup.add(c2);

      // Forked stem
      const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2), new THREE.MeshStandardMaterial({ color: 0x4d7c0f }));
      stem1.position.set(-0.3, 0.25, 0);
      stem1.rotation.z = -0.45;
      cherryGroup.add(stem1);

      const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2), new THREE.MeshStandardMaterial({ color: 0x4d7c0f }));
      stem2.position.set(0.3, 0.25, 0);
      stem2.rotation.z = 0.45;
      cherryGroup.add(stem2);

      const mainStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2), new THREE.MeshStandardMaterial({ color: 0x3f6212 }));
      mainStem.position.set(0, 0.85, 0);
      cherryGroup.add(mainStem);

      return cherryGroup;
    };

    const createCustardApple = (simplified = false) => {
      const sitaphalGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(1, 8, 8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x4a7c2f,
        roughness: 0.65,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      sitaphalGroup.add(body);

      if (!simplified) {
        const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.95 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 1.05;
        sitaphalGroup.add(stem);
      }

      return sitaphalGroup;
    };

    const createFig = (simplified = false) => {
      const figGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
      bodyGeo.scale(0.85, 1.3, 0.85);
      
      const pos = bodyGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        if (y > 0) {
          const factor = 1 - (y / 1.3) * 0.45;
          pos.setX(i, x * factor);
          pos.setZ(i, pos.getZ(i) * factor);
        }
      }
      bodyGeo.computeVertexNormals();

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x5d2e8c,
        roughness: 0.4,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      figGroup.add(body);

      if (!simplified) {
        const stemGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.2);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d240d, roughness: 0.85 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 1.25;
        figGroup.add(stem);

        const ringGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x221133, roughness: 0.95 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = -1.28;
        figGroup.add(ring);
      }

      return figGroup;
    };

    const createBael = (simplified = false) => {
      const baelGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(1.1, 32, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xbfa060,
        roughness: 0.95,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      baelGroup.add(body);

      if (!simplified) {
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 1.15;
        baelGroup.add(stem);

        const leafGeo = new THREE.PlaneGeometry(0.18, 0.08);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95, side: THREE.DoubleSide });
        const leaf1 = new THREE.Mesh(leafGeo, leafMat);
        leaf1.position.set(0.06, 1.15, 0.03);
        leaf1.rotation.set(0.2, 0.3, 0.4);
        const leaf2 = new THREE.Mesh(leafGeo, leafMat);
        leaf2.position.set(-0.06, 1.15, -0.03);
        leaf2.rotation.set(-0.2, -0.3, -0.4);
        baelGroup.add(leaf1, leaf2);

        for (let i = 0; i < 3; i++) {
          const ringGeo = new THREE.TorusGeometry(1.11, 0.02, 4, 40);
          if (i === 0) ringGeo.rotateX(Math.PI / 2);
          else if (i === 1) ringGeo.rotateY(Math.PI / 2);
          else ringGeo.rotateZ(Math.PI / 2);
          const ringMat = new THREE.MeshStandardMaterial({ color: 0xa88d50, roughness: 0.95 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          baelGroup.add(ring);
        }
      }

      return baelGroup;
    };

    // 6. Spawn appropriate visual
    if (resolvedType === 'all') {
      // Floating small simplified fruit shapes (LOD version for hero background)
      // Excludes blueberry and cherry from particle pool as requested
      const creators = [
        () => createApple(undefined, true),
        () => createOrange(undefined, true),
        () => createBanana(undefined, true),
        () => createKiwi(true),
        () => createDragon(true),
        () => createWatermelon(true),
        () => createMango(undefined, true),
        () => createPomegranate(true),
        () => createStrawberry(true),
        () => createGrapes(undefined, true),
        () => createPineapple(true),
        () => createLitchi(undefined, true),
        () => createGuava(true),
        () => createPapaya(true),
        () => createChikoo(true),
        () => createJamun(true),
        () => createCustardApple(true),
        () => createFig(true),
        () => createBael(true)
      ];

      for (let i = 0; i < 60; i++) {
        const creator = creators[Math.floor(Math.random() * creators.length)];
        const mesh = creator();
        
        // Traverse and apply semi-translucent properties for background bubble effect
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Clone materials so color changes don't affect other instances
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = 0.5 + Math.random() * 0.35;
          }
        });

        mesh.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6 - 2.5
        );
        const scale = 0.15 + Math.random() * 0.15;
        mesh.scale.set(scale, scale, scale);
        mesh.userData = {
          spinSpeedX: (Math.random() - 0.5) * 0.015,
          spinSpeedY: (Math.random() - 0.5) * 0.015,
          floatSpeed: 0.003 + Math.random() * 0.008,
          floatOffset: Math.random() * Math.PI * 2,
        };
        group.add(mesh);
        fruitObjects.push(mesh);
      }

      // Add a diverse selection of 8 larger floating detailed fruit models
      const models = [
        { model: createApple(), pos: [-2.2, 1.8, -1.5], scale: 0.62 },
        { model: createOrange(), pos: [2.5, -1.2, -1.0], scale: 0.62 },
        { model: createBanana(), pos: [-2.0, -1.8, -2.0], scale: 0.52 },
        { model: createMango(), pos: [1.8, 1.8, -1.8], scale: 0.58 },
        { model: createPomegranate(), pos: [-1.2, 0.5, -2.5], scale: 0.58 },
        { model: createGrapes(), pos: [2.2, 0.4, -2.2], scale: 0.58 },
        { model: createStrawberry(), pos: [0.8, -1.6, -1.5], scale: 0.58 },
        { model: createKiwi(), pos: [-0.5, -2.0, -2.0], scale: 0.58 }
      ];

      models.forEach((item, index) => {
        const f = item.model;
        f.position.set(item.pos[0], item.pos[1], item.pos[2]);
        f.scale.set(item.scale, item.scale, item.scale);
        f.userData = {
          spinSpeedX: 0.002 + Math.random() * 0.006,
          spinSpeedY: 0.004 + Math.random() * 0.008,
          floatSpeed: 0.005 + Math.random() * 0.005,
          floatOffset: index * 1.5
        };
        group.add(f);
        fruitObjects.push(f);
      });

    } else {
      // Single product rendering
      let model: THREE.Object3D;
      switch (resolvedType) {
        case 'apple':
          model = createApple(resolvedColor);
          break;
        case 'orange':
          model = createOrange(resolvedColor);
          break;
        case 'banana':
          model = createBanana(resolvedColor);
          break;
        case 'kiwi':
          model = createKiwi();
          break;
        case 'dragon':
          model = createDragon();
          break;
        case 'watermelon':
          model = createWatermelon();
          break;
        case 'mango':
          model = createMango(resolvedColor);
          break;
        case 'pomegranate':
          model = createPomegranate();
          break;
        case 'strawberry':
          model = createStrawberry();
          break;
        case 'grapes':
          model = createGrapes(resolvedColor);
          break;
        case 'pineapple':
          model = createPineapple();
          break;
        case 'litchi':
          model = createLitchi(resolvedColor);
          break;
        case 'guava':
          model = createGuava();
          break;
        case 'papaya':
          model = createPapaya();
          break;
        case 'chikoo':
          model = createChikoo();
          break;
        case 'blueberry':
          model = createBlueberry();
          break;
        case 'jamun':
          model = createJamun();
          break;
        case 'cherry':
          model = createCherry();
          break;
        case 'custard_apple':
          model = createCustardApple();
          break;
        case 'fig':
          model = createFig();
          break;
        case 'bael':
          model = createBael();
          break;
        default:
          model = createApple(resolvedColor);
      }
      const finalScale = 1.4 * (resolvedScale || 1);
      model.scale.set(finalScale, finalScale, finalScale);
      group.add(model);
      fruitObjects.push(model);
    }

    // 7. Mouse interaction / Drag rotating for interactive single viewer
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !interactive || fruitObjects.length === 0) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };

      // Rotate the group based on drag distance
      group.rotation.y += deltaMove.x * 0.01;
      group.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    if (interactive) {
      const domEl = renderer.domElement;
      domEl.style.cursor = 'grab';
      domEl.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // 8. Animation frame loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (resolvedType === 'all') {
        // Floating drift and idle rotation for hero particles
        fruitObjects.forEach((obj) => {
          const ud = obj.userData;
          obj.rotation.x += ud.spinSpeedX || 0.005;
          obj.rotation.y += ud.spinSpeedY || 0.005;
          // Float vertical sinus wave
          obj.position.y += Math.sin(elapsedTime * 2 + (ud.floatOffset || 0)) * (ud.floatSpeed || 0.002);
        });
      } else {
        // Idle spin for single fruit if not dragging
        if (!isDragging) {
          group.rotation.y += 0.01;
          group.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Clean-up on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        const domEl = renderer.domElement;
        domEl.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
      
      // Traverse scene to dispose resources and prevent memory leaks
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [fruitType, productName, interactive]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center relative overflow-hidden" />;
};
export default Fruit3D;
