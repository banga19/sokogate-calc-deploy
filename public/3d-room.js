// ============================================================
// Sokogate 3D Room Visualizer - Three.js Configuration
// ============================================================
// This file contains two 3D systems:
// 1. Material Preview Scene (init3DScene, renderResults) - shows materials like bricks, cement bags etc.
// 2. Room Visualizer Scene (initRoom3D, updateRoom3D) - shows a scaled 3D room with walls/floor/ceiling

// ============================================================
// ROOM VISUALIZER SCENE
// ============================================================
let roomScene, roomCamera, roomRenderer, roomGroup, roomContainer;
let roomOrbitState = null;

function initRoom3D(containerId) {
  roomContainer = document.getElementById(containerId);
  if (!roomContainer) return;

  // Scene
  roomScene = new THREE.Scene();
  roomScene.background = new THREE.Color(0xf0f4f8);

  // Camera
  const aspect = roomContainer.clientWidth / roomContainer.clientHeight;
  roomCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  roomCamera.position.set(5, 4, 5);

  // Renderer
  roomRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  roomRenderer.setSize(roomContainer.clientWidth, roomContainer.clientHeight);
  roomRenderer.shadowMap.enabled = true;
  roomRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  roomContainer.appendChild(roomRenderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  roomScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 15, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  roomScene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.3);
  fillLight.position.set(-5, 5, -5);
  roomScene.add(fillLight);

  // Ground plane (outside the room)
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  roomScene.add(ground);

  // Grid helper
  const gridHelper = new THREE.GridHelper(20, 20, 0x94a3b8, 0xcbd5e1);
  gridHelper.position.y = 0.001;
  roomScene.add(gridHelper);

  // Room group
  roomGroup = new THREE.Group();
  roomScene.add(roomGroup);

  // Dimension labels overlay
  const dimensionLabels = document.createElement('div');
  dimensionLabels.id = 'dimension-labels';
  dimensionLabels.style.position = 'absolute';
  dimensionLabels.style.top = '10px';
  dimensionLabels.style.left = '10px';
  dimensionLabels.style.color = '#333';
  dimensionLabels.style.fontSize = '14px';
  dimensionLabels.style.fontFamily = 'Arial, sans-serif';
  dimensionLabels.style.background = 'rgba(255, 255, 255, 0.9)';
  dimensionLabels.style.padding = '8px 12px';
  dimensionLabels.style.borderRadius = '6px';
  dimensionLabels.style.pointerEvents = 'none';
  dimensionLabels.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  dimensionLabels.innerHTML = 'Height: -- ft<br>Width: -- ft<br>Length: -- ft';
  roomContainer.appendChild(dimensionLabels);

  // Initialize orbit controls
  initRoomOrbitControls();

  // Initial render
  roomRenderer.render(roomScene, roomCamera);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    roomRenderer.render(roomScene, roomCamera);
  }
  animate();

  // Handle resize
  window.addEventListener('resize', debounceRoomResize);
}

