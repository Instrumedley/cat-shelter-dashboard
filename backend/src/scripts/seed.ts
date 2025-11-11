import { db } from '../db/connection';
import { users, cats, adoptions, medicalProcedures, donations, fundraisingCampaigns } from '../db/schema';
import bcrypt from 'bcryptjs';

const catNames = [
  'Whiskers', 'Luna', 'Simba', 'Bella', 'Max', 'Chloe', 'Oliver', 'Mia', 'Charlie', 'Sophie',
  'Jack', 'Lily', 'Oscar', 'Grace', 'Leo', 'Emma', 'Milo', 'Ava', 'Felix', 'Zoe',
  'Tiger', 'Ruby', 'Smokey', 'Pearl', 'Shadow', 'Daisy', 'Midnight', 'Rose', 'Storm', 'Ivy',
  'Coco', 'Jasmine', 'Pepper', 'Violet', 'Ginger', 'Luna', 'Cinnamon', 'Hazel', 'Chestnut', 'Amber'
];

const catBreeds = [
  'Persian', 'Maine Coon', 'Siamese', 'British Shorthair', 'Ragdoll', 'American Shorthair',
  'Scottish Fold', 'Sphynx', 'Abyssinian', 'Bengal', 'Russian Blue', 'Birman', 'Oriental',
  'Devon Rex', 'Cornish Rex', 'Manx', 'Himalayan', 'Burmese', 'Tonkinese', 'Mixed'
];

const catColors = [
  'Black', 'White', 'Orange', 'Gray', 'Brown', 'Calico', 'Tortoiseshell', 'Tabby',
  'Siamese', 'Tuxedo', 'Ginger', 'Cream', 'Silver', 'Blue', 'Chocolate'
];

const adopterNames = [
  'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown', 'Lisa Anderson',
  'Chris Taylor', 'Jennifer Martinez', 'Robert Garcia', 'Amanda Rodriguez', 'James Lee',
  'Michelle White', 'Daniel Harris', 'Ashley Clark', 'Matthew Lewis', 'Jessica Walker',
  'Andrew Hall', 'Stephanie Young', 'Joshua King', 'Nicole Wright', 'Kevin Lopez',
  'Rachel Hill', 'Brandon Scott', 'Samantha Green', 'Tyler Adams', 'Lauren Baker'
];

const adopterEmails = [
  'john.smith@email.com', 'sarah.johnson@email.com', 'mike.davis@email.com', 'emily.wilson@email.com',
  'david.brown@email.com', 'lisa.anderson@email.com', 'chris.taylor@email.com', 'jennifer.martinez@email.com',
  'robert.garcia@email.com', 'amanda.rodriguez@email.com', 'james.lee@email.com', 'michelle.white@email.com',
  'daniel.harris@email.com', 'ashley.clark@email.com', 'matthew.lewis@email.com', 'jessica.walker@email.com',
  'andrew.hall@email.com', 'stephanie.young@email.com', 'joshua.king@email.com', 'nicole.wright@email.com',
  'kevin.lopez@email.com', 'rachel.hill@email.com', 'brandon.scott@email.com', 'samantha.green@email.com',
  'tyler.adams@email.com', 'lauren.baker@email.com'
];

const adopterPhones = [
  '+46123456789', '+46987654321', '+46555555555', '+46111111111', '+46222222222',
  '+46333333333', '+46444444444', '+46555555556', '+46666666666', '+46777777777',
  '+46888888888', '+46999999999', '+46123456788', '+46987654320', '+46555555554',
  '+46111111110', '+46222222221', '+46333333332', '+46444444443', '+46555555557',
  '+46666666667', '+46777777778', '+46888888889', '+46999999998', '+46123456787',
  '+46987654319'
];

const donorNames = [
  'Anonymous', 'Pet Lovers Foundation', 'Cat Rescue Society', 'Animal Welfare Group',
  'Feline Friends', 'Paws & Claws Charity', 'Meow Foundation', 'Purrfect Donors',
  'Whiskers Fund', 'Furry Friends Support', 'Cat Care Alliance', 'Adoption Angels'
];

