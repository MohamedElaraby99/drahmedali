import mongoose from 'mongoose';
import dotenv from 'dotenv';
import instructorModel from '../models/instructor.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    const dbType = process.env.DB_TYPE || 'compass';
    let uri;
    
    switch (dbType) {
      case 'atlas':
        uri = process.env.MONGO_URI_ATLAS;
        break;
      case 'compass':
        uri = process.env.MONGO_URI_COMPASS || 'mongodb://localhost:27017/almongezztabase';
        break;
      case 'community':
        uri = process.env.MONGO_URI_COMMUNITY;
        break;
      default:
        throw new Error(`Unknown database type: ${dbType}`);
    }
    
    if (!uri) {
      throw new Error(`No URI found for database type: ${dbType}`);
    }
    
    await mongoose.connect(uri);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const createSampleInstructors = async () => {
  try {
    await connectDB();
    
    // Check if instructors already exist
    const existingInstructors = await instructorModel.find({});
    if (existingInstructors.length > 0) {
      console.log(`\n📊 Found ${existingInstructors.length} existing instructors. Skipping creation.`);
      existingInstructors.forEach((instructor, index) => {
        console.log(`${index + 1}. ${instructor.name} - ${instructor.specialization}`);
      });
      mongoose.connection.close();
      return;
    }
    
    const sampleInstructors = [
      {
        name: "أحمد محمد",
        email: "ahmed.mohamed@example.com",
        bio: "مدرس متميز في الرياضيات مع خبرة 10 سنوات في تدريس المناهج المصرية",
        specialization: "الرياضيات",
        experience: 10,
        education: "ماجستير في الرياضيات التطبيقية",
        socialLinks: {
          linkedin: "https://linkedin.com/in/ahmed-mohamed",
          twitter: "https://twitter.com/ahmed_math",
          website: "https://ahmed-math.com"
        },
        rating: 4.8,
        totalStudents: 150,
        isActive: true,
        featured: true
      },
      {
        name: "فاطمة علي",
        email: "fatima.ali@example.com",
        bio: "مدرسة متخصصة في اللغة العربية والأدب مع نهج تعليمي تفاعلي",
        specialization: "اللغة العربية",
        experience: 8,
        education: "دكتوراه في الأدب العربي",
        socialLinks: {
          linkedin: "https://linkedin.com/in/fatima-ali",
          website: "https://fatima-arabic.com"
        },
        rating: 4.9,
        totalStudents: 120,
        isActive: true,
        featured: true
      },
      {
        name: "محمد حسن",
        email: "mohamed.hassan@example.com",
        bio: "مدرس العلوم مع خبرة في تدريس الكيمياء والفيزياء",
        specialization: "العلوم",
        experience: 12,
        education: "ماجستير في الكيمياء",
        socialLinks: {
          linkedin: "https://linkedin.com/in/mohamed-hassan",
          twitter: "https://twitter.com/mohamed_science"
        },
        rating: 4.7,
        totalStudents: 200,
        isActive: true,
        featured: false
      },
      {
        name: "سارة أحمد",
        email: "sara.ahmed@example.com",
        bio: "مدرسة اللغة الإنجليزية مع شهادات دولية في التدريس",
        specialization: "اللغة الإنجليزية",
        experience: 6,
        education: "CELTA Certificate, TEFL",
        socialLinks: {
          linkedin: "https://linkedin.com/in/sara-ahmed",
          website: "https://sara-english.com"
        },
        rating: 4.6,
        totalStudents: 180,
        isActive: true,
        featured: false
      },
      {
        name: "علي محمود",
        email: "ali.mahmoud@example.com",
        bio: "مدرس التاريخ والجغرافيا مع نهج تعليمي قائم على القصص",
        specialization: "التاريخ والجغرافيا",
        experience: 15,
        education: "دكتوراه في التاريخ الإسلامي",
        socialLinks: {
          linkedin: "https://linkedin.com/in/ali-mahmoud",
          twitter: "https://twitter.com/ali_history"
        },
        rating: 4.5,
        totalStudents: 90,
        isActive: true,
        featured: false
      },
      {
        name: "نورا كريم",
        email: "nora.karim@example.com",
        bio: "مدرسة الحاسوب والبرمجة مع خبرة في تطوير المناهج الرقمية",
        specialization: "الحاسوب والبرمجة",
        experience: 7,
        education: "ماجستير في علوم الحاسوب",
        socialLinks: {
          linkedin: "https://linkedin.com/in/nora-karim",
          website: "https://nora-coding.com"
        },
        rating: 4.8,
        totalStudents: 160,
        isActive: true,
        featured: true
      }
    ];
    
    console.log('\n🚀 Creating sample instructors...');
    
    for (const instructorData of sampleInstructors) {
      const instructor = new instructorModel(instructorData);
      await instructor.save();
      console.log(`✅ Created: ${instructor.name} - ${instructor.specialization}`);
    }
    
    console.log(`\n🎉 Successfully created ${sampleInstructors.length} sample instructors!`);
    console.log('\n💡 You can now view instructors at: http://localhost:5173/instructors');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating sample instructors:', error);
    mongoose.connection.close();
  }
};

createSampleInstructors(); 