import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BusMate BD database...');

  // Clear existing data in correct dependency order
  await prisma.notification.deleteMany();
  await prisma.sosAlert.deleteMany();
  await prisma.lostFound.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.crowdReport.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.route.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.transportOperator.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Demo@2024!', 12);

  // =====================
  // USERS
  // =====================
  const adminUser = await prisma.user.create({
    data: { name: 'System Admin', email: 'admin@busmatebd.demo', phone: '01700000001', passwordHash: hash, role: 'ADMIN' },
  });
  const operatorUser = await prisma.user.create({
    data: { name: 'Rahim Transport', email: 'operator@busmatebd.demo', phone: '01700000002', passwordHash: hash, role: 'OPERATOR' },
  });
  const operatorUser2 = await prisma.user.create({
    data: { name: 'Dhaka Express Lines', email: 'operator2@busmatebd.demo', phone: '01700000007', passwordHash: hash, role: 'OPERATOR' },
  });
  const driverUser1 = await prisma.user.create({
    data: { name: 'Karim Uddin', email: 'driver@busmatebd.demo', phone: '01700000003', passwordHash: hash, role: 'DRIVER' },
  });
  const driverUser2 = await prisma.user.create({
    data: { name: 'Jamal Hossain', email: 'driver2@busmatebd.demo', phone: '01700000004', passwordHash: hash, role: 'DRIVER' },
  });
  const driverUser3 = await prisma.user.create({
    data: { name: 'Faruk Ahmed', email: 'driver3@busmatebd.demo', phone: '01700000005', passwordHash: hash, role: 'DRIVER' },
  });
  const driverUser4 = await prisma.user.create({
    data: { name: 'Nizam Ali', email: 'driver4@busmatebd.demo', phone: '01700000008', passwordHash: hash, role: 'DRIVER' },
  });
  const passengerUser = await prisma.user.create({
    data: { name: 'Anika Rahman', email: 'passenger@busmatebd.demo', phone: '01700000006', passwordHash: hash, role: 'PASSENGER' },
  });
  const passengerUser2 = await prisma.user.create({
    data: { name: 'Sabbir Islam', email: 'passenger2@busmatebd.demo', phone: '01711000001', passwordHash: hash, role: 'PASSENGER' },
  });
  const passengerUser3 = await prisma.user.create({
    data: { name: 'Nasrin Akter', email: 'passenger3@busmatebd.demo', phone: '01711000002', passwordHash: hash, role: 'PASSENGER' },
  });

  // =====================
  // PROFILES
  // =====================
  const operator = await prisma.transportOperator.create({
    data: { userId: operatorUser.id, organizationName: 'Rahim Transport Co.', contactEmail: 'operator@busmatebd.demo', contactPhone: '01700000002', licenseNumber: 'OP-2024-001' },
  });
  const operator2 = await prisma.transportOperator.create({
    data: { userId: operatorUser2.id, organizationName: 'Dhaka Express Lines Ltd.', contactEmail: 'operator2@busmatebd.demo', contactPhone: '01700000007', licenseNumber: 'OP-2024-002' },
  });

  // Create drivers WITHOUT busId first (buses don't exist yet)
  const driver1 = await prisma.driver.create({ data: { userId: driverUser1.id, licenseNumber: 'DL-2024-101', status: 'ONLINE' } });
  const driver2 = await prisma.driver.create({ data: { userId: driverUser2.id, licenseNumber: 'DL-2024-102', status: 'OFFLINE' } });
  const driver3 = await prisma.driver.create({ data: { userId: driverUser3.id, licenseNumber: 'DL-2024-103', status: 'ONLINE' } });
  const driver4 = await prisma.driver.create({ data: { userId: driverUser4.id, licenseNumber: 'DL-2024-104', status: 'OFFLINE' } });

  const passenger1 = await prisma.passenger.create({ data: { userId: passengerUser.id, currentLat: 23.8041, currentLng: 90.3654 } });
  const passenger2 = await prisma.passenger.create({ data: { userId: passengerUser2.id, currentLat: 23.8223, currentLng: 90.3654 } });
  const passenger3 = await prisma.passenger.create({ data: { userId: passengerUser3.id, currentLat: 23.7806, currentLng: 90.4070 } });

  // =====================
  // ROUTES (Dhaka)
  // =====================
  const route1 = await prisma.route.create({
    data: {
      name: 'Mirpur–Farmgate Express', startPoint: 'Mirpur 10', endPoint: 'Farmgate',
      distance: 10.5, estimatedDuration: 45, baseFare: 25,
      stops: [
        { name: 'Mirpur 10', lat: 23.8041, lng: 90.3654, order: 1 },
        { name: 'Mirpur 1', lat: 23.7938, lng: 90.3606, order: 2 },
        { name: 'Shewrapara', lat: 23.7857, lng: 90.3637, order: 3 },
        { name: 'Rayer Bazar', lat: 23.7733, lng: 90.3601, order: 4 },
        { name: 'Asad Gate', lat: 23.7704, lng: 90.3700, order: 5 },
        { name: 'Farmgate', lat: 23.7574, lng: 90.3874, order: 6 },
      ],
    },
  });
  const route2 = await prisma.route.create({
    data: {
      name: 'Uttara–Motijheel Link', startPoint: 'Uttara', endPoint: 'Motijheel',
      distance: 22.0, estimatedDuration: 70, baseFare: 50,
      stops: [
        { name: 'Uttara Sector 10', lat: 23.8759, lng: 90.3795, order: 1 },
        { name: 'Airport Road', lat: 23.8480, lng: 90.4036, order: 2 },
        { name: 'Banani', lat: 23.7937, lng: 90.4066, order: 3 },
        { name: 'Gulshan 1', lat: 23.7806, lng: 90.4153, order: 4 },
        { name: 'Farmgate', lat: 23.7574, lng: 90.3874, order: 5 },
        { name: 'Karwan Bazar', lat: 23.7511, lng: 90.3931, order: 6 },
        { name: 'Shahbagh', lat: 23.7389, lng: 90.3957, order: 7 },
        { name: 'Motijheel', lat: 23.7272, lng: 90.4172, order: 8 },
      ],
    },
  });
  const route3 = await prisma.route.create({
    data: {
      name: 'Mohammadpur–Gulshan AC', startPoint: 'Mohammadpur', endPoint: 'Gulshan 2',
      distance: 14.0, estimatedDuration: 55, baseFare: 35,
      stops: [
        { name: 'Mohammadpur Bus Stand', lat: 23.7633, lng: 90.3556, order: 1 },
        { name: 'Asad Gate', lat: 23.7704, lng: 90.3700, order: 2 },
        { name: 'Farmgate', lat: 23.7574, lng: 90.3874, order: 3 },
        { name: 'Karwan Bazar', lat: 23.7511, lng: 90.3931, order: 4 },
        { name: 'Banglamotor', lat: 23.7455, lng: 90.3960, order: 5 },
        { name: 'Gulshan 1', lat: 23.7806, lng: 90.4153, order: 6 },
        { name: 'Gulshan 2', lat: 23.7934, lng: 90.4149, order: 7 },
      ],
    },
  });
  const route4 = await prisma.route.create({
    data: {
      name: 'Jatrabari–Motijheel Local', startPoint: 'Jatrabari', endPoint: 'Motijheel',
      distance: 9.0, estimatedDuration: 40, baseFare: 20,
      stops: [
        { name: 'Jatrabari', lat: 23.7073, lng: 90.4326, order: 1 },
        { name: 'Demra Road', lat: 23.7130, lng: 90.4270, order: 2 },
        { name: 'Sayedabad', lat: 23.7186, lng: 90.4220, order: 3 },
        { name: 'Kotwali', lat: 23.7230, lng: 90.4150, order: 4 },
        { name: 'Motijheel', lat: 23.7272, lng: 90.4172, order: 5 },
      ],
    },
  });
  const route5 = await prisma.route.create({
    data: {
      name: 'Dhanmondi–Gulshan Direct', startPoint: 'Dhanmondi 27', endPoint: 'Gulshan 1',
      distance: 8.5, estimatedDuration: 35, baseFare: 20,
      stops: [
        { name: 'Dhanmondi 27', lat: 23.7461, lng: 90.3742, order: 1 },
        { name: 'Dhanmondi 15', lat: 23.7503, lng: 90.3774, order: 2 },
        { name: 'Panthapath', lat: 23.7527, lng: 90.3864, order: 3 },
        { name: 'Banglamotor', lat: 23.7455, lng: 90.3960, order: 4 },
        { name: 'Hatirjheel', lat: 23.7601, lng: 90.4057, order: 5 },
        { name: 'Gulshan 1', lat: 23.7806, lng: 90.4153, order: 6 },
      ],
    },
  });
  const route6 = await prisma.route.create({
    data: {
      name: 'Bashundhara–Farmgate Express', startPoint: 'Bashundhara', endPoint: 'Farmgate',
      distance: 13.0, estimatedDuration: 50, baseFare: 30,
      stops: [
        { name: 'Bashundhara Gate', lat: 23.8147, lng: 90.4244, order: 1 },
        { name: 'Nadda', lat: 23.8027, lng: 90.4183, order: 2 },
        { name: 'Banani', lat: 23.7937, lng: 90.4066, order: 3 },
        { name: 'Mahakhali', lat: 23.7786, lng: 90.4004, order: 4 },
        { name: 'Tejgaon', lat: 23.7625, lng: 90.3926, order: 5 },
        { name: 'Farmgate', lat: 23.7574, lng: 90.3874, order: 6 },
      ],
    },
  });

  // =====================
  // BUSES (no driverId — FK is now on Driver)
  // =====================
  const bus1 = await prisma.bus.create({
    data: { name: 'Mirpur Express', busNumber: 'DHA-01-1234', operatorId: operator.id, capacity: 50, routeId: route1.id, status: 'ACTIVE', currentLat: 23.7857, currentLng: 90.3637, lastUpdated: new Date() },
  });
  const bus2 = await prisma.bus.create({
    data: { name: 'City Liner', busNumber: 'DHA-02-5678', operatorId: operator.id, capacity: 45, routeId: route2.id, status: 'ACTIVE', currentLat: 23.8223, currentLng: 90.3795, lastUpdated: new Date() },
  });
  const bus3 = await prisma.bus.create({
    data: { name: 'Gulshan AC', busNumber: 'DHA-03-9012', operatorId: operator2.id, capacity: 40, routeId: route3.id, status: 'ACTIVE', currentLat: 23.7633, currentLng: 90.3600, lastUpdated: new Date() },
  });
  const bus4 = await prisma.bus.create({
    data: { name: 'Jatrabari Local', busNumber: 'DHA-04-3456', operatorId: operator2.id, capacity: 55, routeId: route4.id, status: 'INACTIVE' },
  });
  await prisma.bus.create({
    data: { name: 'Dhanmondi Express', busNumber: 'DHA-05-7890', operatorId: operator.id, capacity: 50, routeId: route5.id, status: 'INACTIVE' },
  });
  await prisma.bus.create({
    data: { name: 'Bashundhara Shuttle', busNumber: 'DHA-06-2345', operatorId: operator2.id, capacity: 45, routeId: route6.id, status: 'MAINTENANCE' },
  });

  // Generate 15 additional active buses for a lively map demo
  const routesArr = [route1, route2, route3, route4, route5, route6];
  for (let i = 1; i <= 15; i++) {
    const route = routesArr[i % 6];
    // Random lat between 23.72 and 23.85 (Dhaka)
    const rLat = 23.72 + Math.random() * 0.13;
    // Random lng between 90.36 and 90.42 (Dhaka)
    const rLng = 90.36 + Math.random() * 0.06;
    
    await prisma.bus.create({
      data: {
        name: `City Transit ${i}`,
        busNumber: `DHA-99-${String(i).padStart(4, '0')}`,
        operatorId: i % 2 === 0 ? operator.id : operator2.id,
        capacity: 40,
        routeId: route.id,
        status: 'ACTIVE',
        currentLat: rLat,
        currentLng: rLng,
        lastUpdated: new Date(),
      }
    });
  }

  // Now update drivers WITH busId (FK lives on Driver side in this schema)
  await prisma.driver.update({ where: { id: driver1.id }, data: { busId: bus1.id } });
  await prisma.driver.update({ where: { id: driver2.id }, data: { busId: bus2.id } });
  await prisma.driver.update({ where: { id: driver3.id }, data: { busId: bus3.id } });
  await prisma.driver.update({ where: { id: driver4.id }, data: { busId: bus4.id } });

  // =====================
  // CROWD REPORTS
  // =====================
  await prisma.crowdReport.createMany({
    data: [
      { busId: bus1.id, userId: passengerUser.id, level: 'MODERATE' },
      { busId: bus2.id, userId: passengerUser2.id, level: 'HIGH' },
      { busId: bus3.id, userId: passengerUser3.id, level: 'LOW' },
      { busId: bus1.id, userId: passengerUser2.id, level: 'MODERATE' },
    ],
  });

  // =====================
  // RATINGS
  // =====================
  await prisma.rating.createMany({
    data: [
      { userId: passengerUser.id, busId: bus1.id, driverId: driver1.id, stars: 4, review: 'Good service, on time mostly.' },
      { userId: passengerUser2.id, busId: bus1.id, driverId: driver1.id, stars: 3, review: 'A bit crowded but manageable.' },
      { userId: passengerUser3.id, busId: bus2.id, driverId: driver2.id, stars: 5, review: 'Excellent! Very comfortable.' },
      { userId: passengerUser.id, busId: bus3.id, driverId: driver3.id, stars: 4, review: 'AC was nice, smooth ride.' },
      { userId: passengerUser2.id, busId: bus3.id, stars: 5, review: 'Best AC bus in Dhaka!' },
    ],
  });

  // =====================
  // TRIPS
  // =====================
  await prisma.trip.createMany({
    data: [
      { passengerId: passenger1.id, userId: passengerUser.id, routeId: route1.id, busId: bus1.id, source: 'Mirpur 10', destination: 'Farmgate', fare: 25, status: 'COMPLETED', startedAt: new Date(Date.now() - 3 * 3600000), endedAt: new Date(Date.now() - 2 * 3600000) },
      { passengerId: passenger1.id, userId: passengerUser.id, routeId: route3.id, busId: bus3.id, source: 'Mohammadpur', destination: 'Gulshan 2', fare: 35, status: 'COMPLETED', startedAt: new Date(Date.now() - 86400000), endedAt: new Date(Date.now() - 82800000) },
      { passengerId: passenger2.id, userId: passengerUser2.id, routeId: route2.id, busId: bus2.id, source: 'Uttara', destination: 'Motijheel', fare: 50, status: 'COMPLETED', startedAt: new Date(Date.now() - 7200000), endedAt: new Date(Date.now() - 5400000) },
      { passengerId: passenger3.id, userId: passengerUser3.id, routeId: route4.id, source: 'Jatrabari', destination: 'Motijheel', fare: 20, status: 'ACTIVE', startedAt: new Date() },
    ],
  });

  // =====================
  // SOS ALERTS
  // =====================
  await prisma.sosAlert.create({
    data: { userId: passengerUser.id, lat: 23.7857, lng: 90.3637, message: 'Feeling unsafe near Shewrapara. Need assistance.', status: 'ACKNOWLEDGED', resolvedBy: adminUser.id },
  });

  // =====================
  // LOST & FOUND
  // =====================
  await prisma.lostFound.createMany({
    data: [
      { userId: passengerUser.id, type: 'LOST', title: 'Black Leather Wallet', description: 'Lost my wallet containing NID card and cash on bus DHA-01-1234 near Farmgate.', location: 'Farmgate Bus Stop', date: new Date(Date.now() - 86400000), status: 'OPEN' },
      { userId: passengerUser2.id, type: 'FOUND', title: 'Blue Umbrella', description: 'Found a blue folding umbrella on bus DHA-03-9012 on route to Gulshan.', location: 'Gulshan 1 Bus Stop', date: new Date(Date.now() - 3600000), status: 'OPEN' },
      { userId: passengerUser3.id, type: 'LOST', title: 'Samsung Galaxy Phone', description: 'Lost a Samsung Galaxy A54 with a red case on the Uttara-Motijheel route.', location: 'Banani Bus Stop', date: new Date(Date.now() - 172800000), status: 'MATCHED' },
    ],
  });

  // =====================
  // NOTIFICATIONS
  // =====================
  await prisma.notification.createMany({
    data: [
      { userId: passengerUser.id, title: 'Welcome to BusMate BD!', message: 'Find buses, track them live, and travel smarter across Dhaka.', type: 'SYSTEM' },
      { userId: passengerUser.id, title: 'SOS Alert Acknowledged', message: 'Your emergency alert has been acknowledged by our team.', type: 'SOS' },
      { userId: passengerUser.id, title: 'Route Update: Mirpur–Farmgate', message: 'Heavy traffic near Shewrapara. Expect 10 min delay.', type: 'ROUTE_UPDATE' },
      { userId: passengerUser2.id, title: 'Welcome to BusMate BD!', message: 'Find buses, track them live, and travel smarter across Dhaka.', type: 'SYSTEM' },
      { userId: adminUser.id, title: 'New SOS Alert', message: 'Emergency reported near Shewrapara. Please review.', type: 'SOS' },
      { userId: driverUser1.id, title: 'Route Assignment', message: 'You have been assigned to route: Mirpur–Farmgate Express.', type: 'BUS_UPDATE' },
    ],
  });

  // =====================
  // SYSTEM SETTINGS
  // =====================
  await prisma.systemSetting.createMany({
    data: [
      { key: 'platform_name', value: 'BusMate BD' },
      { key: 'fare_per_km', value: '2.5' },
      { key: 'min_fare', value: '10' },
      { key: 'crowd_report_interval_min', value: '5' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'announcement', value: 'Welcome to BusMate BD – Navigate Dhaka Smarter!' },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin:     admin@busmatebd.demo     / Demo@2024!');
  console.log('  Operator:  operator@busmatebd.demo  / Demo@2024!');
  console.log('  Driver:    driver@busmatebd.demo    / Demo@2024!');
  console.log('  Passenger: passenger@busmatebd.demo / Demo@2024!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
