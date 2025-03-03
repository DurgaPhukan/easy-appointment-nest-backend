const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding process...\n');

  // Seed Users
  console.log('🌱 Seeding Users...');
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        password: `password${i}`,
        role: i % 5 === 0 ? 'ADMIN' : i % 2 === 0 ? 'DOCTOR' : 'PATIENT',
      },
    });
    users.push(user);
    console.log(`✅ Created user with id: ${user.id}`);
  }
  console.log('🎉 Users seeded successfully!\n');

  // Seed Patients
  console.log('🌱 Seeding Patients...');
  const patients = [];
  for (let i = 0; i < 10; i++) {
    const patient = await prisma.patient.create({
      data: {
        userId: users[i].id,
        firstName: `PatientFirstName${i}`,
        lastName: `PatientLastName${i}`,
        dateOfBirth: new Date(1990, i % 12, i + 1),
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        phone: `123456789${i}`,
        address: `Patient Address ${i}`,
      },
    });
    patients.push(patient);
    console.log(`✅ Created patient with id: ${patient.id}`);
  }
  console.log('🎉 Patients seeded successfully!\n');

  // Seed Doctors
  console.log('🌱 Seeding Doctors...');
  const doctors = [];
  for (let i = 0; i < 10; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        userId: users[i].id,
        firstName: `DoctorFirstName${i}`,
        lastName: `DoctorLastName${i}`,
        specialization: `Specialization${i}`,
        qualification: `Qualification${i}`,
        experience: i + 5,
        phone: `987654321${i}`,
        bio: `Bio of Doctor ${i}`,
        consultationFee: 100.0 + i,
      },
    });
    doctors.push(doctor);
    console.log(`✅ Created doctor with id: ${doctor.id}`);
  }
  console.log('🎉 Doctors seeded successfully!\n');

  // Seed Organizations
  console.log('🌱 Seeding Organizations...');
  const organizations = [];
  for (let i = 0; i < 10; i++) {
    const organization = await prisma.organization.create({
      data: {
        name: `Organization ${i}`,
        address: `Organization Address ${i}`,
        phone: `111222333${i}`,
        email: `org${i}@example.com`,
        website: `https://org${i}.com`,
        description: `Description of Organization ${i}`,
      },
    });
    organizations.push(organization);
    console.log(`✅ Created organization with id: ${organization.id}`);
  }
  console.log('🎉 Organizations seeded successfully!\n');

  // Seed Organization Admins
  console.log('🌱 Seeding Organization Admins...');
  const organizationAdmins = [];
  for (let i = 0; i < 10; i++) {
    const orgAdmin = await prisma.organizationAdmin.create({
      data: {
        userId: users[i].id,
        organizationId: organizations[i].id,
        firstName: `OrgAdminFirstName${i}`,
        lastName: `OrgAdminLastName${i}`,
        phone: `555666777${i}`,
      },
    });
    organizationAdmins.push(orgAdmin);
    console.log(`✅ Created organization admin with id: ${orgAdmin.id}`);
  }
  console.log('🎉 Organization Admins seeded successfully!\n');

  // Seed Doctor Organizations
  console.log('🌱 Seeding Doctor Organizations...');
  const doctorOrganizations = [];
  for (let i = 0; i < 10; i++) {
    const doctorOrg = await prisma.doctorOrganization.create({
      data: {
        doctorId: doctors[i].id,
        organizationId: organizations[i].id,
        isActive: true,
      },
    });
    doctorOrganizations.push(doctorOrg);
    console.log(`✅ Created doctor organization with id: ${doctorOrg.id}`);
  }
  console.log('🎉 Doctor Organizations seeded successfully!\n');

  // Seed Diseases
  console.log('🌱 Seeding Diseases...');
  const diseases = [];
  for (let i = 0; i < 10; i++) {
    const disease = await prisma.disease.create({
      data: {
        name: `Disease ${i}`,
        description: `Description of Disease ${i}`,
        symptoms: `Symptoms of Disease ${i}`,
      },
    });
    diseases.push(disease);
    console.log(`✅ Created disease with id: ${disease.id}`);
  }
  console.log('🎉 Diseases seeded successfully!\n');

  // Seed Appointments
  console.log('🌱 Seeding Appointments...');
  const appointments = [];
  for (let i = 0; i < 10; i++) {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patients[i].id,
        doctorId: doctors[i].id,
        appointmentDate: new Date(2023, i % 12, i + 1),
        startTime: '10:00',
        endTime: '11:00',
        status: 'REQUESTED',
        reason: `Reason for appointment ${i}`,
      },
    });
    appointments.push(appointment);
    console.log(`✅ Created appointment with id: ${appointment.id}`);
  }
  console.log('🎉 Appointments seeded successfully!\n');

  // Seed Treatments
  console.log('🌱 Seeding Treatments...');
  const treatments = [];
  for (let i = 0; i < 10; i++) {
    const treatment = await prisma.treatment.create({
      data: {
        patientId: patients[i].id,
        doctorId: doctors[i].id,
        appointmentId: appointments[i].id,
        diseaseId: diseases[i].id,
        diagnosis: `Diagnosis for treatment ${i}`,
        prescription: `Prescription for treatment ${i}`,
      },
    });
    treatments.push(treatment);
    console.log(`✅ Created treatment with id: ${treatment.id}`);
  }
  console.log('🎉 Treatments seeded successfully!\n');

  // Seed Notifications
  console.log('🌱 Seeding Notifications...');
  for (let i = 0; i < 10; i++) {
    await prisma.notification.create({
      data: {
        userId: users[i].id,
        type: 'APPOINTMENT_REMINDER',
        title: `Notification ${i}`,
        message: `This is a notification message ${i}`,
      },
    });
    console.log(`✅ Created notification for user with id: ${users[i].id}`);
  }
  console.log('🎉 Notifications seeded successfully!\n');

  console.log('✨ Database seeding completed successfully! ✨');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });