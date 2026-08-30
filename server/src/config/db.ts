import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { NotebookModel } from '../models/Notebook';
import { ClipboardItemModel } from '../models/ClipboardItem';

export const seedDemoUser = async () => {
  try {
    const demoEmail = 'demo@clipvault.com';
    const demoUser = await UserModel.findOne({ email: demoEmail });
    if (!demoUser) {
      console.log('[SEED] Seeding demo user...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('demo1234', salt);

      const user = await UserModel.create({
        name: 'Demo Recruiter',
        email: demoEmail,
        passwordHash,
        themePreference: 'light',
        clipboardTogglePreference: true,
      });

      const defaultNotebook = await NotebookModel.create({
        userId: user.id,
        name: 'Primary Vault',
        description: 'Your primary notebook for saved clips',
        color: '#A88B73',
        icon: '🗄️',
        isDefault: true,
      });

      user.defaultNotebookId = defaultNotebook._id.toString();
      await user.save();

      // Create a few demo clipboard items so the dashboard is populated
      await ClipboardItemModel.create([
        {
          userId: user.id,
          notebookId: defaultNotebook._id.toString(),
          text: 'Welcome to ClipVault! This is a demo clipboard item.',
          source: 'System',
          characterCount: 52,
          wordCount: 9,
        },
        {
          userId: user.id,
          notebookId: defaultNotebook._id.toString(),
          text: 'Here is another item showing code: const hello = "world";',
          source: 'Web',
          characterCount: 56,
          wordCount: 9,
        }
      ]);
      console.log('[SEED] Demo user seeded successfully: demo@clipvault.com / password: demo1234');
    } else {
      console.log('[SEED] Demo user already exists');
    }
  } catch (error) {
    console.error('[SEED] Failed to seed demo user:', error);
  }
};

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/clipvault';
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoURI}`);
    await seedDemoUser();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

