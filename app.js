const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || '/Calculate';

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Enable CORS for iframe integration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://ultimotradingltd.co.ke',
  credentials: true
}));

// Inject basePath for templates
app.use((req, res, next) => {
  res.locals.basePath = BASE_PATH;
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Serve static assets at BASE_PATH (e.g., /Calculate/style.css)
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));

// Create router for calculator routes
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve calculator page
router.get('/', (req, res) => {
  res.render('index', { result: null, query: req.query });
});

router.get('/calculate', (req, res) => {
  res.render('index', { result: null, query: req.query });
});

// Handle form submission
router.post('/calculate', (req, res) => {
  const { area, materialType, thickness, tileSize, roomWidth, roomHeight, roomLength } = req.body;
  let result = {};
  const areaNum = parseFloat(area);

  if (isNaN(areaNum) || areaNum <= 0) {
    result = { error: 'Please enter a valid area (greater than 0)' };
    return res.render('index', { result });
  }

  const thicknessNum = parseFloat(thickness) || 4;
  const tileSizeNum = parseFloat(tileSize) || 12;

  // Parse room dimensions
  const roomWidthNum = parseFloat(roomWidth) || 0;
  const roomHeightNum = parseFloat(roomHeight) || 0;
  const roomLengthNum = parseFloat(roomLength) || 0;

  try {
    switch (materialType) {
      case 'cement':
        result.cement = (areaNum * 0.4).toFixed(2) + ' bags (50kg)';
        result.sand = (areaNum * 0.5).toFixed(2) + ' cubic ft';
        result.materialType = 'Cement & Sand (Plastering)';
        break;
      case 'bricks':
        result.bricks = (areaNum * 6.25).toFixed(0) + ' bricks';
        result.cement = Math.ceil(areaNum * 0.02) + ' bags';
        result.sand = (areaNum * 0.15).toFixed(2) + ' cubic ft';
        result.materialType = 'Bricks (9x4.5 inch)';
        break;
      case 'concrete':
        const thicknessInFeet = thicknessNum / 12;
        const concreteVolume = areaNum * thicknessInFeet;
        result.concrete = concreteVolume.toFixed(2) + ' cubic ft (' + (concreteVolume * 0.037).toFixed(2) + ' m³)';
        result.cement = Math.ceil(concreteVolume * 6) + ' bags (50kg)';
        result.sand = (concreteVolume * 0.5).toFixed(2) + ' cubic ft';
        result.aggregate = (concreteVolume * 1).toFixed(2) + ' cubic ft';
        result.materialType = 'Concrete Slab (1:2:4 Mix)';
        break;
      case 'painting':
        result.paint = (areaNum * 0.015).toFixed(2) + ' liters (2 coats)';
        result.primer = (areaNum * 0.01).toFixed(2) + ' liters';
        result.materialType = 'Paint (Interior)';
        break;
      case 'tiles':
        if (!tileSizeNum || tileSizeNum <= 0) {
          result = { error: 'Please select a tile size' };
          return res.render('index', { result });
        }
        const tileSizeInSqFt = (tileSizeNum * tileSizeNum) / 144;
        const tilesNeeded = Math.ceil(areaNum / tileSizeInSqFt * 1.1);
        const tileArea = (tilesNeeded * tileSizeNum * tileSizeNum) / 144;
        result.tiles = tilesNeeded.toFixed(0) + ' tiles (' + tileSizeNum + '")';
        result.tileArea = tileArea.toFixed(2) + ' sq ft (with wastage)';
        result.adhesive = (tilesNeeded * 0.02).toFixed(2) + ' liters';
        result.grout = (tilesNeeded * 0.1).toFixed(2) + ' kg';
        result.materialType = 'Floor/Wall Tiles';
        break;
      case 'steel':
        if (thicknessNum <= 0) {
          result = { error: 'Thickness is required for steel calculation' };
          return res.render('index', { result });
        }
        const steelKgPerSqFt = 0.5 * (thicknessNum / 4);
        result.steel = (areaNum * steelKgPerSqFt).toFixed(2) + ' kg';
        result.wireMesh = (areaNum * 1.2).toFixed(2) + ' sq ft';
        result.materialType = 'Reinforcement Steel';
        break;
      case 'blocks':
        const blockArea = 0.89;
        const blocksNeeded = Math.ceil(areaNum / blockArea * 1.05);
        result.blocks = blocksNeeded.toFixed(0) + ' concrete blocks (8x8x16")';
        result.cement = Math.ceil(blocksNeeded * 0.015) + ' bags';
        result.sand = (blocksNeeded * 0.07).toFixed(2) + ' cubic ft';
        result.materialType = 'Concrete Blocks';
        break;
      case 'gravel':
        const gravelThicknessFt = thicknessNum / 12;
        const gravelVolume = areaNum * gravelThicknessFt;
        result.gravel = gravelVolume.toFixed(2) + ' cubic ft (' + (gravelVolume * 0.037).toFixed(2) + ' m³)';
        result.geotextile = Math.ceil(areaNum) + ' sq ft';
        result.materialType = 'Crushed Stone/Gravel';
        break;
      case 'roofing':
        const sheetsNeeded = Math.ceil(areaNum / 30 * 1.1);
        result.roofingSheets = sheetsNeeded.toFixed(0) + ' metal sheets';
        result.screws = (sheetsNeeded * 8).toFixed(0) + ' roofing screws';
        result.flashing = Math.ceil(areaNum / 50).toFixed(0) + ' linear ft';
        result.materialType = 'Metal Roofing';
        break;
      default:
        result = { error: 'Invalid material type selected' };
    }

    // Attach room dimensions to result
    result.roomWidth = roomWidthNum;
    result.roomHeight = roomHeightNum;
    result.roomLength = roomLengthNum;

    res.render('index', { result, query: req.query });
  } catch (err) {
    console.error('Calculation error:', err);
    res.render('index', { result: { error: 'An error occurred.' } });
  }
});

