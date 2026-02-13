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
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // "password"
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  const alice = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Alice Martin',
      email: 'alice@marketplace.dev',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const bob = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Bob Dupont',
      email: 'bob@marketplace.dev',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const charlie = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Charlie Nguyen',
      email: 'charlie@marketplace.dev',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  const diana = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Diana Rossi',
      email: 'diana@marketplace.dev',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  // =========================================================================
  // CATEGORIES (hierarchical)
  // =========================================================================
  console.log('  Creating categories...')

  const electronics = await prisma.category.create({
    data: { name: 'Electronics', key: 'electronics', description: 'Electronic devices and gadgets' },
  })

  const computers = await prisma.category.create({
    data: { name: 'Computers', key: 'computers', description: 'Desktops, laptops and accessories', parentId: electronics.id },
  })

  const laptops = await prisma.category.create({
    data: { name: 'Laptops', key: 'laptops', description: 'Portable computers', parentId: computers.id },
  })

  const desktops = await prisma.category.create({
    data: { name: 'Desktop PCs', key: 'desktops', description: 'Desktop computers', parentId: computers.id },
  })

  const components = await prisma.category.create({
    data: { name: 'Components', key: 'components', description: 'PC components and parts', parentId: computers.id },
  })

  const smartphones = await prisma.category.create({
    data: { name: 'Smartphones', key: 'smartphones', description: 'Mobile phones', parentId: electronics.id },
  })

  const audio = await prisma.category.create({
    data: { name: 'Audio', key: 'audio', description: 'Headphones, speakers and audio equipment', parentId: electronics.id },
  })

  const gaming = await prisma.category.create({
    data: { name: 'Gaming', key: 'gaming', description: 'Gaming consoles and accessories' },
  })

  const consoles = await prisma.category.create({
    data: { name: 'Consoles', key: 'consoles', description: 'Gaming consoles', parentId: gaming.id },
  })

  const photography = await prisma.category.create({
    data: { name: 'Photography', key: 'photography', description: 'Cameras and photography equipment' },
  })

  // =========================================================================
  // BRANDS
  // =========================================================================
  console.log('  Creating brands...')

  const [apple, samsung, sony, nvidia, amd, intel, corsair, logitech, nintendo, canon] =
    await Promise.all(
      ['Apple', 'Samsung', 'Sony', 'NVIDIA', 'AMD', 'Intel', 'Corsair', 'Logitech', 'Nintendo', 'Canon'].map(
        (name) => prisma.brand.create({ data: { name } }),
      ),
    )

  // =========================================================================
  // SPEC TYPES & SPECS
  // =========================================================================
  console.log('  Creating spec types and specs...')

  const specStorage = await prisma.specType.create({ data: { key: 'storage', label: 'Storage' } })
  const specRam = await prisma.specType.create({ data: { key: 'ram', label: 'RAM' } })
  const specProcessor = await prisma.specType.create({ data: { key: 'processor', label: 'Processor' } })
  const specScreenSize = await prisma.specType.create({ data: { key: 'screen_size', label: 'Screen Size' } })
  const specColor = await prisma.specType.create({ data: { key: 'color', label: 'Color' } })
  const specConnectivity = await prisma.specType.create({ data: { key: 'connectivity', label: 'Connectivity' } })
  const specBattery = await prisma.specType.create({ data: { key: 'battery', label: 'Battery' } })
  const specResolution = await prisma.specType.create({ data: { key: 'resolution', label: 'Resolution' } })

  // Link spec types to categories
  await prisma.categorySpecType.createMany({
    data: [
      { categoryId: laptops.id, specTypeId: specStorage.id },
      { categoryId: laptops.id, specTypeId: specRam.id },
      { categoryId: laptops.id, specTypeId: specProcessor.id },
      { categoryId: laptops.id, specTypeId: specScreenSize.id },
      { categoryId: laptops.id, specTypeId: specColor.id },
      { categoryId: smartphones.id, specTypeId: specStorage.id },
      { categoryId: smartphones.id, specTypeId: specRam.id },
      { categoryId: smartphones.id, specTypeId: specColor.id },
      { categoryId: smartphones.id, specTypeId: specScreenSize.id },
      { categoryId: smartphones.id, specTypeId: specBattery.id },
      { categoryId: audio.id, specTypeId: specConnectivity.id },
      { categoryId: audio.id, specTypeId: specColor.id },
      { categoryId: audio.id, specTypeId: specBattery.id },
      { categoryId: desktops.id, specTypeId: specStorage.id },
      { categoryId: desktops.id, specTypeId: specRam.id },
      { categoryId: desktops.id, specTypeId: specProcessor.id },
      { categoryId: components.id, specTypeId: specStorage.id },
      { categoryId: components.id, specTypeId: specRam.id },
      { categoryId: photography.id, specTypeId: specResolution.id },
      { categoryId: photography.id, specTypeId: specColor.id },
    ],
  })

  // Create spec values
  const specs = await Promise.all([
    prisma.spec.create({ data: { specTypeId: specStorage.id, value: '128 GB' } }),    // 0
    prisma.spec.create({ data: { specTypeId: specStorage.id, value: '256 GB' } }),    // 1
    prisma.spec.create({ data: { specTypeId: specStorage.id, value: '512 GB' } }),    // 2
    prisma.spec.create({ data: { specTypeId: specStorage.id, value: '1 TB' } }),      // 3
    prisma.spec.create({ data: { specTypeId: specRam.id, value: '8 GB' } }),          // 4
    prisma.spec.create({ data: { specTypeId: specRam.id, value: '16 GB' } }),         // 5
    prisma.spec.create({ data: { specTypeId: specRam.id, value: '32 GB' } }),         // 6
    prisma.spec.create({ data: { specTypeId: specRam.id, value: '64 GB' } }),         // 7
    prisma.spec.create({ data: { specTypeId: specProcessor.id, value: 'Apple M3' } }),        // 8
    prisma.spec.create({ data: { specTypeId: specProcessor.id, value: 'Apple M3 Pro' } }),    // 9
    prisma.spec.create({ data: { specTypeId: specProcessor.id, value: 'Intel Core i7-14700K' } }), // 10
    prisma.spec.create({ data: { specTypeId: specProcessor.id, value: 'AMD Ryzen 9 7950X' } }),    // 11
    prisma.spec.create({ data: { specTypeId: specScreenSize.id, value: '6.1"' } }),   // 12
    prisma.spec.create({ data: { specTypeId: specScreenSize.id, value: '6.7"' } }),   // 13
    prisma.spec.create({ data: { specTypeId: specScreenSize.id, value: '14"' } }),    // 14
    prisma.spec.create({ data: { specTypeId: specScreenSize.id, value: '16"' } }),    // 15
    prisma.spec.create({ data: { specTypeId: specColor.id, value: 'Space Black' } }),   // 16
    prisma.spec.create({ data: { specTypeId: specColor.id, value: 'Silver' } }),        // 17
    prisma.spec.create({ data: { specTypeId: specColor.id, value: 'Midnight' } }),      // 18
    prisma.spec.create({ data: { specTypeId: specColor.id, value: 'White' } }),         // 19
    prisma.spec.create({ data: { specTypeId: specConnectivity.id, value: 'Bluetooth 5.3' } }),  // 20
    prisma.spec.create({ data: { specTypeId: specConnectivity.id, value: 'Wired (3.5mm)' } }), // 21
    prisma.spec.create({ data: { specTypeId: specConnectivity.id, value: 'USB-C' } }),         // 22
    prisma.spec.create({ data: { specTypeId: specBattery.id, value: '20h' } }),         // 23
    prisma.spec.create({ data: { specTypeId: specBattery.id, value: '30h' } }),         // 24
    prisma.spec.create({ data: { specTypeId: specBattery.id, value: '4422 mAh' } }),   // 25
    prisma.spec.create({ data: { specTypeId: specResolution.id, value: '45 MP' } }),    // 26
    prisma.spec.create({ data: { specTypeId: specResolution.id, value: '24.2 MP' } }), // 27
  ])

  // =========================================================================
  // PRODUCTS
  // =========================================================================
  console.log('  Creating products...')

  // --- Laptops ---
  const macbookPro16 = await prisma.product.create({
    data: {
      name: 'MacBook Pro 16" M3 Pro',
      categoryId: laptops.id,
      brandId: apple.id,
      status: 'active',
      description: 'Apple MacBook Pro 16-inch with M3 Pro chip, ideal for professional workflows.',
      features: ['Liquid Retina XDR display', 'Up to 22h battery life', 'MagSafe charging', 'HDMI port', 'SD card slot'],
      images: ['https://placehold.co/800x600/1a1a2e/eaeaea?text=MacBook+Pro+16', 'https://placehold.co/800x600/1a1a2e/eaeaea?text=MacBook+Pro+Side'],
    },
  })

  const macbookAir = await prisma.product.create({
    data: {
      name: 'MacBook Air 15" M3',
      categoryId: laptops.id,
      brandId: apple.id,
      status: 'active',
      description: 'Ultra-thin and light laptop with the M3 chip.',
      features: ['Fanless design', 'Up to 18h battery life', 'MagSafe charging', '1080p webcam'],
      images: ['https://placehold.co/800x600/c0c0c0/333333?text=MacBook+Air+15', 'https://placehold.co/800x600/c0c0c0/333333?text=MacBook+Air+Open'],
    },
  })

  // --- Smartphones ---
  const iphone15Pro = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      categoryId: smartphones.id,
      brandId: apple.id,
      status: 'active',
      description: 'Apple iPhone 15 Pro with A17 Pro chip and titanium design.',
      features: ['Titanium design', 'Action Button', 'USB-C', '48MP main camera', 'ProMotion display'],
      images: ['https://placehold.co/800x600/2c2c3a/eaeaea?text=iPhone+15+Pro', 'https://placehold.co/800x600/2c2c3a/eaeaea?text=iPhone+15+Pro+Back'],
    },
  })

  const galaxyS24 = await prisma.product.create({
    data: {
      name: 'Galaxy S24 Ultra',
      categoryId: smartphones.id,
      brandId: samsung.id,
      status: 'active',
      description: 'Samsung Galaxy S24 Ultra with built-in S Pen and AI features.',
      features: ['S Pen included', '200MP camera', 'Galaxy AI', 'Titanium frame', 'QHD+ display'],
      images: ['https://placehold.co/800x600/1a1a40/eaeaea?text=Galaxy+S24+Ultra', 'https://placehold.co/800x600/1a1a40/eaeaea?text=Galaxy+S24+S+Pen'],
    },
  })

  // --- Audio ---
  const airpodsMax = await prisma.product.create({
    data: {
      name: 'AirPods Max',
      categoryId: audio.id,
      brandId: apple.id,
      status: 'active',
      description: 'Premium over-ear headphones with Active Noise Cancellation.',
      features: ['Active Noise Cancellation', 'Spatial Audio', 'Digital Crown', 'Aluminium ear cups'],
      images: ['https://placehold.co/800x600/e8e8e8/333333?text=AirPods+Max', 'https://placehold.co/800x600/e8e8e8/333333?text=AirPods+Max+Case'],
    },
  })

  const sonyWH1000 = await prisma.product.create({
    data: {
      name: 'WH-1000XM5',
      categoryId: audio.id,
      brandId: sony.id,
      status: 'active',
      description: 'Industry-leading noise cancelling headphones by Sony.',
      features: ['Auto NC Optimizer', 'Speak-to-Chat', 'Multipoint connection', '30h battery'],
      images: ['https://placehold.co/800x600/2b2b2b/eaeaea?text=Sony+WH-1000XM5', 'https://placehold.co/800x600/2b2b2b/eaeaea?text=WH-1000XM5+Folded'],
    },
  })

  // --- Components ---
  const rtx4090 = await prisma.product.create({
    data: {
      name: 'GeForce RTX 4090',
      categoryId: components.id,
      brandId: nvidia.id,
      status: 'active',
      description: 'NVIDIA flagship GPU with Ada Lovelace architecture.',
      features: ['24 GB GDDR6X', 'DLSS 3', 'Ray Tracing', 'AV1 Encoder'],
      images: ['https://placehold.co/800x600/76b900/ffffff?text=RTX+4090', 'https://placehold.co/800x600/76b900/ffffff?text=RTX+4090+Fans'],
    },
  })

  const ryzen9 = await prisma.product.create({
    data: {
      name: 'Ryzen 9 7950X',
      categoryId: components.id,
      brandId: amd.id,
      status: 'active',
      description: 'AMD flagship desktop processor with 16 cores and 32 threads.',
      features: ['16 cores / 32 threads', '5.7 GHz boost', 'AM5 Socket', '170W TDP'],
      images: ['https://placehold.co/800x600/ed1c24/ffffff?text=Ryzen+9+7950X', 'https://placehold.co/800x600/ed1c24/ffffff?text=Ryzen+9+Box'],
    },
  })

  const corsairRam = await prisma.product.create({
    data: {
      name: 'Vengeance DDR5 32GB (2x16GB)',
      categoryId: components.id,
      brandId: corsair.id,
      status: 'active',
      description: 'High-performance DDR5 memory kit.',
      features: ['DDR5-6000', 'Intel XMP 3.0', 'CL36', 'Aluminium heat spreader'],
      images: ['https://placehold.co/800x600/f5d600/1a1a1a?text=Vengeance+DDR5', 'https://placehold.co/800x600/f5d600/1a1a1a?text=DDR5+Kit'],
    },
  })

  // --- Desktop ---
  const customDesktop = await prisma.product.create({
    data: {
      name: 'Custom Gaming Desktop',
      categoryId: desktops.id,
      status: 'active',
      description: 'High-end custom-built gaming PC.',
      features: ['Custom build', 'Liquid cooling', 'RGB lighting'],
      images: ['https://placehold.co/800x600/0f0f1a/00d4ff?text=Gaming+Desktop', 'https://placehold.co/800x600/0f0f1a/ff00ff?text=RGB+Interior'],
    },
  })

  // --- Consoles ---
  const ps5 = await prisma.product.create({
    data: {
      name: 'PlayStation 5',
      categoryId: consoles.id,
      brandId: sony.id,
      status: 'active',
      description: 'Sony PS5 with disc drive.',
      features: ['4K gaming', 'Ray Tracing', 'DualSense controller', '825GB SSD'],
      images: ['https://placehold.co/800x600/00439c/ffffff?text=PlayStation+5', 'https://placehold.co/800x600/00439c/ffffff?text=PS5+Controller'],
    },
  })

  const switchOLED = await prisma.product.create({
    data: {
      name: 'Nintendo Switch OLED',
      categoryId: consoles.id,
      brandId: nintendo.id,
      status: 'active',
      description: 'Hybrid gaming console with 7-inch OLED screen.',
      features: ['7" OLED screen', 'Wide adjustable stand', '64GB internal storage', 'Enhanced audio'],
      images: ['https://placehold.co/800x600/e60012/ffffff?text=Switch+OLED', 'https://placehold.co/800x600/e60012/ffffff?text=Switch+Dock'],
    },
  })

  // --- Photography ---
  const canonR6 = await prisma.product.create({
    data: {
      name: 'EOS R6 Mark II',
      categoryId: photography.id,
      brandId: canon.id,
      status: 'active',
      description: 'Full-frame mirrorless camera for photo and video.',
      features: ['24.2 MP full-frame', '4K 60fps video', 'Up to 40fps burst', 'Dual card slots'],
      images: ['https://placehold.co/800x600/1a1a1a/cc0000?text=Canon+EOS+R6+II', 'https://placehold.co/800x600/1a1a1a/cc0000?text=EOS+R6+Top'],
    },
  })

  // =========================================================================
  // PRODUCT SPECS (linking products to spec values)
  // =========================================================================
  console.log('  Linking product specs...')

  await prisma.productSpec.createMany({
    data: [
      // MacBook Pro 16: 512GB, 18GB RAM, M3 Pro, 16", Space Black
      { productId: macbookPro16.id, specId: specs[2].id },
      { productId: macbookPro16.id, specId: specs[5].id },
      { productId: macbookPro16.id, specId: specs[9].id },
      { productId: macbookPro16.id, specId: specs[15].id },
      { productId: macbookPro16.id, specId: specs[16].id },
      // MacBook Air: 256GB, 8GB RAM, M3, Silver
      { productId: macbookAir.id, specId: specs[1].id },
      { productId: macbookAir.id, specId: specs[4].id },
      { productId: macbookAir.id, specId: specs[8].id },
      { productId: macbookAir.id, specId: specs[17].id },
      // iPhone 15 Pro: 256GB, 6.1", Midnight
      { productId: iphone15Pro.id, specId: specs[1].id },
      { productId: iphone15Pro.id, specId: specs[12].id },
      { productId: iphone15Pro.id, specId: specs[18].id },
      // Galaxy S24 Ultra: 512GB, 6.7"
      { productId: galaxyS24.id, specId: specs[2].id },
      { productId: galaxyS24.id, specId: specs[13].id },
      // AirPods Max: Bluetooth, 20h, White
      { productId: airpodsMax.id, specId: specs[20].id },
      { productId: airpodsMax.id, specId: specs[23].id },
      { productId: airpodsMax.id, specId: specs[19].id },
      // Sony WH-1000XM5: Bluetooth, 30h, Space Black
      { productId: sonyWH1000.id, specId: specs[20].id },
      { productId: sonyWH1000.id, specId: specs[24].id },
      { productId: sonyWH1000.id, specId: specs[16].id },
      // Corsair RAM: 32GB
      { productId: corsairRam.id, specId: specs[6].id },
      // Canon R6 II: 24.2 MP
      { productId: canonR6.id, specId: specs[27].id },
    ],
  })

  // =========================================================================
  // PRODUCT COMPONENTS (desktop = gpu + cpu + ram)
  // =========================================================================
  console.log('  Creating product components...')

  await prisma.productComponent.createMany({
    data: [
      { parentId: customDesktop.id, componentId: rtx4090.id },
      { parentId: customDesktop.id, componentId: ryzen9.id },
      { parentId: customDesktop.id, componentId: corsairRam.id },
    ],
  })

  // =========================================================================
  // SHOPS (external retailers)
  // =========================================================================
  console.log('  Creating shops...')

  await prisma.shop.createMany({
    data: [
      { productId: macbookPro16.id, name: 'Apple Store', url: 'https://apple.com/shop/macbook-pro', price: 2499, currency: 'EUR', available: true },
      { productId: macbookPro16.id, name: 'Amazon', url: 'https://amazon.fr/dp/macbookpro16', price: 2399, currency: 'EUR', available: true },
      { productId: macbookAir.id, name: 'Apple Store', url: 'https://apple.com/shop/macbook-air', price: 1499, currency: 'EUR', available: true },
      { productId: iphone15Pro.id, name: 'Apple Store', url: 'https://apple.com/shop/iphone-15-pro', price: 1199, currency: 'EUR', available: true },
      { productId: iphone15Pro.id, name: 'Fnac', url: 'https://fnac.com/iphone-15-pro', price: 1179, currency: 'EUR', available: true },
      { productId: galaxyS24.id, name: 'Samsung Store', url: 'https://samsung.com/galaxy-s24-ultra', price: 1469, currency: 'EUR', available: true },
      { productId: airpodsMax.id, name: 'Apple Store', url: 'https://apple.com/shop/airpods-max', price: 579, currency: 'EUR', available: true },
      { productId: sonyWH1000.id, name: 'Amazon', url: 'https://amazon.fr/dp/wh1000xm5', price: 299, currency: 'EUR', available: true },
      { productId: rtx4090.id, name: 'LDLC', url: 'https://ldlc.com/rtx-4090', price: 1799, currency: 'EUR', available: false },
      { productId: ps5.id, name: 'Amazon', url: 'https://amazon.fr/dp/ps5', price: 549, currency: 'EUR', available: true },
      { productId: switchOLED.id, name: 'Fnac', url: 'https://fnac.com/switch-oled', price: 349, currency: 'EUR', available: true },
      { productId: canonR6.id, name: 'Amazon', url: 'https://amazon.fr/dp/eos-r6-ii', price: 2499, currency: 'EUR', available: true },
    ],
  })

  // =========================================================================
  // DEALS (marketplace listings)
  // =========================================================================
  console.log('  Creating deals...')

  const deal1 = await prisma.deal.create({
    data: {
      userId: alice.id,
      status: DealStatus.PUBLISHED,
      price: 1800,
      currency: 'EUR',
      location: 'Paris, France',
      title: 'MacBook Pro 16" M3 Pro - Like New',
      description: 'Selling my MacBook Pro 16" bought in March 2024. Pristine condition, always used with a case. Comes with original box and charger. AppleCare+ valid until March 2027.',
      images: ['https://placehold.co/800x600/1a1a2e/eaeaea?text=MacBook+Pro+Used', 'https://placehold.co/800x600/1a1a2e/eaeaea?text=MacBook+Pro+Box'],
      invoiceAvailable: true,
      sellingReason: 'Switching to a desktop setup for work.',
      canBeDelivered: true,
      condition: DealCondition.LIKE_NEW,
      features: ['AppleCare+ until 2027', 'Original box included', '42 battery cycles'],
    },
  })

  const deal2 = await prisma.deal.create({
    data: {
      userId: bob.id,
      status: DealStatus.PUBLISHED,
      price: 850,
      currency: 'EUR',
      location: 'Lyon, France',
      title: 'iPhone 15 Pro 256GB Midnight',
      description: 'iPhone 15 Pro in perfect working condition. Minor micro-scratches on the frame, screen is flawless with a screen protector since day one.',
      images: ['https://placehold.co/800x600/2c2c3a/eaeaea?text=iPhone+15+Pro+Used'],
      invoiceAvailable: true,
      sellingReason: 'Upgrading to iPhone 16 Pro.',
      canBeDelivered: true,
      condition: DealCondition.GOOD,
      features: ['Screen protector installed', 'Case included', 'Battery health 94%'],
    },
  })

  const deal3 = await prisma.deal.create({
    data: {
      userId: charlie.id,
      status: DealStatus.PUBLISHED,
      price: 420,
      currency: 'EUR',
      location: 'Marseille, France',
      title: 'PS5 + 2 Controllers + 5 Games',
      description: 'PlayStation 5 disc edition bundle. Includes 2 DualSense controllers (white + midnight black) and 5 games: Spider-Man 2, God of War Ragnarok, Horizon Forbidden West, Gran Turismo 7, and Ratchet & Clank.',
      images: ['https://placehold.co/800x600/00439c/ffffff?text=PS5+Bundle', 'https://placehold.co/800x600/00439c/ffffff?text=PS5+Controllers', 'https://placehold.co/800x600/00439c/ffffff?text=PS5+Games'],
      invoiceAvailable: false,
      canBeDelivered: false,
      condition: DealCondition.GOOD,
      features: ['2 controllers', '5 games included', 'All cables included'],
    },
  })

  const deal4 = await prisma.deal.create({
    data: {
      userId: diana.id,
      status: DealStatus.PUBLISHED,
      price: 200,
      currency: 'EUR',
      location: 'Bordeaux, France',
      title: 'Sony WH-1000XM5 - Barely Used',
      description: 'Sony noise cancelling headphones, bought 2 months ago. Selling because I prefer earbuds. Comes with original case, cable, and airplane adapter.',
      images: ['https://placehold.co/800x600/2b2b2b/eaeaea?text=Sony+XM5+Used'],
      invoiceAvailable: true,
      sellingReason: 'Prefer earbuds.',
      canBeDelivered: true,
      condition: DealCondition.LIKE_NEW,
      features: ['Original case', 'All accessories included'],
    },
  })

  const deal5 = await prisma.deal.create({
    data: {
      userId: alice.id,
      status: DealStatus.PUBLISHED,
      price: 1350,
      currency: 'EUR',
      location: 'Paris, France',
      title: 'RTX 4090 Founders Edition',
      description: 'NVIDIA RTX 4090 FE, purchased in January 2024. Used for 3D rendering, never overclocked. Works perfectly.',
      images: ['https://placehold.co/800x600/76b900/ffffff?text=RTX+4090+Used'],
      invoiceAvailable: true,
      sellingReason: 'Downgrading, this is overkill for my needs.',
      canBeDelivered: true,
      condition: DealCondition.GOOD,
      features: ['Never overclocked', 'Original box'],
    },
  })

  // Draft deal
  const deal6 = await prisma.deal.create({
    data: {
      userId: bob.id,
      status: DealStatus.DRAFT,
      price: 250,
      currency: 'EUR',
      location: 'Lyon, France',
      title: 'Nintendo Switch OLED',
      description: 'Work in progress listing...',
      images: ['https://placehold.co/800x600/e60012/ffffff?text=Switch+OLED+Used'],
      condition: DealCondition.FAIR,
    },
  })

  // Sold deal
  const deal7 = await prisma.deal.create({
    data: {
      userId: charlie.id,
      status: DealStatus.SOLD,
      price: 350,
      currency: 'EUR',
      location: 'Marseille, France',
      title: 'AirPods Max Silver',
      description: 'Sold! AirPods Max in great condition.',
      images: ['https://placehold.co/800x600/e8e8e8/333333?text=AirPods+Max+Sold'],
      invoiceAvailable: true,
      condition: DealCondition.GOOD,
    },
  })

  // Declined deal
  await prisma.deal.create({
    data: {
      userId: diana.id,
      status: DealStatus.DECLINED,
      price: 50,
      currency: 'EUR',
      location: 'Bordeaux, France',
      title: 'Broken iPhone',
      description: 'iPhone with cracked screen.',
      condition: DealCondition.POOR,
      reasonDeclined: 'Listing does not meet quality standards. Missing images and details about the damage.',
    },
  })

  // =========================================================================
  // DEAL PRODUCTS (link deals to products)
  // =========================================================================
  console.log('  Linking deal products...')

  await prisma.dealProduct.createMany({
    data: [
      { dealId: deal1.id, productId: macbookPro16.id, quantity: 1 },
      { dealId: deal2.id, productId: iphone15Pro.id, quantity: 1 },
      { dealId: deal3.id, productId: ps5.id, quantity: 1 },
      { dealId: deal4.id, productId: sonyWH1000.id, quantity: 1 },
      { dealId: deal5.id, productId: rtx4090.id, quantity: 1 },
      { dealId: deal6.id, productId: switchOLED.id, quantity: 1 },
      { dealId: deal7.id, productId: airpodsMax.id, quantity: 1 },
    ],
  })

  // =========================================================================
  // DISCUSSIONS (buyer-seller conversations)
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
  // DISCUSSION STATUSES (read/unread tracking)
  // =========================================================================
  console.log('  Creating discussion statuses...')

  await prisma.discussionStatus.createMany({
    data: [
      // Discussion 1: Bob has a new message from Alice
      { discussionId: discussion1.id, userId: bob.id, newMessage: true },
      { discussionId: discussion1.id, userId: alice.id, newMessage: false },
      // Discussion 2: Alice has a new message from Charlie
      { discussionId: discussion2.id, userId: charlie.id, newMessage: false },
      { discussionId: discussion2.id, userId: alice.id, newMessage: true },
      // Discussion 3: Both read
      { discussionId: discussion3.id, userId: diana.id, newMessage: false },
      { discussionId: discussion3.id, userId: bob.id, newMessage: false },
      // Discussion 4: Charlie has unread
      { discussionId: discussion4.id, userId: charlie.id, newMessage: true },
      { discussionId: discussion4.id, userId: alice.id, newMessage: false },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
    Summary:
    - 5 users (1 admin + 4 regular)
    - 10 categories (hierarchical)
    - 10 brands
    - 8 spec types with 28 spec values
    - 13 products with specs, shops, and components
    - 8 deals (5 published, 1 draft, 1 sold, 1 declined)
    - 4 discussions with statuses

    Demo accounts (password: "password"):
    - admin@marketplace.dev (Admin)
    - alice@marketplace.dev
    - bob@marketplace.dev
    - charlie@marketplace.dev
    - diana@marketplace.dev
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
