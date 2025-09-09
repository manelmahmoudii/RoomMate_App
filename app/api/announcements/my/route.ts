import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const userSession = await getUserSession(request);

    if (!userSession || !userSession.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userSession.id;
    connection = await getConnection();

    const [announcements] = await connection.query(
      `SELECT 
         a.*,
         u.first_name,
         u.last_name,
         u.university,
         u.avatar_url
       FROM announcements a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching my announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