// API endpoint for room visualizer
router.post('/api/calculate-room', (req, res) => {
  const { height, width, length, unit } = req.body;

  const heightNum = parseFloat(height);
  const widthNum = parseFloat(width);
  const lengthNum = parseFloat(length);
  const unitType = unit === 'm' ? 'm' : 'ft';

  const errors = [];
  if (isNaN(heightNum) || heightNum <= 0) {
    errors.push('Height must be a positive number greater than 0.');
  }
  if (isNaN(widthNum) || widthNum <= 0) {
    errors.push('Width must be a positive number greater than 0.');
  }
  if (isNaN(lengthNum) || lengthNum <= 0) {
    errors.push('Length must be a positive number greater than 0.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  // Convert to meters for consistent 3D scaling (1 unit = 1 meter)
  const conversionFactor = unitType === 'ft' ? 0.3048 : 1;
  const heightM = heightNum * conversionFactor;
  const widthM = widthNum * conversionFactor;
  const lengthM = lengthNum * conversionFactor;

  // Calculate material quantities (in original units for display)
  const floorArea = widthNum * lengthNum;
  const wallArea1 = widthNum * heightNum * 2;
  const wallArea2 = lengthNum * heightNum * 2;
  const totalWallArea = wallArea1 + wallArea2;
  const ceilingArea = floorArea;

  const paintLiters = totalWallArea * 0.015;
  const tileSqFt = unitType === 'ft' ? floorArea : floorArea * 10.764;

  res.json({
    dimensions: {
      height: heightNum,
      width: widthNum,
      length: lengthNum,
      heightM: parseFloat(heightM.toFixed(3)),
      widthM: parseFloat(widthM.toFixed(3)),
      lengthM: parseFloat(lengthM.toFixed(3))
    },
    unit: unitType,
    materials: {
      floorArea: floorArea.toFixed(2) + ' sq ' + unitType,
      totalWallArea: totalWallArea.toFixed(2) + ' sq ' + unitType,
      ceilingArea: ceilingArea.toFixed(2) + ' sq ' + unitType,
      paintNeeded: paintLiters.toFixed(2) + ' liters (2 coats)',
      tileArea: tileSqFt.toFixed(2) + ' sq ' + (unitType === 'ft' ? 'ft' : 'm')
    }
  });
});

// Mount router at BASE_PATH
app.use(BASE_PATH, router);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('index', {
    result: { error: 'Internal server error.' },
    query: req.query
  });
});

// Start server only when run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Sokogate Calculator running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use!\n`);
      console.error('Solutions:');
      console.error('   1. Use a different port: PORT=3001 npm start');
      console.error('   2. Kill the process using port 3000:');
      console.error('      lsof -ti:3000 | xargs kill -9');
      console.error('   3. For cPanel: Restart the app in "Setup Node.js App" panel');
      console.error('\n');
      process.exit(1);
    } else {
      console.error('Server error:', err.message);
      process.exit(1);
    }
  });

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  });
}

module.exports = app;
