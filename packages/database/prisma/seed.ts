import { PrismaClient, UserRole, DealStatus, DealCondition } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data (order matters for FK constraints)
  await prisma.message.deleteMany()
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

  const electronic = await prisma.category.create({
    data: { name: 'ELECTRONIC', key: 'electronic', description: 'Electronic components for FPV drones' },
  })
  const catMotor = await prisma.category.create({
    data: { name: 'MOTOR', key: 'motor', parentId: electronic.id },
  })
  const catEsc = await prisma.category.create({
    data: { name: 'ESC', key: 'esc', parentId: electronic.id },
  })
  const catFc = await prisma.category.create({
    data: { name: 'FC', key: 'fc', parentId: electronic.id },
  })
  const catStack = await prisma.category.create({
    data: { name: 'STACK', key: 'stack', parentId: electronic.id },
  })

  const video = await prisma.category.create({
    data: { name: 'VIDEO', key: 'video', description: 'Video systems for FPV drones' },
  })
  const catCamera = await prisma.category.create({
    data: { name: 'CAMERA', key: 'camera', parentId: video.id },
  })
  const catVtx = await prisma.category.create({
    data: { name: 'VTX', key: 'vtx', parentId: video.id },
  })
  const catVrx = await prisma.category.create({
    data: { name: 'VRX', key: 'vrx', parentId: video.id },
  })
  const catGoggles = await prisma.category.create({
    data: { name: 'GOGGLES', key: 'goggles', parentId: video.id },
  })

  const radio = await prisma.category.create({
    data: { name: 'RADIO', key: 'radio', description: 'Radio control systems' },
  })
  const catRx = await prisma.category.create({
    data: { name: 'RX', key: 'rx', parentId: radio.id },
  })
  const catTx = await prisma.category.create({
    data: { name: 'TX', key: 'tx', parentId: radio.id },
  })
  const catRadio = await prisma.category.create({
    data: { name: 'RADIO', key: 'radio-controller', parentId: radio.id },
  })

  const frame = await prisma.category.create({
    data: { name: 'FRAME', key: 'frame', description: 'FPV drone frames and parts' },
  })
  const catFrameKit = await prisma.category.create({
    data: { name: 'FRAME_KIT', key: 'frame-kit', parentId: frame.id },
  })
  const catFramePart = await prisma.category.create({
    data: { name: 'FRAME_PART', key: 'frame-part', parentId: frame.id },
  })

  const power = await prisma.category.create({
    data: { name: 'POWER', key: 'power', description: 'Batteries and chargers' },
  })
  const catChargeur = await prisma.category.create({
    data: { name: 'CHARGEUR', key: 'chargeur', parentId: power.id },
  })
  const catBattery = await prisma.category.create({
    data: { name: 'BATTERY', key: 'battery', parentId: power.id },
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

  const specKV = await prisma.specType.create({ data: { key: 'kv', label: 'KV Rating' } })
  const specStackSize = await prisma.specType.create({ data: { key: 'stack_size', label: 'Stack Size' } })
  const specStackAmp = await prisma.specType.create({ data: { key: 'stack_amp', label: 'Stack Amperage' } })
  const specCameraSize = await prisma.specType.create({ data: { key: 'camera_size', label: 'Camera Size' } })
  const specVideoSystem = await prisma.specType.create({ data: { key: 'video_system', label: 'Video System' } })
  const specVtxSize = await prisma.specType.create({ data: { key: 'vtx_size', label: 'VTX Size' } })
  const specProtocol = await prisma.specType.create({ data: { key: 'protocol', label: 'Protocol' } })
  const specFrameSize = await prisma.specType.create({ data: { key: 'frame_size', label: 'Frame Size' } })
  const specBatteryCell = await prisma.specType.create({ data: { key: 'battery_cell', label: 'Battery Cells' } })
  const specBatteryType = await prisma.specType.create({ data: { key: 'battery_type', label: 'Battery Type' } })
  const specBatteryConnector = await prisma.specType.create({ data: { key: 'battery_connector', label: 'Battery Connector' } })
  const specBatteryCapacity = await prisma.specType.create({ data: { key: 'battery_capacity', label: 'Battery Capacity' } })

  // Link spec types to categories
  await prisma.categorySpecType.createMany({
    data: [
      // MOTOR → kv
      { categoryId: catMotor.id, specTypeId: specKV.id },
      // ESC → stack_size, stack_amp
      { categoryId: catEsc.id, specTypeId: specStackSize.id },
      { categoryId: catEsc.id, specTypeId: specStackAmp.id },
      // FC → stack_size
      { categoryId: catFc.id, specTypeId: specStackSize.id },
      // STACK → stack_size, stack_amp
      { categoryId: catStack.id, specTypeId: specStackSize.id },
      { categoryId: catStack.id, specTypeId: specStackAmp.id },
      // CAMERA → camera_size, video_system
      { categoryId: catCamera.id, specTypeId: specCameraSize.id },
      { categoryId: catCamera.id, specTypeId: specVideoSystem.id },
      // VTX → vtx_size, video_system
      { categoryId: catVtx.id, specTypeId: specVtxSize.id },
      { categoryId: catVtx.id, specTypeId: specVideoSystem.id },
      // VRX → video_system
      { categoryId: catVrx.id, specTypeId: specVideoSystem.id },
      // GOGGLES → video_system
      { categoryId: catGoggles.id, specTypeId: specVideoSystem.id },
      // RX → protocol
      { categoryId: catRx.id, specTypeId: specProtocol.id },
      // TX → protocol
      { categoryId: catTx.id, specTypeId: specProtocol.id },
      // RADIO → protocol
      { categoryId: catRadio.id, specTypeId: specProtocol.id },
      // FRAME_KIT → frame_size
      { categoryId: catFrameKit.id, specTypeId: specFrameSize.id },
      // FRAME_PART → frame_size
      { categoryId: catFramePart.id, specTypeId: specFrameSize.id },
      // CHARGEUR → battery_cell, battery_type, battery_connector
      { categoryId: catChargeur.id, specTypeId: specBatteryCell.id },
      { categoryId: catChargeur.id, specTypeId: specBatteryType.id },
      { categoryId: catChargeur.id, specTypeId: specBatteryConnector.id },
      // BATTERY → battery_cell, battery_capacity, battery_connector, battery_type
      { categoryId: catBattery.id, specTypeId: specBatteryCell.id },
      { categoryId: catBattery.id, specTypeId: specBatteryCapacity.id },
      { categoryId: catBattery.id, specTypeId: specBatteryConnector.id },
      { categoryId: catBattery.id, specTypeId: specBatteryType.id },
    ],
  })

  // Create spec values
  const specs = await Promise.all([
    // KV values
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '1750KV' } }),          // 0
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '1950KV' } }),          // 1
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '2450KV' } }),          // 2
    prisma.spec.create({ data: { specTypeId: specKV.id, value: '3600KV' } }),          // 3
    // Stack Size values
    prisma.spec.create({ data: { specTypeId: specStackSize.id, value: '20x20' } }),    // 4
    prisma.spec.create({ data: { specTypeId: specStackSize.id, value: '25.5x25.5' } }),// 5
    prisma.spec.create({ data: { specTypeId: specStackSize.id, value: '30.5x30.5' } }),// 6
    // Stack Amp values
    prisma.spec.create({ data: { specTypeId: specStackAmp.id, value: '35A' } }),       // 7
    prisma.spec.create({ data: { specTypeId: specStackAmp.id, value: '45A' } }),       // 8
    prisma.spec.create({ data: { specTypeId: specStackAmp.id, value: '55A' } }),       // 9
    prisma.spec.create({ data: { specTypeId: specStackAmp.id, value: '65A' } }),       // 10
    // Camera Size values
    prisma.spec.create({ data: { specTypeId: specCameraSize.id, value: 'Micro' } }),   // 11
    prisma.spec.create({ data: { specTypeId: specCameraSize.id, value: 'Nano' } }),    // 12
    prisma.spec.create({ data: { specTypeId: specCameraSize.id, value: 'Full' } }),    // 13
    // Video System values
    prisma.spec.create({ data: { specTypeId: specVideoSystem.id, value: 'Analog' } }), // 14
    prisma.spec.create({ data: { specTypeId: specVideoSystem.id, value: 'DJI O3' } }), // 15
    prisma.spec.create({ data: { specTypeId: specVideoSystem.id, value: 'HDZero' } }), // 16
    prisma.spec.create({ data: { specTypeId: specVideoSystem.id, value: 'Walksnail' } }),// 17
    // VTX Size values
    prisma.spec.create({ data: { specTypeId: specVtxSize.id, value: '20x20' } }),      // 18
    prisma.spec.create({ data: { specTypeId: specVtxSize.id, value: '25.5x25.5' } }), // 19
    prisma.spec.create({ data: { specTypeId: specVtxSize.id, value: '30.5x30.5' } }), // 20
    // Protocol values
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'ELRS' } }),      // 21
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'Crossfire' } }), // 22
    prisma.spec.create({ data: { specTypeId: specProtocol.id, value: 'FrSky' } }),     // 23
    // Frame Size values
    prisma.spec.create({ data: { specTypeId: specFrameSize.id, value: '3"' } }),       // 24
    prisma.spec.create({ data: { specTypeId: specFrameSize.id, value: '5"' } }),       // 25
    prisma.spec.create({ data: { specTypeId: specFrameSize.id, value: '7"' } }),       // 26
    // Battery Cell values
    prisma.spec.create({ data: { specTypeId: specBatteryCell.id, value: '3S' } }),     // 27
    prisma.spec.create({ data: { specTypeId: specBatteryCell.id, value: '4S' } }),     // 28
    prisma.spec.create({ data: { specTypeId: specBatteryCell.id, value: '6S' } }),     // 29
    // Battery Type values
    prisma.spec.create({ data: { specTypeId: specBatteryType.id, value: 'LiPo' } }),  // 30
    prisma.spec.create({ data: { specTypeId: specBatteryType.id, value: 'Li-Ion' } }), // 31
    prisma.spec.create({ data: { specTypeId: specBatteryType.id, value: 'LiHV' } }),  // 32
    // Battery Connector values
    prisma.spec.create({ data: { specTypeId: specBatteryConnector.id, value: 'XT30' } }),// 33
    prisma.spec.create({ data: { specTypeId: specBatteryConnector.id, value: 'XT60' } }),// 34
    prisma.spec.create({ data: { specTypeId: specBatteryConnector.id, value: 'XT90' } }),// 35
    // Battery Capacity values
    prisma.spec.create({ data: { specTypeId: specBatteryCapacity.id, value: '1100mAh' } }),// 36
    prisma.spec.create({ data: { specTypeId: specBatteryCapacity.id, value: '1300mAh' } }),// 37
    prisma.spec.create({ data: { specTypeId: specBatteryCapacity.id, value: '1550mAh' } }),// 38
  ])

  // =========================================================================
  // PRODUCTS (FPV Drone Gear)
  // =========================================================================
  console.log('  Creating products...')

  // --- Frames ---
  const chimera5 = await prisma.product.create({
    data: {
      name: 'iFlight Chimera5 Pro Frame',
      categoryId: catFrameKit.id,
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
      categoryId: catFrameKit.id,
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
      categoryId: catMotor.id,
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
      categoryId: catMotor.id,
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
      categoryId: catMotor.id,
      brandId: emax.id,
      status: 'active',
      description: 'Lightweight 1404 motor for 3-inch micro quads. Bell designed for minimal drag.',
      features: ['Open bottom bell', '9.5g weight', 'CW thread shaft', 'Fits 3" props'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=EMAX+1404'],
    },
  })

  // --- Stacks ---
  const speedyBee = await prisma.product.create({
    data: {
      name: 'SpeedyBee F405 V4 55A 4-in-1 Stack',
      categoryId: catStack.id,
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
      categoryId: catFc.id,
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
      categoryId: catVtx.id,
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
      categoryId: catVtx.id,
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
      categoryId: catVtx.id,
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
      categoryId: catCamera.id,
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
      categoryId: catGoggles.id,
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
      categoryId: catGoggles.id,
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
      categoryId: catRadio.id,
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
      categoryId: catRadio.id,
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
      categoryId: catBattery.id,
      brandId: cnhl.id,
      status: 'active',
      description: 'High-discharge 6S LiPo for 5-inch freestyle. Consistent punch throughout the pack.',
      features: ['100C discharge', 'XT60 connector', '210g weight', 'HV compatible'],
      images: ['https://placehold.co/800x600/0f1117/00e5ff?text=CNHL+6S+1300'],
    },
  })

  // =========================================================================
  // PRODUCT SPECS
  // =========================================================================
  console.log('  Linking product specs...')

  await prisma.productSpec.createMany({
    data: [
      // Chimera5: 5" frame
      { productId: chimera5.id, specId: specs[25].id },
      // Mark5: 5" frame
      { productId: mark5.id, specId: specs[25].id },
      // XING2 2306: 1750KV
      { productId: xing2306.id, specId: specs[0].id },
      // Ethix Stout: 1750KV
      { productId: ethixStout.id, specId: specs[0].id },
      // EMAX 1404: 3600KV
      { productId: emax1404.id, specId: specs[3].id },
      // SpeedyBee: 30.5x30.5 stack, 55A
      { productId: speedyBee.id, specId: specs[6].id },
      { productId: speedyBee.id, specId: specs[9].id },
      // Diatone H743: 30.5x30.5 stack
      { productId: diatoneH7.id, specId: specs[6].id },
      // DJI O3: DJI O3 video system
      { productId: djiO3.id, specId: specs[15].id },
      // Walksnail: Walksnail video system
      { productId: walksnailAvatar.id, specId: specs[17].id },
      // HDZero: HDZero video system
      { productId: hdzeroVTX.id, specId: specs[16].id },
      // Foxeer Razer: Analog video system, Micro camera size
      { productId: foxeerRazer.id, specId: specs[14].id },
      { productId: foxeerRazer.id, specId: specs[11].id },
      // DJI Goggles 3: DJI O3 video system
      { productId: djiGoggles3.id, specId: specs[15].id },
      // Fatshark Recon: HDZero video system
      { productId: fatsharkRecon.id, specId: specs[16].id },
      // Zorro: ELRS protocol
      { productId: zorro.id, specId: specs[21].id },
      // TX16S: ELRS protocol
      { productId: tx16s.id, specId: specs[21].id },
      // CNHL 6S: 6S cells, 1300mAh capacity, XT60 connector, LiPo type
      { productId: cnhl6S.id, specId: specs[29].id },
      { productId: cnhl6S.id, specId: specs[37].id },
      { productId: cnhl6S.id, specId: specs[34].id },
      { productId: cnhl6S.id, specId: specs[30].id },
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
    },
  })

  const discussion2 = await prisma.discussion.create({
    data: {
      dealId: deal1.id,
      buyerId: charlie.id,
      sellerId: alice.id,
    },
  })

  const discussion3 = await prisma.discussion.create({
    data: {
      dealId: deal2.id,
      buyerId: diana.id,
      sellerId: bob.id,
    },
  })

  const discussion4 = await prisma.discussion.create({
    data: {
      dealId: deal5.id,
      buyerId: charlie.id,
      sellerId: alice.id,
    },
  })

  // =========================================================================
  // MESSAGES
  // =========================================================================
  console.log('  Creating messages...')

  await prisma.message.createMany({
    data: [
      { discussionId: discussion1.id, senderId: bob.id, content: 'Hey, is the DJI O3 still available?' },
      { discussionId: discussion1.id, senderId: alice.id, content: 'Yes it is! Are you interested?' },
      { discussionId: discussion1.id, senderId: bob.id, content: 'Definitely! Would you do $160?' },
      { discussionId: discussion2.id, senderId: charlie.id, content: 'Hi, does it come with the original box?' },
      { discussionId: discussion2.id, senderId: alice.id, content: 'Yes, original box and all accessories included.' },
      { discussionId: discussion3.id, senderId: diana.id, content: 'Is the Zorro still available? Interested!' },
      { discussionId: discussion4.id, senderId: charlie.id, content: 'Would you ship to Florida?' },
      { discussionId: discussion4.id, senderId: alice.id, content: 'Sure, shipping would be about $8 extra.' },
    ],
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
    - 5 root categories + 16 subcategories (FPV drone gear)
    - 20 brands (FPV-specific)
    - 12 spec types with 39 spec values
    - 17 products with specs, shops, and components
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
