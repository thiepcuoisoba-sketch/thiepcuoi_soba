'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./db');
const config = require('./config');

const normEmail = (e) => String(e || '').trim().toLowerCase().slice(0, 190);

async function findUserById(id) {
  return db.get('SELECT * FROM users WHERE id = ?', [id]);
}

async function createUser({ email, password, name, avatar = null, googleId = null, facebookId = null }) {
  const hash = password ? await bcrypt.hash(password, 11) : null;
  const role = config.adminEmail && normEmail(email) === config.adminEmail ? 'admin' : 'user';
  const res = await db.run(
    'INSERT INTO users (email, password_hash, name, avatar, google_id, facebook_id, role, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [normEmail(email), hash, String(name || '').slice(0, 120), avatar, googleId, facebookId, role, 'free', Date.now()]
  );
  return findUserById(res.insertId);
}

/** Đăng nhập mạng xã hội: tìm theo id mạng xã hội -> theo email -> tạo mới */
async function upsertSocial(provider, profile) {
  const col = provider === 'google' ? 'google_id' : 'facebook_id';
  const pid = String(profile.id);
  let user = await db.get(`SELECT * FROM users WHERE ${col} = ?`, [pid]);
  if (user) return user;
  const email = normEmail(profile.emails && profile.emails[0] && profile.emails[0].value);
  const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
  if (email) {
    user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (user) {
      await db.run(`UPDATE users SET ${col} = ?, avatar = COALESCE(avatar, ?) WHERE id = ?`, [pid, avatar, user.id]);
      return findUserById(user.id);
    }
  }
  return createUser({
    email: email || `${provider}-${pid}@users.soba.local`,
    name: profile.displayName || 'Khách SOBA',
    avatar,
    googleId: provider === 'google' ? pid : null,
    facebookId: provider === 'facebook' ? pid : null,
  });
}

function setupPassport() {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    findUserById(id).then((u) => done(null, u || false), done);
  });

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [normEmail(email)]);
        if (!user || !user.password_hash) return done(null, false, { message: 'Email hoặc mật khẩu không đúng.' });
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return done(null, false, { message: 'Email hoặc mật khẩu không đúng.' });
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    })
  );

  if (config.google.clientID && config.google.clientSecret) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    passport.use(
      new GoogleStrategy(
        { clientID: config.google.clientID, clientSecret: config.google.clientSecret, callbackURL: `${config.appUrl}/auth/google/callback` },
        (at, rt, profile, done) => upsertSocial('google', profile).then((u) => done(null, u), done)
      )
    );
  }

  if (config.facebook.clientID && config.facebook.clientSecret) {
    const FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(
      new FacebookStrategy(
        {
          clientID: config.facebook.clientID,
          clientSecret: config.facebook.clientSecret,
          callbackURL: `${config.appUrl}/auth/facebook/callback`,
          profileFields: ['id', 'displayName', 'emails', 'photos'],
        },
        (at, rt, profile, done) => upsertSocial('facebook', profile).then((u) => done(null, u), done)
      )
    );
  }
  return passport;
}

const socialEnabled = {
  google: Boolean(config.google.clientID && config.google.clientSecret),
  facebook: Boolean(config.facebook.clientID && config.facebook.clientSecret),
};

module.exports = { setupPassport, createUser, findUserById, normEmail, socialEnabled };
