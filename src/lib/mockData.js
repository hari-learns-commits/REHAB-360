import { faker } from '@faker-js/faker';

export const generateMockPatients = (count = 5) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    created_at: faker.date.recent().toISOString(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 70 }),
    condition: faker.helpers.arrayElement(['ACL Tear', 'Rotator Cuff Tendinitis', 'Lower Back Strain', 'Ankle Sprain', 'Post-Op Knee Replacement']),
    status: faker.helpers.arrayElement(['Active', 'Recovering', 'Discharged']),
    progress: faker.number.int({ min: 10, max: 100 }),
    last_session_date: faker.date.recent({ days: 10 }).toISOString(),
    next_session_date: faker.date.soon({ days: 5 }).toISOString(),
  }));
};

export const generateMockExercises = (count = 3) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    title: faker.helpers.arrayElement(['Leg Raises', 'Hamstring Curls', 'Wall Sits', 'Shoulder Press', 'Plank']),
    description: faker.lorem.sentence(),
    reps: faker.number.int({ min: 5, max: 15 }),
    sets: faker.number.int({ min: 2, max: 4 }),
    completed: faker.datatype.boolean(),
  }));
};