function initRoomOrbitControls() {
  if (!roomContainer || !roomCamera) return;

  roomOrbitState = {
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    spherical: { radius: 10, theta: Math.PI / 4, phi: Math.PI / 3 }
  };

  function updateCamera() {
    const r = roomOrbitState.spherical.radius;
    const theta = roomOrbitState.spherical.theta;
    const phi = roomOrbitState.spherical.phi;
    roomCamera.position.x = r * Math.sin(phi) * Math.cos(theta);
    roomCamera.position.y = r * Math.cos(phi);
    roomCamera.position.z = r * Math.sin(phi) * Math.sin(theta);
    roomCamera.lookAt(0, 0, 0);
  }
  updateCamera();

  // Mouse events
  roomContainer.addEventListener('mousedown', (e) => {
    roomOrbitState.isDragging = true;
    roomOrbitState.previousMousePosition = { x: e.clientX, y: e.clientY };
    roomContainer.style.cursor = 'grabbing';
  });

  roomContainer.addEventListener('mousemove', (e) => {
    if (!roomOrbitState.isDragging) return;
    const deltaMove = {
      x: e.clientX - roomOrbitState.previousMousePosition.x,
      y: e.clientY - roomOrbitState.previousMousePosition.y
    };
    roomOrbitState.spherical.theta -= deltaMove.x * 0.008;
    roomOrbitState.spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, roomOrbitState.spherical.phi + deltaMove.y * 0.008));
    updateCamera();
    roomOrbitState.previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  roomContainer.addEventListener('mouseup', () => {
    roomOrbitState.isDragging = false;
    roomContainer.style.cursor = 'grab';
  });

  roomContainer.addEventListener('mouseleave', () => {
    roomOrbitState.isDragging = false;
    roomContainer.style.cursor = 'grab';
  });

  // Touch events
  roomContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      roomOrbitState.isDragging = true;
      roomOrbitState.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  roomContainer.addEventListener('touchmove', (e) => {
    if (!roomOrbitState.isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const deltaMove = {
      x: e.touches[0].clientX - roomOrbitState.previousMousePosition.x,
      y: e.touches[0].clientY - roomOrbitState.previousMousePosition.y
    };
    roomOrbitState.spherical.theta -= deltaMove.x * 0.008;
    roomOrbitState.spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, roomOrbitState.spherical.phi + deltaMove.y * 0.008));
    updateCamera();
    roomOrbitState.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  roomContainer.addEventListener('touchend', () => {
    roomOrbitState.isDragging = false;
  });

  // Zoom (scroll wheel)
  roomContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    roomOrbitState.spherical.radius = Math.max(2, Math.min(50, roomOrbitState.spherical.radius + e.deltaY * 0.01));
    updateCamera();
  });

  roomContainer.style.cursor = 'grab';
}

function debounceRoomResize() {
  if (!roomContainer || !roomRenderer || !roomCamera) return;
  const width = roomContainer.clientWidth;
  const height = roomContainer.clientHeight;
  roomCamera.aspect = width / height;
  roomCamera.updateProjectionMatrix();
  roomRenderer.setSize(width, height);
}

