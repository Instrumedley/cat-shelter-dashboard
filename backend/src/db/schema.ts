import { pgTable, serial, varchar, text, integer, timestamp, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'clinic_staff', 'public']);
export const catStatusEnum = pgEnum('cat_status', ['available', 'booked', 'adopted', 'deceased']);
export const catAgeGroupEnum = pgEnum('cat_age_group', ['kitten', 'adult', 'senior']);
export const catGenderEnum = pgEnum('cat_gender', ['male', 'female']);
export const adoptionStatusEnum = pgEnum('adoption_status', ['pending', 'approved', 'completed', 'cancelled']);
export const entryTypeEnum = pgEnum('entry_type', ['rescue', 'surrender', 'stray']);
export const medicalProcedureEnum = pgEnum('medical_procedure', ['neutered', 'spayed', 'vaccinated', 'dewormed']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  role: userRoleEnum('role').notNull().default('public'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cats table
export const cats = pgTable('cats', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  age: integer('age').notNull(),
  ageGroup: catAgeGroupEnum('age_group').notNull(),
  gender: catGenderEnum('gender').notNull(),
  breed: varchar('breed', { length: 100 }),
  color: varchar('color', { length: 50 }),
  status: catStatusEnum('status').notNull().default('available'),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  entryDate: timestamp('entry_date').notNull(),
  entryType: entryTypeEnum('entry_type').notNull(),
  isNeuteredOrSpayed: boolean('is_neutered_or_spayed').default(false),
  isBooked: boolean('is_booked').default(false),
  isAdopted: boolean('is_adopted').default(false),
  medicalNotes: text('medical_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Adoptions table
export const adoptions = pgTable('adoptions', {
  id: serial('id').primaryKey(),
  catId: integer('cat_id').notNull().references(() => cats.id),
  userId: integer('user_id').notNull().references(() => users.id),
  adoptedWith: integer('adopted_with').references(() => cats.id),
  status: adoptionStatusEnum('status').notNull().default('pending'),
  adoptionDate: timestamp('adoption_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Medical procedures table
export const medicalProcedures = pgTable('medical_procedures', {
  id: serial('id').primaryKey(),
  catId: integer('cat_id').notNull().references(() => cats.id),
  procedureType: medicalProcedureEnum('procedure_type').notNull(),
  procedureDate: timestamp('procedure_date').notNull(),
  veterinarian: varchar('veterinarian', { length: 100 }),
  notes: text('notes'),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Donations table
export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  donorName: varchar('donor_name', { length: 100 }),
  donorEmail: varchar('donor_email', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('SEK'),
  isAnonymous: boolean('is_anonymous').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Fundraising campaigns table
export const fundraisingCampaigns = pgTable('fundraising_campaigns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  targetAmount: decimal('target_amount', { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('SEK'),
  isActive: boolean('is_active').default(true),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  adoptions: many(adoptions),
}));

export const catsRelations = relations(cats, ({ many, one }) => ({
  adoptions: many(adoptions),
  medicalProcedures: many(medicalProcedures),
  adoptedWith: many(adoptions, {
    relationName: 'adoptedWithCats'
  }),
}));

export const adoptionsRelations = relations(adoptions, ({ one }) => ({
  cat: one(cats, {
    fields: [adoptions.catId],
    references: [cats.id],
  }),
  user: one(users, {
    fields: [adoptions.userId],
    references: [users.id],
  }),
  adoptedWithCat: one(cats, {
    fields: [adoptions.adoptedWith],
    references: [cats.id],
    relationName: 'adoptedWithCats'
  }),
}));

export const medicalProceduresRelations = relations(medicalProcedures, ({ one }) => ({
  cat: one(cats, {
    fields: [medicalProcedures.catId],
    references: [cats.id],
  }),
}));