const veterinarianNames = [
  'Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Rodriguez', 'Dr. David Kim',
  'Dr. Lisa Thompson', 'Dr. Robert Wilson', 'Dr. Jennifer Davis', 'Dr. Christopher Brown'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomAgeGroup(age: number): 'kitten' | 'adult' | 'senior' {
  if (age <= 1) return 'kitten';
  if (age <= 7) return 'adult';
  return 'senior';
}

function getRandomGender(): 'male' | 'female' {
  return Math.random() > 0.5 ? 'male' : 'female';
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create users
    console.log('Creating users...');
    const hashedAdminPassword = await bcrypt.hash('admin', 12);
    const hashedStaffPassword = await bcrypt.hash('staff', 12);

    await db.insert(users).values([
      {
        name: 'System Administrator',
        username: 'admin',
        password: hashedAdminPassword,
        email: 'admin@catshelter.se',
        phone: '+46123456789',
        role: 'super_admin'
      },
      {
        name: 'Clinic Staff Member',
        username: 'staff',
        password: hashedStaffPassword,
        email: 'staff@catshelter.se',
        phone: '+46987654321',
        role: 'clinic_staff'
      }
    ]);

    // Create additional adopter users
    console.log('Creating adopter users...');
    const adopterUsers = [];
    for (let i = 0; i < 20; i++) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      adopterUsers.push({
        name: adopterNames[i],
        username: `adopter${i + 1}`,
        password: hashedPassword,
        email: adopterEmails[i],
        phone: adopterPhones[i],
        role: 'public' as const
      });
    }
    
    const insertedAdopterUsers = await db.insert(users).values(adopterUsers).returning();

    // 2. Create cats (1000+ cats over 2 years)
    console.log('Creating cats...');
    const catsData = [];
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    for (let i = 0; i < 1000; i++) {
      const age = Math.floor(Math.random() * 15) + 1; // 1-15 years
      const entryDate = getRandomDate(twoYearsAgo, new Date());
      const entryType = getRandomElement(['rescue', 'surrender', 'stray'] as const);
      const status = getRandomElement(['available', 'booked', 'adopted', 'deceased'] as const);
      const isAdopted = status === 'adopted';
      const isBooked = status === 'booked';
      
      catsData.push({
        name: getRandomElement(catNames) + (i > 0 ? ` ${i}` : ''),
        age,
        ageGroup: getRandomAgeGroup(age),
        gender: getRandomGender(),
        breed: getRandomElement(catBreeds),
        color: getRandomElement(catColors),
        status,
        description: `A lovely ${getRandomElement(catColors).toLowerCase()} ${getRandomElement(catBreeds).toLowerCase()} cat.`,
        entryDate,
        entryType,
        isNeuteredOrSpayed: Math.random() > 0.3,
        isBooked,
        isAdopted,
        medicalNotes: Math.random() > 0.7 ? 'Requires special care' : null
      });
    }

    const insertedCats = await db.insert(cats).values(catsData).returning();

    // 3. Create adoptions
    console.log('Creating adoptions...');
    const adoptionsData = [];
    const adoptedCats = insertedCats.filter(cat => cat.status === 'adopted');
    
    for (let i = 0; i < Math.min(300, adoptedCats.length); i++) {
      const cat = adoptedCats[i];
      const adoptionDate = getRandomDate(cat.entryDate, new Date());
      const adopterUser = getRandomElement(insertedAdopterUsers);
      
      // Sometimes cats are adopted together
      const adoptedWith = Math.random() > 0.8 ? getRandomElement(adoptedCats.filter(c => c.id !== cat.id))?.id : null;
      
      adoptionsData.push({
        catId: cat.id,
        userId: adopterUser.id,
        adoptedWith,
        status: 'completed' as const, // Since these are adopted cats
        adoptionDate,
        notes: Math.random() > 0.5 ? 'Great family, perfect match!' : null
      });
    }

    await db.insert(adoptions).values(adoptionsData);

    // 4. Create medical procedures
    console.log('Creating medical procedures...');
    const medicalProceduresData = [];
    
    for (let i = 0; i < 500; i++) {
      const randomCat = getRandomElement(insertedCats);
      const procedureDate = getRandomDate(randomCat.entryDate, new Date());
      
      medicalProceduresData.push({
        catId: randomCat.id,
        procedureType: getRandomElement(['neutered', 'spayed', 'vaccinated', 'dewormed'] as const),
        procedureDate,
        veterinarian: getRandomElement(veterinarianNames),
        notes: Math.random() > 0.6 ? 'Procedure completed successfully' : null,
        cost: (Math.random() * 2000 + 500).toFixed(2)
      });
    }

    await db.insert(medicalProcedures).values(medicalProceduresData);

    // 5. Create donations
    console.log('Creating donations...');
    const donationsData = [];
    
    for (let i = 0; i < 200; i++) {
      const donationDate = getRandomDate(twoYearsAgo, new Date());
      
      donationsData.push({
        donorName: Math.random() > 0.3 ? getRandomElement(donorNames) : null,
        donorEmail: Math.random() > 0.3 ? `donor${i}@example.com` : null,
        amount: (Math.random() * 5000 + 100).toFixed(2),
        currency: 'SEK',
        isAnonymous: Math.random() > 0.7,
        notes: Math.random() > 0.8 ? 'Thank you for your support!' : null,
        createdAt: donationDate
      });
    }

    await db.insert(donations).values(donationsData);

    // 6. Create fundraising campaigns
    console.log('Creating fundraising campaigns...');
    const campaignsData = [
      {
        title: 'Winter Care Fund 2024',
        description: 'Help us provide warm shelter and medical care for our cats this winter',
        targetAmount: '50000.00',
        currentAmount: '30000.00',
        currency: 'SEK',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      },
      {
        title: 'Medical Equipment Upgrade',
        description: 'New medical equipment for our veterinary clinic',
        targetAmount: '25000.00',
        currentAmount: '15000.00',
        currency: 'SEK',
        isActive: true,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31')
      }
    ];

    await db.insert(fundraisingCampaigns).values(campaignsData);

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Created:');
    console.log(`   - ${2 + insertedAdopterUsers.length} users (admin/admin, staff/staff, ${insertedAdopterUsers.length} adopters)`);
    console.log(`   - ${insertedCats.length} cats`);
    console.log(`   - ${adoptionsData.length} adoptions`);
    console.log(`   - ${medicalProceduresData.length} medical procedures`);
    console.log(`   - ${donationsData.length} donations`);
    console.log(`   - ${campaignsData.length} fundraising campaigns`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase().then(() => {
  console.log('🎉 Seeding process completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});
