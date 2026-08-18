import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

async function setupAdmin() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✓ Admin account already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@recruitment.local',
      password: 'admin@123',
      phone: '1234567890',
      role: 'admin',
    });

    console.log('✓ Admin account created successfully');
    console.log('Email: admin@recruitment.local');
    console.log('Password: admin@123');
    console.log('\nNote: Change these credentials after first login.');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error setting up admin:', error.message);
    process.exit(1);
  }
}

setupAdmin();
