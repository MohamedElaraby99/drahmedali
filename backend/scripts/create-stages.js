import mongoose from 'mongoose';
import Stage from '../models/stage.model.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createStages = async () => {
  try {
    // Create sample stages
    const stages = [
      { name: 'الصف الأول الثانوي', status: 'active' },
      { name: 'الصف الثاني الثانوي', status: 'active' },
      { name: 'الصف الثالث الثانوي', status: 'active' },
      { name: 'الصف الأول الإعدادي', status: 'active' },
      { name: 'الصف الثاني الإعدادي', status: 'active' },
      { name: 'الصف الثالث الإعدادي', status: 'active' }
    ];

    const createdStages = [];
    for (const stageData of stages) {
      const existingStage = await Stage.findOne({ name: stageData.name });
      if (!existingStage) {
        const stage = new Stage(stageData);
        await stage.save();
        createdStages.push(stage);
        console.log(`Created stage: ${stage.name}`);
      } else {
        createdStages.push(existingStage);
        console.log(`Stage already exists: ${existingStage.name}`);
      }
    }

    return createdStages;
  } catch (error) {
    console.error('Error creating stages:', error);
    throw error;
  }
};

const updateUsersWithStages = async (stages) => {
  try {
    // Get all users with role USER
    const users = await User.find({ role: 'USER' });
    console.log(`Found ${users.length} users to update`);

    // Assign random stages to users
    for (let i = 0; i < users.length; i++) {
      const randomStageIndex = i % stages.length; // Distribute users across stages
      const user = users[i];
      
      if (!user.stage) {
        user.stage = stages[randomStageIndex]._id;
        await user.save();
        console.log(`Updated user ${user.fullName} with stage: ${stages[randomStageIndex].name}`);
      }
    }

    console.log('All users updated with stages');
  } catch (error) {
    console.error('Error updating users:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    
    console.log('Creating stages...');
    const stages = await createStages();
    
    console.log('Updating users with stages...');
    await updateUsersWithStages(stages);
    
    console.log('Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
};

main();
