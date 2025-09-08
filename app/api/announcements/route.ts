import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'

export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let query = `
      SELECT 
        a.*,
        u.first_name,
        u.last_name,
        u.university,
        u.avatar_url
      FROM announcements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.expires_at IS NULL OR a.expires_at > NOW()
    `;
    
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ' AND a.category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (a.title LIKE ? OR a.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [announcements] = await connection.execute(query, params);
    
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
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

export async function POST(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const body = await request.json();
    
    const { userId, title, content, category, location, price, contactInfo } = body;
    
    // Validation basique
    if (!userId || !title || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const query = `
      INSERT INTO announcements 
        (id, user_id, title, content, category, city, price, contact_info, created_at)
      VALUES 
        (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const contactInfoJson = JSON.stringify({
      email: contactInfo.email || '',
      phone: contactInfo.phone || ''
    });
    
    await connection.execute(query, [
      userId, title, content, category, location, price, contactInfoJson
    ]);
    
    return NextResponse.json({ message: 'Announcement created successfully' });
  } catch (error) {
    console.error('Error creating announcement:', error);
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