function updateRoom3D(dimensions, unit) {
  if (!roomGroup || !roomCamera || !roomOrbitState) return;

  // Clear existing room
  while (roomGroup.children.length > 0) {
    const child = roomGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
    roomGroup.remove(child);
  }

  // Convert to meters for consistent 3D scaling (1 unit = 1 meter)
  const conversionFactor = unit === 'm' ? 1 : 0.3048;
  const height = dimensions.heightM || (dimensions.height * conversionFactor);
  const width = dimensions.widthM || (dimensions.width * conversionFactor);
  const length = dimensions.lengthM || (dimensions.length * conversionFactor);

  // Materials
  const floorMaterial = new THREE.MeshLambertMaterial({
    color: 0x8B4513,
    side: THREE.DoubleSide
  }); // Brown floor

  const wallMaterial = new THREE.MeshLambertMaterial({
    color: 0xE3F2FD,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75
  }); // Light blue transparent walls

  const ceilingMaterial = new THREE.MeshLambertMaterial({
    color: 0xE0E0E0,
    side: THREE.DoubleSide
  }); // Light gray ceiling

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x374151,
    linewidth: 2
  }); // Dark gray wireframe edges

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(width, length);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Floor edges
  const floorEdges = new THREE.EdgesGeometry(floorGeometry);
  const floorLine = new THREE.LineSegments(floorEdges, edgeMaterial);
  floorLine.rotation.x = -Math.PI / 2;
  floorLine.position.y = 0;
  roomGroup.add(floorLine);

  // Ceiling
  const ceilingGeometry = new THREE.PlaneGeometry(width, length);
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.receiveShadow = true;
  roomGroup.add(ceiling);

  // Ceiling edges
  const ceilingEdges = new THREE.EdgesGeometry(ceilingGeometry);
  const ceilingLine = new THREE.LineSegments(ceilingEdges, edgeMaterial);
  ceilingLine.rotation.x = Math.PI / 2;
  ceilingLine.position.y = height;
  roomGroup.add(ceilingLine);

  // Walls with wireframe edges
  // Front wall
  const frontWallGeometry = new THREE.PlaneGeometry(width, height);
  const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
  frontWall.position.z = length / 2;
  frontWall.position.y = height / 2;
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  roomGroup.add(frontWall);

  const frontWallEdges = new THREE.EdgesGeometry(frontWallGeometry);
  const frontWallLine = new THREE.LineSegments(frontWallEdges, edgeMaterial);
  frontWallLine.position.z = length / 2;
  frontWallLine.position.y = height / 2;
  roomGroup.add(frontWallLine);

  // Back wall
  const backWallGeometry = new THREE.PlaneGeometry(width, height);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.z = -length / 2;
  backWall.position.y = height / 2;
  backWall.rotation.y = Math.PI;
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  roomGroup.add(backWall);

  const backWallEdges = new THREE.EdgesGeometry(backWallGeometry);
  const backWallLine = new THREE.LineSegments(backWallEdges, edgeMaterial);
  backWallLine.position.z = -length / 2;
  backWallLine.position.y = height / 2;
  backWallLine.rotation.y = Math.PI;
  roomGroup.add(backWallLine);

  // Left wall
  const leftWallGeometry = new THREE.PlaneGeometry(length, height);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.position.x = -width / 2;
  leftWall.position.y = height / 2;
  leftWall.rotation.y = Math.PI / 2;
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  roomGroup.add(leftWall);

  const leftWallEdges = new THREE.EdgesGeometry(leftWallGeometry);
  const leftWallLine = new THREE.LineSegments(leftWallEdges, edgeMaterial);
  leftWallLine.position.x = -width / 2;
  leftWallLine.position.y = height / 2;
  leftWallLine.rotation.y = Math.PI / 2;
  roomGroup.add(leftWallLine);

  // Right wall
  const rightWallGeometry = new THREE.PlaneGeometry(length, height);
  const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
  rightWall.position.x = width / 2;
  rightWall.position.y = height / 2;
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  roomGroup.add(rightWall);

  const rightWallEdges = new THREE.EdgesGeometry(rightWallGeometry);
  const rightWallLine = new THREE.LineSegments(rightWallEdges, edgeMaterial);
  rightWallLine.position.x = width / 2;
  rightWallLine.position.y = height / 2;
  rightWallLine.rotation.y = -Math.PI / 2;
  roomGroup.add(rightWallLine);

  // Adjust orbit controls radius to fit room
  const maxDim = Math.max(width, length, height);
  roomOrbitState.spherical.radius = maxDim * 1.8;
  roomOrbitState.spherical.theta = Math.PI / 4;
  roomOrbitState.spherical.phi = Math.PI / 3;
  roomCamera.lookAt(0, height / 2, 0);

  // Trigger camera update
  const r = roomOrbitState.spherical.radius;
  const theta = roomOrbitState.spherical.theta;
  const phi = roomOrbitState.spherical.phi;
  roomCamera.position.x = r * Math.sin(phi) * Math.cos(theta);
  roomCamera.position.y = r * Math.cos(phi);
  roomCamera.position.z = r * Math.sin(phi) * Math.sin(theta);

  // Update dimension labels
  const dimensionLabels = document.getElementById('dimension-labels');
  if (dimensionLabels) {
    dimensionLabels.innerHTML = `Height: ${dimensions.height.toFixed(1)} ${unit}<br>Width: ${dimensions.width.toFixed(1)} ${unit}<br>Length: ${dimensions.length.toFixed(1)} ${unit}`;
  }
}

// ============================================================
// MATERIAL PREVIEW SCENE (Legacy Calculator 3D Preview)
// ============================================================
let previewScene, previewCamera, previewRenderer;
const materialMeshes = [];
let previewContainerInitialized = false;

