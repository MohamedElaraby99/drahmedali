import mongoose from 'mongoose';
import Instructor from '../models/instructor.model.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/almongezz');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix instructor images
const fixInstructorImages = async () => {
  try {
    // Find instructors with empty profileImage
    const instructors = await Instructor.find({
      $or: [
        { 'profileImage.public_id': { $exists: false } },
        { 'profileImage.public_id': '' },
        { 'profileImage.secure_url': { $exists: false } },
        { 'profileImage.secure_url': '' }
      ]
    });

    console.log(`Found ${instructors.length} instructors with empty profile images`);

    if (instructors.length === 0) {
      console.log('No instructors need fixing');
      return;
    }

    // Update each instructor with default placeholder
    const defaultProfileImage = {
      public_id: 'placeholder',
      secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIEluc3RydWN0b3IgQXZhdGFyCiAgPC90ZXh0Pgo8L3N2Zz4K'
    };

    for (const instructor of instructors) {
      await Instructor.findByIdAndUpdate(instructor._id, {
        profileImage: defaultProfileImage
      });
      console.log(`Fixed instructor: ${instructor.name}`);
    }

    console.log('Successfully fixed all instructor profile images');
  } catch (error) {
    console.error('Error fixing instructor images:', error);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await fixInstructorImages();
  await mongoose.disconnect();
  console.log('Script completed');
  process.exit(0);
};

runScript(); 