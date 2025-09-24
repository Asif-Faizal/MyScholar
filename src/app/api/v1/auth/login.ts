import { NextResponse } from 'next/server';
import Database from '../models/Database';
import { AuthUtils } from '../utils/auth';

const db = Database.getInstance();

export async function POST(request: Request) {
  const body = await request.json() as { email: string; password: string };
  const { email, password } = body;
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }
  const valid = await AuthUtils.comparePassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  }
  // Return user info (without password)
  const { password_hash, ...userInfo } = user;
  return NextResponse.json({ success: true, user: userInfo });
}