function init3DScene() {
  const container = document.getElementById('3d-container');
  if (!container) return;

  if (container.offsetParent === null) {
    const observer = new MutationObserver(() => {
      if (container.offsetParent !== null) {
        observer.disconnect();
        startPreviewScene();
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ['style'] });
    return;
  }

  startPreviewScene();
}

function startPreviewScene() {
  if (previewContainerInitialized) return;
  previewContainerInitialized = true;

  previewScene = new THREE.Scene();
  previewScene.background = new THREE.Color(0xf0f4f8);

  const container = document.getElementById('3d-container');
  const aspect = container.clientWidth / container.clientHeight;
  previewCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  previewCamera.position.set(8, 6, 8);
  previewCamera.lookAt(0, 0, 0);

  previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  previewRenderer.setSize(container.clientWidth, container.clientHeight);
  previewRenderer.shadowMap.enabled = true;
  container.appendChild(previewRenderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  previewScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  previewScene.add(directionalLight);

  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  previewScene.add(floor);

  const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
  previewScene.add(gridHelper);

  setupPreviewOrbitControls();
  animatePreview();
}

function setupPreviewOrbitControls() {
  const container = document.getElementById('3d-container');
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let spherical = { radius: 12, theta: Math.PI / 4, phi: Math.PI / 3 };

  function updateCamera() {
    previewCamera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    previewCamera.position.y = spherical.radius * Math.cos(spherical.phi);
    previewCamera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    previewCamera.lookAt(0, 0, 0);
  }
  updateCamera();

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    spherical.theta -= deltaMove.x * 0.01;
    spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi + deltaMove.y * 0.01));
    updateCamera();
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mouseup', () => { isDragging = false; });
  container.addEventListener('mouseleave', () => { isDragging = false; });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    spherical.radius = Math.max(5, Math.min(30, spherical.radius + e.deltaY * 0.01));
    updateCamera();
  });

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaMove = {
      x: e.touches[0].clientX - previousMousePosition.x,
      y: e.touches[0].clientY - previousMousePosition.y
    };
    spherical.theta -= deltaMove.x * 0.01;
    spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi + deltaMove.y * 0.01));
    updateCamera();
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  container.addEventListener('touchend', () => { isDragging = false; });
}

function animatePreview() {
  requestAnimationFrame(animatePreview);
  if (previewRenderer && previewScene && previewCamera) {
    previewRenderer.render(previewScene, previewCamera);
  }
}

function clearMaterials() {
  materialMeshes.forEach(mesh => previewScene && previewScene.remove(mesh));
  materialMeshes.length = 0;
}

function addBricks(count) {
  const brickGeometry = new THREE.BoxGeometry(0.9, 0.4, 0.4);
  const brickMaterial = new THREE.MeshLambertMaterial({ color: 0xb35a3a });
  const bricksPerRow = Math.ceil(Math.sqrt(count));
  let countPlaced = 0;

  for (let row = 0; row < Math.ceil(count / bricksPerRow); row++) {
    const bricksInThisRow = Math.min(bricksPerRow, count - countPlaced);
    const offset = row % 2 === 0 ? 0 : 0.45;

    for (let col = 0; col < bricksInThisRow && countPlaced < count; col++) {
      const brick = new THREE.Mesh(brickGeometry, brickMaterial);
      brick.position.set(col * 1 - (bricksInThisRow * 0.5) + offset + 0.5, 0.2 + row * 0.4, 0);
      brick.castShadow = true;
      brick.receiveShadow = true;
      previewScene.add(brick);
      materialMeshes.push(brick);
      countPlaced++;
      if (countPlaced >= count) break;
    }
  }
}

function addCementBags(count) {
  const bagGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.3);
  const bagMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const perRow = Math.ceil(Math.sqrt(count));
  let countPlaced = 0;

  for (let row = 0; row < Math.ceil(count / perRow); row++) {
    const inThisRow = Math.min(perRow, count - countPlaced);
    for (let col = 0; col < inThisRow && countPlaced < count; col++) {
      const bag = new THREE.Mesh(bagGeometry, bagMaterial);
      bag.position.set(col * 0.7 - (inThisRow * 0.35), 0.2 + row * 0.45, 0);
      bag.castShadow = true;
      previewScene.add(bag);
      materialMeshes.push(bag);
      countPlaced++;
    }
  }
}

function addSandPile(volume) {
  const pileGeometry = new THREE.ConeGeometry(Math.sqrt(volume) * 0.8, Math.sqrt(volume) * 0.5, 8);
  const sandMaterial = new THREE.MeshLambertMaterial({ color: 0xe6d5a8 });
  const pile = new THREE.Mesh(pileGeometry, sandMaterial);
  pile.position.set(0, Math.sqrt(volume) * 0.25, 2);
  pile.castShadow = true;
  previewScene.add(pile);
  materialMeshes.push(pile);
}

