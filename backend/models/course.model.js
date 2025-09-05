import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  videos: [
    {
      url: { type: String, required: true },
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      publishDate: { type: Date }
    }
  ],
  pdfs: [
    {
      url: { type: String, required: true },
      title: { type: String, default: '' },
      publishDate: { type: Date }
    }
  ],
  exams: [
    {
      title: { type: String, required: true },
      description: { type: String, default: '' },
      timeLimit: { type: Number, default: 30 }, // Time limit in minutes
      openDate: { type: Date },
      closeDate: { type: Date },
      questions: [
        {
          question: { type: String, required: true },
          options: [{ type: String, required: true }],
          correctAnswer: { type: Number, required: true },
          explanation: { type: String, default: '' },
          image: { type: String, default: '' },
          numberOfOptions: { type: Number, default: 4, min: 2, max: 4 }
        }
      ],
      userAttempts: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          takenAt: { type: Date, default: Date.now },
          score: { type: Number, required: true },
          totalQuestions: { type: Number, required: true },
          answers: [
            {
              questionIndex: { type: Number, required: true },
              selectedAnswer: { type: Number, required: true },
              isCorrect: { type: Boolean, required: true }
            }
          ]
        }
      ]
    }
  ],
  trainings: [
    {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      timeLimit: { type: Number, default: 30 }, // Time limit in minutes
      openDate: { type: Date },
      questions: [
        {
          question: { type: String, required: true },
          options: [{ type: String, required: true }],
          correctAnswer: { type: Number, required: true },
          explanation: { type: String, default: '' },
          image: { type: String, default: '' },
          numberOfOptions: { type: Number, default: 4, min: 2, max: 4 }
        }
      ],
      userAttempts: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          takenAt: { type: Date, default: Date.now },
          score: { type: Number, required: true },
          totalQuestions: { type: Number, required: true },
          answers: [
            {
              questionIndex: { type: Number, required: true },
              selectedAnswer: { type: Number, required: true },
              isCorrect: { type: Boolean, required: true }
            }
          ]
        }
      ]
    }
  ]
}, {
  timestamps: true
});

const unitSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  lessons: [lessonSchema]
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },

  image: {
    public_id: {
      type: String
    },
    secure_url: {
      type: String
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  units: [unitSchema],
  directLessons: [lessonSchema]
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);