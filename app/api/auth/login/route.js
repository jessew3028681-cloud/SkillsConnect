import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validate email and password present
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 2. SELECT user by email
    const users = await query(
      'SELECT user_id, full_name, email, phone, password_hash, role, region, district, profile_photo, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 3. Check is_active=1 (return 403 if suspended)
    if (user.is_active !== 1) {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended or deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // 4. bcrypt.compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 5. On success: signToken({user_id, email, role, full_name})
    const token = await signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });

    // 6. UPDATE users SET last_login=NOW() WHERE user_id=?
    await query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    // 7. Log to activity_logs: action='USER_LOGIN'
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address) VALUES (?, ?, ?, ?, ?)',
      [user.user_id, 'USER_LOGIN', 'users', user.user_id, ip]
    );

    // 8. Prepare user data to return (exclude password_hash)
    const { password_hash, ...safeUserData } = user;

    // 9. setAuthCookie on response, return user data
    const response = NextResponse.json({
      success: true,
      data: safeUserData
    });

    setAuthCookie(response, token);
    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected internal server error occurred during login' },
      { status: 500 }
    );
  }
}