function addConcreteBlock(volume) {
  const blockGeometry = new THREE.BoxGeometry(Math.cbrt(volume) * 1.5, Math.cbrt(volume), Math.cbrt(volume) * 1.5);
  const concreteMaterial = new THREE.MeshLambertMaterial({ color: 0x707070 });
  const block = new THREE.Mesh(blockGeometry, concreteMaterial);
  block.position.set(0, Math.cbrt(volume) * 0.5, 2);
  block.castShadow = true;
  block.receiveShadow = true;
  previewScene.add(block);
  materialMeshes.push(block);
}

function addPaintCans(count) {
  const canGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 16);
  const canMaterial = new THREE.MeshLambertMaterial({ color: 0x3a86ff });
  const perRow = Math.ceil(Math.sqrt(count));
  let countPlaced = 0;

  for (let row = 0; row < Math.ceil(count / perRow); row++) {
    const inThisRow = Math.min(perRow, count - countPlaced);
    for (let col = 0; col < inThisRow && countPlaced < count; col++) {
      const can = new THREE.Mesh(canGeometry, canMaterial);
      can.position.set(col * 0.5 - (inThisRow * 0.25), 0.175 + row * 0.4, 2);
      can.castShadow = true;
      previewScene.add(can);
      materialMeshes.push(can);
      countPlaced++;
    }
  }
}

function renderResults(result) {
  clearMaterials();

  if (!result || result.error) return;

  if (result.bricks) {
    const brickCount = parseInt(result.bricks);
    addBricks(Math.min(brickCount, 200));
  }

  if (result.cement) {
    const bagCount = parseInt(result.cement);
    addCementBags(Math.min(bagCount, 50));
  }

  if (result.sand) {
    const sandVolume = parseFloat(result.sand);
    if (sandVolume > 0) addSandPile(Math.min(sandVolume, 20));
  }

  if (result.concrete) {
    const concreteVolume = parseFloat(result.concrete);
    if (concreteVolume > 0) addConcreteBlock(Math.min(concreteVolume, 10));
  }

  if (result.paint) {
    const paintLiters = parseFloat(result.paint);
    const canCount = Math.ceil(paintLiters / 5);
    addPaintCans(Math.min(canCount, 30));
  }

  if (previewRenderer && previewCamera) {
    const container = document.getElementById('3d-container');
    if (container) {
      previewCamera.aspect = container.clientWidth / container.clientHeight;
      previewCamera.updateProjectionMatrix();
      previewRenderer.setSize(container.clientWidth, container.clientHeight);
    }
  }
}

function update3DPreview() {
  const area = parseFloat(document.getElementById('area')?.value) || 0;
  const materialType = document.getElementById('materialType')?.value || '';
  const thickness = parseFloat(document.getElementById('thickness')?.value) || 4;

  if (!materialType || area <= 0) {
    clearMaterials();
    return;
  }

  let previewResult = {};
  const areaNum = area;

  if (materialType === 'cement') {
    previewResult.cement = (areaNum * 0.4).toFixed(2) + ' bags';
    previewResult.sand = (areaNum * 0.5).toFixed(2) + ' cubic ft';
  } else if (materialType === 'bricks') {
    previewResult.bricks = (areaNum * 6.25).toFixed(0) + ' bricks';
  } else if (materialType === 'concrete') {
    previewResult.concrete = (areaNum * 0.125 * thickness / 12).toFixed(2) + ' cubic ft';
    previewResult.cement = Math.ceil(areaNum * 0.15).toFixed(0) + ' bags';
    previewResult.sand = (areaNum * 0.25).toFixed(2) + ' cubic ft';
    previewResult.aggregate = (areaNum * 0.25).toFixed(2) + ' cubic ft';
  } else if (materialType === 'painting') {
    previewResult.paint = (areaNum * 0.015).toFixed(2) + ' liters';
  }

  renderResults(previewResult);
}

window.addEventListener('resize', () => {
  const container = document.getElementById('3d-container');
  if (container && previewRenderer && container.offsetParent !== null) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    previewCamera.aspect = width / height;
    previewCamera.updateProjectionMatrix();
    previewRenderer.setSize(width, height);
  }
});
