import mongoose, { Document, Schema } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IUser extends Document {
  name: string;
  email: string;
  avatarUrl: string;
  isAdmin: boolean;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comments: mongoose.Types.ObjectId[];
  issues: mongoose.Types.ObjectId[];
  projects: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      maxlength: 200,
      unique: true,
      // You can add custom validation for email if needed
    },
    isAdmin: {
      type: Boolean,
      default: false,
      // You can add custom validation for email if needed
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      maxlength: 2000,
    },
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    issues: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Issue',
      },
    ],
    projects: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Project',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
