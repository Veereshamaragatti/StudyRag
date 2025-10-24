import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import config from '../config/env';
import { getDB } from '../db/mongo';
import { IUser } from '../db/models/User';

export const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile: Profile, done) => {
        try {
          const db = getDB();
          const usersCollection = db.collection<IUser>('users');

          // Check if user exists
          let user = await usersCollection.findOne({ googleId: profile.id });

          if (!user) {
            // Create new user
            const newUser: IUser = {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value || '',
              avatar: profile.photos?.[0]?.value || '',
              createdAt: new Date(),
            };

            const result = await usersCollection.insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const db = getDB();
      const usersCollection = db.collection('users');
      const { ObjectId } = require('mongodb');
      
      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
