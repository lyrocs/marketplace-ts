import { PrismaClient, UserRole, DealStatus, DealCondition } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data (order matters for FK constraints)
  await prisma.discussionStatus.deleteMany()
  await prisma.discussion.deleteMany()
  await prisma.dealProduct.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.productComponent.deleteMany()
  await prisma.productSpec.deleteMany()
  await prisma.shop.deleteMany()
  await prisma.product.deleteMany()
  await prisma.spec.deleteMany()
  await prisma.categorySpecType.deleteMany()
  await prisma.specType.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()
  await prisma.rememberMeToken.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.user.deleteMany()

  // =========================================================================
  // USERS
  // =========================================================================
  console.log('  Creating users...')

  const adminUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Admin',
      email: 'admin@marketplace.dev',
      password: '$2b$12$.urSCRlrwOSM7vLOC3geGejxVLGljUrMOQsRubOY1CF8sY2ZP4x36', // "password"
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  const alice = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Alice FPV',
      email: 'alice@marketplace.dev',
      password: '$2b$12$.urSCRlrwOSM7vLOC3geGejxVLGljUrMOQsRubOY1CF8sY2ZP4x36',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const bob = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Bob Freestyle',
      email: 'bob@marketplace.dev',
      password: '$2b$12$.urSCRlrwOSM7vLOC3geGejxVLGljUrMOQsRubOY1CF8sY2ZP4x36',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const charlie = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Charlie Racer',
      email: 'charlie@marketplace.dev',
      password: '$2b$12$.urSCRlrwOSM7vLOC3geGejxVLGljUrMOQsRubOY1CF8sY2ZP4x36',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const diana = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Diana CineWhoop',
      email: 'diana@marketplace.dev',
      password: '$2b$12$.urSCRlrwOSM7vLOC3geGejxVLGljUrMOQsRubOY1CF8sY2ZP4x36',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  // =========================================================================
  // CATEGORIES (FPV Drone hierarchy)
  // =========================================================================
  console.log('  Creating categories...')

  const frames = await prisma.category.create({
    data: { name: 'Frames', key: 'frames', description: 'FPV drone frames — 5", 3", toothpick, cinewhoop, and more' },
  })
  const frames5inch = await prisma.category.create({
    data: { name: '5" Frames', key: 'frames-5inch', description: '5-inch freestyle and racing frames', parentId: frames.id },
  })
  const frames3inch = await prisma.category.create({
    data: { name: '3" Frames', key: 'frames-3inch', description: '3-inch micro frames', parentId: frames.id },
  })

  const motors = await prisma.category.create({
    data: { name: 'Motors', key: 'motors', description: 'Brushless motors for FPV drones' },
  })
  const motors2306 = await prisma.category.create({
    data: { name: '2306 Motors', key: 'motors-2306', description: '2306 size motors for 5" builds', parentId: motors.id },
  })
  const motors1404 = await prisma.category.create({
    data: { name: '1404 Motors', key: 'motors-1404', description: '1404 size motors for 3" builds', parentId: motors.id },
  })

  const escs = await prisma.category.create({
    data: { name: 'ESCs', key: 'escs', description: 'Electronic Speed Controllers — 4-in-1 and individual' },
  })
  const escs4in1 = await prisma.category.create({
    data: { name: '4-in-1 ESCs', key: 'escs-4in1', description: 'All-in-one ESC stacks', parentId: escs.id },
  })

  const fcs = await prisma.category.create({
    data: { name: 'Flight Controllers', key: 'flight-controllers', description: 'F4/F7/H7 flight controllers' },
  })
  const fcsH7 = await prisma.category.create({
    data: { name: 'H7 FCs', key: 'fcs-h7', description: 'H7 processor flight controllers', parentId: fcs.id },
  })

  const vtx = await prisma.category.create({
    data: { name: 'Video TX (VTX)', key: 'vtx', description: 'Video transmitters — analog, DJI, HDZero, Walksnail' },
  })
  const vtxDigital = await prisma.category.create({
    data: { name: 'Digital VTX', key: 'vtx-digital', description: 'Digital video transmitters', parentId: vtx.id },
  })

  const cameras = await prisma.category.create({
    data: { name: 'Cameras', key: 'cameras', description: 'FPV cameras and action cameras' },
  })
  const camerasFPV = await prisma.category.create({
    data: { name: 'FPV Cameras', key: 'cameras-fpv', description: 'Onboard FPV cameras', parentId: cameras.id },
  })

  const goggles = await prisma.category.create({
    data: { name: 'Goggles', key: 'goggles', description: 'FPV goggles — analog and digital' },
  })

  const radios = await prisma.category.create({
    data: { name: 'Radios', key: 'radios', description: 'Radio transmitters and receivers' },
  })
  const radiosTX = await prisma.category.create({
    data: { name: 'Transmitters', key: 'radios-tx', description: 'Radio transmitters', parentId: radios.id },
  })

  const batteries = await prisma.category.create({
    data: { name: 'Batteries', key: 'batteries', description: 'LiPo and Li-Ion batteries for FPV' },
  })
  const batteries6S = await prisma.category.create({
    data: { name: '6S LiPo', key: 'batteries-6s', description: '6S LiPo packs', parentId: batteries.id },
  })

  const props = await prisma.category.create({
    data: { name: 'Props', key: 'props', description: 'Propellers for FPV drones' },
  })

  // =========================================================================
  // BRANDS (FPV)
  // =========================================================================
  console.log('  Creating brands...')

  const [
    tbs, iflight, betafpv, geprc, diatone,
    foxeer, caddx, runcam, dji, fatshark,
    radiomaster, walksnail, emax, tmotor, ethix,
    gopro, hdzero, hqprop, gemfan, cnhl,
  ] = await Promise.all(
    [
      'TBS', 'iFlight', 'BetaFPV', 'GEPRC', 'Diatone',
      'Foxeer', 'Caddx', 'RunCam', 'DJI', 'Fatshark',
      'RadioMaster', 'Walksnail', 'EMAX', 'T-Motor', 'Ethix',
      'GoPro', 'HDZero', 'HQProp', 'Gemfan', 'CNHL',
    ].map((name) => prisma.brand.create({ data: { name } })),
  )

  // =========================================================================
  // SPEC TYPES & SPECS
  // =========================================================================
  console.log('  Creating spec types and specs...')

  const specKV = await prisma.specType.create({ data: { key: 'kv_rating', label: 'KV Rating' } })
  const specMotorSize = await prisma.specType.create({ data: { key: 'motor_size', label: 'Motor Size' } })
  const specFrameSize = await prisma.specType.create({ data: { key: 'frame_size', label: 'Frame Size' } })
  const specWeight = await prisma.specType.create({ data: { key: 'weight', label: 'Weight' } })
  const specProtocol = await prisma.specType.create({ data: { key: 'protocol', label: 'Protocol' } })
  const specCells = await prisma.specType.create({ data: { key: 'battery_cells', label: 'Battery Cells' } })
  const specCapacity = await prisma.specType.create({ data: { key: 'capacity', label: 'Capacity' } })
  const specResolution = await prisma.specType.create({ data: { key: 'resolution', label: 'Resolution' } })
  const specFOV = await prisma.specType.create({ data: { key: 'fov', label: 'FOV' } })

  // Link spec types to categories
  await prisma.categorySpecType.createMany({
    data: [
      { categoryId: motors.id, specTypeId: specKV.id },
      { categoryId: motors.id, specTypeId: specMotorSize.id },
      { categoryId: motors.id, specTypeId: specWeight.id },
      { categoryId: motors2306.id, specTypeId: specKV.id },
      { categoryId: motors2306.id, specTypeId: specMotorSize.id },
      { categoryId: motors1404.id, specTypeId: specKV.id },
      { categoryId: motors1404.id, specTypeId: specMotorSize.id },
      { categoryId: frames.id, specTypeId: specFrameSize.id },
      { categoryId: frames.id, specTypeId: specWeight.id },
      { categoryId: frames5inch.id, specTypeId: specFrameSize.id },
      { categoryId: frames5inch.id, specTypeId: specWeight.id },
      { categoryId: frames3inch.id, specTypeId: specFrameSize.id },
      { categoryId: escs.id, specTypeId: specProtocol.id },
      { categoryId: escs4in1.id, specTypeId: specProtocol.id },
      { categoryId: fcs.id, specTypeId: specProtocol.id },
      { categoryId: vtx.id, specTypeId: specProtocol.id },
      { categoryId: vtxDigital.id, specTypeId: specProtocol.id },
      { categoryId: goggles.id, specTypeId: specResolution.id },
      { categoryId: goggles.id, specTypeId: specFOV.id },
      { categoryId: radios.id, specTypeId: specProtocol.id },
      { categoryId: radiosTX.id, specTypeId: specProtocol.id },
      { categoryId: batteries.id, specTypeId: specCells.id },
      { categoryId: batteries.id, specTypeId: specCapacity.id },
      { categoryId: batteries6S.id, specTypeId: specCells.id },
      { categoryId: batteries6S.id, specTypeId: specCapacity.id },
      { categoryId: cameras.id, specTypeId: specResolution.id },
      { categoryId: cameras.id, specTypeId: specFOV.id },
      { categoryId: camerasFPV.id, specTypeId: specResolution.id },
      { categoryId: camerasFPV.id, specTypeId: specFOV.id },
    ],
  })

  // Create spec values
  const specs = await Promise.all([
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '1750KV' } }),        // 0
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '1950KV' } }),        // 1
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '2450KV' } }),        // 2
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '3600KV' } }),        // 3
    prisma.spec.create({ data: { specTypeId: specMotorSize.id, value: '2306' } }),   // 4
    prisma.spec.create({ data: { specTypeId: specMotorSize.id, value: '2207' } }),   // 5
    prisma.spec.create({ data: { specTypeId: specMotorSize.id, value: '1404' } }),   // 6
    prisma.spec.create({ data: { specTypeId: specFrameSize.id, value: '5"' } }),     // 7
    prisma.spec.create({ data: { specTypeId: specFrameSize.id, value: '3"' } }),     // 8
    prisma.spec.create({ data: { specTypeId: specFrameSize.id, value: '7"' } }),     // 9
    prisma.spec.create({ data: { specTypeId: specWeight.id, value: '30g' } }),       // 10
    prisma.spec.create({ data: { specTypeId: specWeight.id, value: '33g' } }),       // 11
    prisma.spec.create({ data: { specTypeId: specWeight.id, value: '105g' } }),      // 12
    prisma.spec.create({ data: { specTypeId: specWeight.id, value: '120g' } }),      // 13
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'ELRS' } }),    // 14
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'Crossfire' } }),// 15
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'DJI O3' } }),  // 16
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'HDZero' } }),  // 17
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'Walksnail' } }),// 18
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'BLHeli_32' } }),// 19
    prisma.spec.create({ data: { specTypeId: specCells.id, value: '4S' } }),         // 20
    prisma.spec.create({ data: { specTypeId: specCells.id, value: '6S' } }),         // 21
    prisma.spec.create({ data: { specTypeId: specCapacity.id, value: '1100mAh' } }), // 22
    prisma.spec.create({ data: { specTypeId: specCapacity.id, value: '1300mAh' } }), // 23
    prisma.spec.create({ data: { specTypeId: specCapacity.id, value: '1550mAh' } }), // 24
    prisma.spec.create({ data: { specTypeId: specResolution.id, value: '1080p' } }), // 25
    prisma.spec.create({ data: { specTypeId: specResolution.id, value: '720p 100fps' } }),// 26
    prisma.spec.create({ data: { specTypeId: specResolution.id, value: '540p' } }),  // 27
    prisma.spec.create({ data: { specTypeId: specFOV.id, value: '155°' } }),         // 28
    prisma.spec.create({ data: { specTypeId: specFOV.id, value: '170°' } }),         // 29
    prisma.spec.create({ data: { specTypeId: specFOV.id, value: '50°' } }),          // 30
  ])

  // =========================================================================
  // PRODUCTS (FPV Drone Gear)
  // =========================================================================
  console.log('  Creating products...')

  // --- Frames ---
  const chimera5 = await prisma.product.create({
    data: {
      name: 'iFlight Chimera5 Pro Frame',
      categoryId: frames5inch.id,
      brandId: iflight.id,
      status: 'active',
      description: 'Premium 5-inch freestyle frame with carbon fiber construction. Dead cat geometry for propeller-free camera view.',
      features: ['6mm arm thickness', 'Dead cat geometry', 'GoPro mount included', 'Fits 20x20 & 30.5x30.5 stacks'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=Chimera5+Frame', 'https://placehold.co/800x600/0f1117/00e5ff?text=Chimera5+Top'],
    },
  })

  const mark5 = await prisma.product.create({
    data: {
      name: 'GEPRC Mark5 HD Frame Kit',
      categoryId: frames5inch.id,
      brandId: geprc.id,
      status: 'active',
      description: 'True-X 5" frame designed for DJI O3 Air Unit. 5mm arms with reinforced motor mounts.',
      features: ['True-X geometry', 'DJI O3 ready', '5mm arms', 'TPU camera mount included'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Mark5+Frame', 'https://placehold.co/800x600/0f1117/a855f7?text=Mark5+Arms'],
    },
  })

  // --- Motors ---
  const xing2306 = await prisma.product.create({
    data: {
      name: 'iFlight XING2 2306 1750KV',
      categoryId: motors2306.id,
      brandId: iflight.id,
      status: 'active',
      description: 'High-performance 2306 motor for 6S 5-inch builds. Titanium alloy shaft with Japanese bearings.',
      features: ['Titanium shaft', 'N52H magnets', 'Japanese NSK bearings', '7075 aluminium bell'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=XING2+2306', 'https://placehold.co/800x600/0f1117/00e5ff?text=XING2+Close'],
    },
  })

  const ethixStout = await prisma.product.create({
    data: {
      name: 'Ethix Stout V4 2306 1750KV',
      categoryId: motors2306.id,
      brandId: ethix.id,
      status: 'active',
      description: 'Mr Steele signature motor. Optimized for smooth freestyle with incredible low-end torque.',
      features: ['Unibell design', 'Single strand windings', 'Prop washer included', '33g weight'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Ethix+Stout', 'https://placehold.co/800x600/0f1117/a855f7?text=Stout+V4'],
    },
  })

  const emax1404 = await prisma.product.create({
    data: {
      name: 'EMAX RS1404 3600KV',
      categoryId: motors1404.id,
      brandId: emax.id,
      status: 'active',
      description: 'Lightweight 1404 motor for 3-inch micro quads. Bell designed for minimal drag.',
      features: ['Open bottom bell', '9.5g weight', 'CW thread shaft', 'Fits 3" props'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=EMAX+1404'],
    },
  })

  // --- ESCs ---
  const speedyBee = await prisma.product.create({
    data: {
      name: 'SpeedyBee F405 V4 55A 4-in-1 Stack',
      categoryId: escs4in1.id,
      status: 'active',
      description: 'F405 flight controller + 55A BLHeli_32 4-in-1 ESC stack. Bluetooth configuration via app.',
      features: ['F405 processor', '55A continuous', 'BLHeli_32', 'Bluetooth config', 'Barometer onboard'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=SpeedyBee+Stack', 'https://placehold.co/800x600/0f1117/a855f7?text=SpeedyBee+Side'],
    },
  })

  // --- Flight Controllers ---
  const diatoneH7 = await prisma.product.create({
    data: {
      name: 'Diatone Mamba H743 MK4',
      categoryId: fcsH7.id,
      brandId: diatone.id,
      status: 'active',
      description: 'H7 flight controller with dual gyro. 9 UARTs, 128MB flash for blackbox.',
      features: ['STM32H743', 'Dual ICM42688P gyro', '9 UARTs', '128MB blackbox flash', '30.5x30.5 mount'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=Mamba+H743'],
    },
  })

  // --- VTX ---
  const djiO3 = await prisma.product.create({
    data: {
      name: 'DJI O3 Air Unit',
      categoryId: vtxDigital.id,
      brandId: dji.id,
      status: 'active',
      description: 'DJI digital FPV system with 1080p recording and ultra-low latency transmission.',
      features: ['1080p/100fps recording', '10km range', '< 28ms latency', 'Built-in camera', 'OSD via Betaflight'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=DJI+O3', 'https://placehold.co/800x600/0f1117/00e5ff?text=O3+Camera'],
    },
  })

  const walksnailAvatar = await prisma.product.create({
    data: {
      name: 'Walksnail Avatar HD V2',
      categoryId: vtxDigital.id,
      brandId: walksnail.id,
      status: 'active',
      description: 'Walksnail digital VTX with gyroflow support and 1080p recording.',
      features: ['1080p recording', 'Gyroflow stabilization', '1200mW output', 'Built-in camera', '< 22ms latency'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Walksnail+V2'],
    },
  })

  const hdzeroVTX = await prisma.product.create({
    data: {
      name: 'HDZero Freestyle V2 VTX',
      categoryId: vtxDigital.id,
      brandId: hdzero.id,
      status: 'active',
      description: 'Ultra-low-latency digital VTX. 720p/100fps with < 4ms glass-to-glass latency.',
      features: ['720p/100fps', '< 4ms latency', '1W output', 'Analog fallback', 'Open source'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=HDZero+V2'],
    },
  })

  // --- Cameras ---
  const foxeerRazer = await prisma.product.create({
    data: {
      name: 'Foxeer Razer Mini',
      categoryId: camerasFPV.id,
      brandId: foxeer.id,
      status: 'active',
      description: 'Compact analog FPV camera with excellent low-light performance. 1200TVL CMOS sensor.',
      features: ['1200TVL', '2.1mm lens', '4:3 / 16:9 switchable', 'Wide voltage 5-40V', 'OSD menu'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Foxeer+Razer'],
    },
  })

  // --- Goggles ---
  const djiGoggles3 = await prisma.product.create({
    data: {
      name: 'DJI Goggles 3',
      categoryId: goggles.id,
      brandId: dji.id,
      status: 'active',
      description: 'Lightweight FPV goggles with micro-OLED screens. Works with DJI O3 and O4 systems.',
      features: ['Micro-OLED 1080p', 'Diopter adjustment -8 to +2', 'Head tracking', '290g weight', 'USB-C charging'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=DJI+Goggles+3', 'https://placehold.co/800x600/0f1117/00e5ff?text=Goggles+3+Side'],
    },
  })

  const fatsharkRecon = await prisma.product.create({
    data: {
      name: 'Fatshark Recon HD',
      categoryId: goggles.id,
      brandId: fatshark.id,
      status: 'active',
      description: 'Entry-level HD goggles compatible with HDZero and Walksnail digital systems.',
      features: ['1280x720 LCD', 'DVR built-in', 'HDMI input', 'Analog + Digital', '3S battery powered'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Fatshark+Recon'],
    },
  })

  // --- Radios ---
  const zorro = await prisma.product.create({
    data: {
      name: 'RadioMaster Zorro ELRS',
      categoryId: radiosTX.id,
      brandId: radiomaster.id,
      status: 'active',
      description: 'Compact gamepad-style radio with built-in ELRS module. Perfect for travel.',
      features: ['ExpressLRS built-in', 'Gamepad form factor', 'Color LCD', 'Nano size', 'EdgeTX firmware'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=Zorro+ELRS', 'https://placehold.co/800x600/0f1117/00e5ff?text=Zorro+Back'],
    },
  })

  const tx16s = await prisma.product.create({
    data: {
      name: 'RadioMaster TX16S MKII ELRS',
      categoryId: radiosTX.id,
      brandId: radiomaster.id,
      status: 'active',
      description: 'Full-size radio transmitter with hall gimbals and ELRS module. The gold standard for FPV.',
      features: ['Hall effect gimbals', 'ELRS 1W module', '4.3" color touchscreen', 'EdgeTX', '6000mAh battery'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=TX16S+MKII'],
    },
  })

  // --- Batteries ---
  const cnhl6S = await prisma.product.create({
    data: {
      name: 'CNHL Black Series 1300mAh 6S 100C',
      categoryId: batteries6S.id,
      brandId: cnhl.id,
      status: 'active',
      description: 'High-discharge 6S LiPo for 5-inch freestyle. Consistent punch throughout the pack.',
      features: ['100C discharge', 'XT60 connector', '210g weight', 'HV compatible'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=CNHL+6S+1300'],
    },
  })

  // --- Props ---
  const hqS5 = await prisma.product.create({
    data: {
      name: 'HQProp Ethix S5 Light Grey',
      categoryId: props.id,
      brandId: hqprop.id,
      status: 'active',
      description: 'Ethix S5 prop designed by Mr Steele. Smooth, responsive, and incredibly durable polycarbonate.',
      features: ['5x4x3 triblade', 'Polycarbonate', 'Balanced out of box', '4 sets (16 props)'],
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=HQ+Ethix+S5'],
    },
  })

  // =========================================================================
  // PRODUCT SPECS
  // =========================================================================
  console.log('  Linking product specs...')

  await prisma.productSpec.createMany({
    data: [
      // Chimera5: 5" frame, 120g
      { productId: chimera5.id, specId: specs[7].id },
      { productId: chimera5.id, specId: specs[13].id },
      // Mark5: 5" frame, 105g
      { productId: mark5.id, specId: specs[7].id },
      { productId: mark5.id, specId: specs[12].id },
      // XING2 2306: 1750KV, 2306, 33g
      { productId: xing2306.id, specId: specs[0].id },
      { productId: xing2306.id, specId: specs[4].id },
      { productId: xing2306.id, specId: specs[11].id },
      // Ethix Stout: 1750KV, 2306, 33g
      { productId: ethixStout.id, specId: specs[0].id },
      { productId: ethixStout.id, specId: specs[4].id },
      { productId: ethixStout.id, specId: specs[11].id },
      // EMAX 1404: 3600KV, 1404
      { productId: emax1404.id, specId: specs[3].id },
      { productId: emax1404.id, specId: specs[6].id },
      // SpeedyBee: BLHeli_32
      { productId: speedyBee.id, specId: specs[19].id },
      // DJI O3: DJI O3 protocol, 1080p, 155° FOV
      { productId: djiO3.id, specId: specs[16].id },
      { productId: djiO3.id, specId: specs[25].id },
      { productId: djiO3.id, specId: specs[28].id },
      // Walksnail: Walksnail protocol, 1080p
      { productId: walksnailAvatar.id, specId: specs[18].id },
      { productId: walksnailAvatar.id, specId: specs[25].id },
      // HDZero: HDZero protocol, 720p 100fps
      { productId: hdzeroVTX.id, specId: specs[17].id },
      { productId: hdzeroVTX.id, specId: specs[26].id },
      // Foxeer Razer: 170° FOV
      { productId: foxeerRazer.id, specId: specs[29].id },
      // DJI Goggles 3: 1080p, 50° FOV
      { productId: djiGoggles3.id, specId: specs[25].id },
      { productId: djiGoggles3.id, specId: specs[30].id },
      // Zorro: ELRS
      { productId: zorro.id, specId: specs[14].id },
      // TX16S: ELRS
      { productId: tx16s.id, specId: specs[14].id },
      // CNHL 6S: 6S, 1300mAh
      { productId: cnhl6S.id, specId: specs[21].id },
      { productId: cnhl6S.id, specId: specs[23].id },
    ],
  })

  // =========================================================================
  // PRODUCT COMPONENTS (stack = FC + ESC)
  // =========================================================================
  console.log('  Creating product components...')

  await prisma.productComponent.createMany({
    data: [
      { parentId: speedyBee.id, componentId: diatoneH7.id },
    ],
  })

  // =========================================================================
  // SHOPS (FPV retailers)
  // =========================================================================
  console.log('  Creating shops...')

  await prisma.shop.createMany({
    data: [
      { productId: chimera5.id, name: 'GetFPV', url: 'https://getfpv.com/chimera5-pro', price: 49.99, currency: 'USD', available: true },
      { productId: chimera5.id, name: 'RaceDayQuads', url: 'https://racedayquads.com/chimera5', price: 47.99, currency: 'USD', available: true },
      { productId: mark5.id, name: 'GetFPV', url: 'https://getfpv.com/mark5-hd', price: 54.99, currency: 'USD', available: true },
      { productId: mark5.id, name: 'Drone-FPV-Racer', url: 'https://drone-fpv-racer.com/mark5', price: 49.90, currency: 'EUR', available: true },
      { productId: xing2306.id, name: 'GetFPV', url: 'https://getfpv.com/xing2-2306', price: 17.99, currency: 'USD', available: true },
      { productId: xing2306.id, name: 'iFlight Store', url: 'https://iflight.com/xing2-2306', price: 15.99, currency: 'USD', available: true },
      { productId: ethixStout.id, name: 'GetFPV', url: 'https://getfpv.com/ethix-stout-v4', price: 22.99, currency: 'USD', available: true },
      { productId: ethixStout.id, name: 'Drone-FPV-Racer', url: 'https://drone-fpv-racer.com/ethix-stout', price: 20.90, currency: 'EUR', available: true },
      { productId: emax1404.id, name: 'RaceDayQuads', url: 'https://racedayquads.com/emax-1404', price: 13.99, currency: 'USD', available: true },
      { productId: speedyBee.id, name: 'GetFPV', url: 'https://getfpv.com/speedybee-f405-v4', price: 69.99, currency: 'USD', available: true },
      { productId: diatoneH7.id, name: 'GetFPV', url: 'https://getfpv.com/mamba-h743', price: 44.99, currency: 'USD', available: true },
      { productId: djiO3.id, name: 'GetFPV', url: 'https://getfpv.com/dji-o3', price: 229.00, currency: 'USD', available: true },
      { productId: djiO3.id, name: 'DJI Store', url: 'https://store.dji.com/o3-air-unit', price: 229.00, currency: 'USD', available: true },
      { productId: walksnailAvatar.id, name: 'GetFPV', url: 'https://getfpv.com/walksnail-avatar-v2', price: 119.99, currency: 'USD', available: true },
      { productId: hdzeroVTX.id, name: 'GetFPV', url: 'https://getfpv.com/hdzero-freestyle-v2', price: 69.99, currency: 'USD', available: true },
      { productId: hdzeroVTX.id, name: 'RaceDayQuads', url: 'https://racedayquads.com/hdzero-v2', price: 69.99, currency: 'USD', available: true },
      { productId: foxeerRazer.id, name: 'RaceDayQuads', url: 'https://racedayquads.com/foxeer-razer', price: 19.99, currency: 'USD', available: true },
      { productId: djiGoggles3.id, name: 'DJI Store', url: 'https://store.dji.com/goggles-3', price: 449.00, currency: 'USD', available: true },
      { productId: djiGoggles3.id, name: 'GetFPV', url: 'https://getfpv.com/dji-goggles-3', price: 449.00, currency: 'USD', available: false },
      { productId: fatsharkRecon.id, name: 'GetFPV', url: 'https://getfpv.com/fatshark-recon-hd', price: 159.99, currency: 'USD', available: true },
      { productId: zorro.id, name: 'GetFPV', url: 'https://getfpv.com/zorro-elrs', price: 99.99, currency: 'USD', available: true },
      { productId: zorro.id, name: 'RadioMaster Store', url: 'https://radiomasterrc.com/zorro', price: 89.99, currency: 'USD', available: true },
      { productId: tx16s.id, name: 'RadioMaster Store', url: 'https://radiomasterrc.com/tx16s-mkii', price: 199.99, currency: 'USD', available: true },
      { productId: tx16s.id, name: 'GetFPV', url: 'https://getfpv.com/tx16s-mkii-elrs', price: 209.99, currency: 'USD', available: true },
      { productId: cnhl6S.id, name: 'CNHL Store', url: 'https://chinahobbyline.com/6s-1300', price: 24.99, currency: 'USD', available: true },
      { productId: hqS5.id, name: 'GetFPV', url: 'https://getfpv.com/hqprop-ethix-s5', price: 3.49, currency: 'USD', available: true },
      { productId: hqS5.id, name: 'RaceDayQuads', url: 'https://racedayquads.com/ethix-s5', price: 3.49, currency: 'USD', available: true },
    ],
  })

  // =========================================================================
  // DEALS (FPV marketplace listings)
  // =========================================================================
  console.log('  Creating deals...')

  const deal1 = await prisma.deal.create({
    data: {
      userId: alice.id,
      status: DealStatus.PUBLISHED,
      price: 180,
      currency: 'USD',
      location: 'Los Angeles, CA',
      title: 'DJI O3 Air Unit — Like New',
      description: 'Selling my DJI O3 Air Unit, bought 3 months ago. Works perfectly, upgraded to the O4 system. Comes with antenna and coax cable.',
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=DJI+O3+Used', 'https://placehold.co/800x600/0f1117/00e5ff?text=O3+Box'],
      invoiceAvailable: true,
      sellingReason: 'Upgraded to DJI O4.',
      canBeDelivered: true,
      condition: DealCondition.LIKE_NEW,
      features: [
        { label: 'Includes', value: 'Original antenna' },
        { label: 'Includes', value: 'Coax cable' },
        { label: 'Includes', value: 'Original box' },
      ],
    },
  })

  const deal2 = await prisma.deal.create({
    data: {
      userId: bob.id,
      status: DealStatus.PUBLISHED,
      price: 120,
      currency: 'USD',
      location: 'Austin, TX',
      title: 'RadioMaster Zorro ELRS + Case',
      description: 'RadioMaster Zorro with ELRS, used for 6 months. Includes hard case and neck strap. Gimbals are smooth, no stick drift.',
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Zorro+Used'],
      invoiceAvailable: false,
      sellingReason: 'Switching to TX16S.',
      canBeDelivered: true,
      condition: DealCondition.GOOD,
      features: [
        { label: 'Includes', value: 'Hard case' },
        { label: 'Includes', value: 'Neck strap' },
        { label: 'Condition', value: 'No stick drift' },
      ],
    },
  })

  const deal3 = await prisma.deal.create({
    data: {
      userId: charlie.id,
      status: DealStatus.PUBLISHED,
      price: 350,
      currency: 'USD',
      location: 'Miami, FL',
      title: 'DJI Goggles 3 — Mint Condition',
      description: 'DJI Goggles 3 in mint condition. Only used 5 times for cinematic flights. Comes with corrective lenses adapter and all original accessories.',
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=Goggles+3+Used', 'https://placehold.co/800x600/0f1117/00e5ff?text=Goggles+3+Lenses'],
      invoiceAvailable: true,
      canBeDelivered: true,
      condition: DealCondition.LIKE_NEW,
      features: [
        { label: 'Includes', value: 'Corrective lenses adapter' },
        { label: 'Includes', value: 'All original accessories' },
        { label: 'Includes', value: 'Original box' },
      ],
    },
  })

  const deal4 = await prisma.deal.create({
    data: {
      userId: diana.id,
      status: DealStatus.PUBLISHED,
      price: 25,
      currency: 'USD',
      location: 'Denver, CO',
      title: '4x Ethix Stout V4 Motors — Used',
      description: 'Set of 4 Ethix Stout V4 2306 motors. Around 50 flights on them. Bearings are still smooth, no bell play. One motor has a small scratch on the bell.',
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Stout+Motors+Used'],
      invoiceAvailable: false,
      canBeDelivered: true,
      condition: DealCondition.GOOD,
      features: [
        { label: 'Quantity', value: 'Set of 4' },
        { label: 'Condition', value: 'Bearings still smooth' },
        { label: 'Condition', value: 'No bell play' },
      ],
    },
  })

  const deal5 = await prisma.deal.create({
    data: {
      userId: alice.id,
      status: DealStatus.PUBLISHED,
      price: 55,
      currency: 'USD',
      location: 'Los Angeles, CA',
      title: 'SpeedyBee F405 V4 Stack — New Open Box',
      description: 'Brand new SpeedyBee F405 V4 stack, opened to verify contents but never installed. Changed my build plans.',
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=SpeedyBee+Used'],
      invoiceAvailable: true,
      sellingReason: 'Changed build plans.',
      canBeDelivered: true,
      condition: DealCondition.NEW,
      features: [
        { label: 'Condition', value: 'Never installed' },
        { label: 'Includes', value: 'All accessories' },
        { label: 'Includes', value: 'Original packaging' },
      ],
    },
  })

  // Pending deal (submitted for review)
  const deal6 = await prisma.deal.create({
    data: {
      userId: bob.id,
      status: DealStatus.PENDING,
      price: 80,
      currency: 'USD',
      location: 'Austin, TX',
      title: 'Walksnail Avatar V2 VTX',
      description: 'Walksnail Avatar V2 in fair condition, works well but has some cosmetic wear.',
      images: ['https://placehold.co/800x600/0f1117/a855f7?text=Walksnail+Used'],
      condition: DealCondition.FAIR,
    },
  })

  // Sold deal
  const deal7 = await prisma.deal.create({
    data: {
      userId: charlie.id,
      status: DealStatus.SOLD,
      price: 60,
      currency: 'USD',
      location: 'Miami, FL',
      title: 'GEPRC Mark5 Frame — Good Condition',
      description: 'Sold! GEPRC Mark5 frame in good condition.',
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=Mark5+Sold'],
      invoiceAvailable: false,
      condition: DealCondition.GOOD,
    },
  })

  // Declined deal
  await prisma.deal.create({
    data: {
      userId: diana.id,
      status: DealStatus.DECLINED,
      price: 10,
      currency: 'USD',
      location: 'Denver, CO',
      title: 'Broken ESC',
      description: 'ESC with blown FET.',
      condition: DealCondition.POOR,
      reasonDeclined: 'Listing does not meet quality standards. Non-functional electronics should include detailed damage description and photos.',
    },
  })

  // =========================================================================
  // DEAL PRODUCTS
  // =========================================================================
  console.log('  Linking deal products...')

  await prisma.dealProduct.createMany({
    data: [
      { dealId: deal1.id, productId: djiO3.id, quantity: 1 },
      { dealId: deal2.id, productId: zorro.id, quantity: 1 },
      { dealId: deal3.id, productId: djiGoggles3.id, quantity: 1 },
      { dealId: deal4.id, productId: ethixStout.id, quantity: 4 },
      { dealId: deal5.id, productId: speedyBee.id, quantity: 1 },
      { dealId: deal6.id, productId: walksnailAvatar.id, quantity: 1 },
      { dealId: deal7.id, productId: mark5.id, quantity: 1 },
    ],
  })

  // =========================================================================
  // DISCUSSIONS
  // =========================================================================
  console.log('  Creating discussions...')

  const discussion1 = await prisma.discussion.create({
    data: {
      dealId: deal1.id,
      buyerId: bob.id,
      sellerId: alice.id,
      matrixRoomId: '!demo-room-1:matrix.marketplace.dev',
    },
  })

  const discussion2 = await prisma.discussion.create({
    data: {
      dealId: deal1.id,
      buyerId: charlie.id,
      sellerId: alice.id,
      matrixRoomId: '!demo-room-2:matrix.marketplace.dev',
    },
  })

  const discussion3 = await prisma.discussion.create({
    data: {
      dealId: deal2.id,
      buyerId: diana.id,
      sellerId: bob.id,
      matrixRoomId: '!demo-room-3:matrix.marketplace.dev',
    },
  })

  const discussion4 = await prisma.discussion.create({
    data: {
      dealId: deal5.id,
      buyerId: charlie.id,
      sellerId: alice.id,
      matrixRoomId: '!demo-room-4:matrix.marketplace.dev',
    },
  })

  // =========================================================================
  // DISCUSSION STATUSES
  // =========================================================================
  console.log('  Creating discussion statuses...')

  await prisma.discussionStatus.createMany({
    data: [
      { discussionId: discussion1.id, userId: bob.id, newMessage: true },
      { discussionId: discussion1.id, userId: alice.id, newMessage: false },
      { discussionId: discussion2.id, userId: charlie.id, newMessage: false },
      { discussionId: discussion2.id, userId: alice.id, newMessage: true },
      { discussionId: discussion3.id, userId: diana.id, newMessage: false },
      { discussionId: discussion3.id, userId: bob.id, newMessage: false },
      { discussionId: discussion4.id, userId: charlie.id, newMessage: true },
      { discussionId: discussion4.id, userId: alice.id, newMessage: false },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
    Summary:
    - 5 users (1 admin + 4 pilots)
    - 10 root categories + subcategories (FPV drone gear)
    - 20 brands (FPV-specific)
    - 9 spec types with 31 spec values
    - 18 products with specs, shops, and components
    - 8 deals (5 published, 1 pending, 1 sold, 1 declined)
    - 4 discussions with statuses

    Demo accounts (password: "password"):
    - admin@marketplace.dev (Admin)
    - alice@marketplace.dev (Alice FPV)
    - bob@marketplace.dev (Bob Freestyle)
    - charlie@marketplace.dev (Charlie Racer)
    - diana@marketplace.dev (Diana CineWhoop)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
