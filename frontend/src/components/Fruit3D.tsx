import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Fruit3DProps {
  fruitType: 'apple' | 'orange' | 'banana' | 'kiwi' | 'dragon' | 'watermelon' | 'all';
  interactive?: boolean;
}

export const Fruit3D: React.FC<Fruit3DProps> = ({ fruitType, interactive = false }) => {
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

    // 5. Build Programmatic Fruit Geometries (Recruiter wow factor)
    const fruitObjects: THREE.Object3D[] = [];

    const createApple = () => {
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
          // indent top
          posAttr.setY(i, y - 0.15 * (1.2 - Math.sqrt(x*x + z*z)));
        } else if (y < -0.8) {
          // indent bottom
          posAttr.setY(i, y + 0.12 * (1.2 - Math.sqrt(x*x + z*z)));
        }
      }
      bodyGeo.computeVertexNormals();

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48, // Crimson red
        roughness: 0.15,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      appleGroup.add(body);

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

      return appleGroup;
    };

    const createOrange = () => {
      const orangeGroup = new THREE.Group();

      // Orange body (sphere with bump texture simulation)
      const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Amber orange
        roughness: 0.6, // rough skin
        metalness: 0.0,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      orangeGroup.add(body);

      // Small green node at top
      const nodeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8);
      const nodeMat = new THREE.MeshStandardMaterial({ color: 0x065f46 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.y = 1.2;
      orangeGroup.add(node);

      return orangeGroup;
    };

    const createBanana = () => {
      const bananaGroup = new THREE.Group();
      
      // Model a banana curved body using extruded circle along quadratic curve
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.2, 0.5, 0),
        new THREE.Vector3(0, -0.6, 0),
        new THREE.Vector3(1.2, 0.7, 0)
      );

      // Extrude cylinder-like shape along path
      const bodyGeo = new THREE.TubeGeometry(curve, 32, 0.35, 12, false);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15, // Banana yellow
        roughness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      bananaGroup.add(body);

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

      return bananaGroup;
    };

    const createKiwi = () => {
      const kiwiGroup = new THREE.Group();

      // Kiwi body (ellipsoid)
      const bodyGeo = new THREE.SphereGeometry(1.1, 32, 32);
      bodyGeo.scale(1.3, 0.9, 0.9); // Stretch into oval
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x78350f, // fuzzy brown
        roughness: 0.8,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      kiwiGroup.add(body);

      return kiwiGroup;
    };

    const createDragon = () => {
      const dragonGroup = new THREE.Group();
      
      // Teardrop shape (Cone + Sphere combination)
      const bodyGeo = new THREE.SphereGeometry(1.1, 32, 32);
      bodyGeo.scale(1.0, 1.4, 1.0); // oval
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xec4899, // Pink dragon scale base
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      dragonGroup.add(body);

      // Add small green spikes/scales
      for (let i = 0; i < 8; i++) {
        const spikeGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        
        // Arrange spikes on the body
        const angle = (i / 8) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.9, (i % 3) * 0.4 - 0.4, Math.sin(angle) * 0.9);
        spike.rotation.x = (i % 3) * 0.5;
        spike.rotation.z = angle + Math.PI / 2;
        dragonGroup.add(spike);
      }

      return dragonGroup;
    };

    const createWatermelon = () => {
      const melonGroup = new THREE.Group();

      // Large striped green sphere
      const bodyGeo = new THREE.SphereGeometry(1.3, 32, 32);
      bodyGeo.scale(1.2, 1.0, 1.0);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x15803d, // dark green base
        roughness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      melonGroup.add(body);

      return melonGroup;
    };

    // 6. Spawn appropriate visual
    if (fruitType === 'all') {
      // Create background floating particle system representing multiple fruits
      const colors = [0xe11d48, 0xf59e0b, 0xfacc15, 0x78350f, 0xec4899, 0x15803d];
      
      // Floating small spheres (fruit bubbles)
      const particleGeo = new THREE.SphereGeometry(0.18, 16, 16);
      for (let i = 0; i < 25; i++) {
        const randColor = colors[Math.floor(Math.random() * colors.length)];
        const particleMat = new THREE.MeshStandardMaterial({
          color: randColor,
          roughness: 0.2,
          transparent: true,
          opacity: 0.75,
        });
        const mesh = new THREE.Mesh(particleGeo, particleMat);
        mesh.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4 - 2
        );
        mesh.userData = {
          spinSpeedX: (Math.random() - 0.5) * 0.02,
          spinSpeedY: (Math.random() - 0.5) * 0.02,
          floatSpeed: 0.005 + Math.random() * 0.01,
          floatOffset: Math.random() * Math.PI * 2,
        };
        group.add(mesh);
        fruitObjects.push(mesh);
      }

      // Add a couple of larger full models floating around
      const f1 = createApple();
      f1.position.set(-2, 1.5, -1.5);
      f1.scale.set(0.6, 0.6, 0.6);
      f1.userData = { spinSpeedX: 0.005, spinSpeedY: 0.01, floatSpeed: 0.008, floatOffset: 0 };
      group.add(f1);
      fruitObjects.push(f1);

      const f2 = createOrange();
      f2.position.set(2.2, -1.2, -1);
      f2.scale.set(0.6, 0.6, 0.6);
      f2.userData = { spinSpeedX: 0.008, spinSpeedY: 0.004, floatSpeed: 0.007, floatOffset: 2 };
      group.add(f2);
      fruitObjects.push(f2);

      const f3 = createBanana();
      f3.position.set(-1.8, -1.5, -2);
      f3.scale.set(0.5, 0.5, 0.5);
      f3.userData = { spinSpeedX: 0.003, spinSpeedY: 0.006, floatSpeed: 0.009, floatOffset: 4 };
      group.add(f3);
      fruitObjects.push(f3);

    } else {
      // Single product rendering
      let model: THREE.Object3D;
      switch (fruitType) {
        case 'apple':
          model = createApple();
          break;
        case 'orange':
          model = createOrange();
          break;
        case 'banana':
          model = createBanana();
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
        default:
          model = createApple();
      }
      model.scale.set(1.4, 1.4, 1.4);
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

      if (fruitType === 'all') {
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
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [fruitType, interactive]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center relative overflow-hidden" />;
};
export default Fruit3D;
