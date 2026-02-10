import 'dotenv/config';
import sequelize from '../config/database';
import { User, Property, Car } from '../models';

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const [owner] = await User.findOrCreate({
      where: { email: 'demo@globalix.com' },
      defaults: {
        name: 'Globalix Demo',
        password: 'Password123!',
        isEmailVerified: true,
      },
    });

    const properties = [
      {
        title: 'Skyline Penthouse',
        description: 'Luxury penthouse with panoramic skyline views.',
        location: 'Downtown, Toronto',
        latitude: 43.6532,
        longitude: -79.3832,
        price: 4500000,
        beds: 4,
        baths: 3,
        sqft: 3200,
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200',
        ],
        amenities: ['Rooftop Pool', 'Concierge', 'Gym'],
        type: 'Penthouses',
        status: 'Available',
      },
      {
        title: 'Modern Lake Villa',
        description: 'Private villa with lakefront access and spa.',
        location: 'Hamilton, ON',
        latitude: 43.2557,
        longitude: -79.8711,
        price: 2850000,
        beds: 5,
        baths: 4,
        sqft: 4500,
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
        ],
        amenities: ['Private Dock', 'Home Theatre', 'Wine Cellar'],
        type: 'Villas',
        status: 'Reserved',
      },
      {
        title: 'Glass House Estate',
        description: 'Signature estate with floor-to-ceiling glass.',
        location: 'Oakville, ON',
        latitude: 43.4675,
        longitude: -79.6877,
        price: 6200000,
        beds: 6,
        baths: 7,
        sqft: 8100,
        images: [
          'https://images.unsplash.com/photo-1600607687940-c52af084399b?q=80&w=1200',
        ],
        amenities: ['Infinity Pool', 'Smart Home', 'Private Cinema'],
        type: 'Estates',
        status: 'Available',
      },
    ];

    const cars = [
      {
        name: 'Lamborghini Urus',
        brand: 'Lamborghini',
        model: 'Urus',
        year: 2024,
        price: 260000,
        pricePerDay: 2200,
        specs: '650 HP, 4.0L V8 Bi-Turbo',
        images: [
          'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=1200',
        ],
        features: ['650 HP', '305 km/h', 'V8 Bi-Turbo'],
        category: 'Exotic SUV',
        availability: true,
      },
      {
        name: 'Rolls-Royce Ghost',
        brand: 'Rolls-Royce',
        model: 'Ghost',
        year: 2023,
        price: 390000,
        pricePerDay: 2800,
        specs: '563 HP, 6.75L V12',
        images: [
          'https://images.unsplash.com/photo-1631214503951-3751369ede00?q=80&w=1200',
        ],
        features: ['563 HP', '250 km/h', 'V12 Twin Turbo'],
        category: 'Executive',
        availability: true,
      },
      {
        name: 'McLaren 720S',
        brand: 'McLaren',
        model: '720S',
        year: 2023,
        price: 299000,
        pricePerDay: 2400,
        specs: '710 HP, 4.0L V8 Twin-Turbo',
        images: [
          'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200',
        ],
        features: ['710 HP', '341 km/h', 'V8 Twin-Turbo'],
        category: 'Supercars',
        availability: true,
      },
    ];

    for (const property of properties) {
      const exists = await Property.findOne({ where: { title: property.title } });
      if (!exists) {
        await Property.create({ ...property, ownerId: owner.id });
      }
    }

    for (const car of cars) {
      const exists = await Car.findOne({ where: { name: car.name } });
      if (!exists) {
        await Car.create({ ...car, ownerId: owner.id });
      }
    }

    console.log('✅ Seed data created successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seed();
