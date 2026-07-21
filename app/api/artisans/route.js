import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category_id = searchParams.get('category_id');
    const region = searchParams.get('region');
    const min_rating = searchParams.get('min_rating');
    const keyword = searchParams.get('keyword');
    const sort = searchParams.get('sort');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '9';

    // 1. Setup conditional filters
    const conditions = ['u.is_active = 1', 'ap.is_approved = 1'];
    const params = [];

    if (category_id) {
      const parsedCat = parseInt(category_id, 10);
      if (!isNaN(parsedCat)) {
        conditions.push('ap.category_id = ?');
        params.push(parsedCat);
      }
    }

    if (region && region.trim() !== '') {
      conditions.push('u.region = ?');
      params.push(region.trim());
    }

    if (min_rating) {
      const parsedMinRating = parseFloat(min_rating);
      if (!isNaN(parsedMinRating)) {
        conditions.push('ap.average_rating >= ?');
        params.push(parsedMinRating);
      }
    }

    if (keyword && keyword.trim() !== '') {
      const lk = `%${keyword.trim()}%`;
      conditions.push(
        '(u.full_name LIKE ? OR ap.bio LIKE ? OR c.category_name LIKE ? OR u.region LIKE ? OR u.district LIKE ? OR ap.service_areas LIKE ?)'
      );
      params.push(lk, lk, lk, lk, lk, lk);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // 2. Count total matches for pagination
    const countSql = `
      SELECT COUNT(*) as total 
      FROM users u
      INNER JOIN artisan_profiles ap ON u.user_id = ap.user_id
      INNER JOIN categories c ON ap.category_id = c.category_id
      ${whereClause}
    `;
    const countResults = await query(countSql, params);
    const total = countResults[0]?.total || 0;

    // 3. Setup pagination variables
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 9;
    const offset = (parsedPage - 1) * parsedLimit;
    const totalPages = Math.ceil(total / parsedLimit);

    // 4. Setup Sorting
    let orderBy = 'ap.average_rating DESC, ap.total_reviews DESC';
    if (sort === 'newest') {
      orderBy = 'ap.created_at DESC';
    } else if (sort === 'rating') {
      orderBy = 'ap.average_rating DESC';
    }

    // 5. Select items
    const querySql = `
      SELECT 
        u.user_id, u.full_name, u.email, u.phone, u.region, u.district, u.profile_photo,
        ap.profile_id, ap.category_id, ap.bio, ap.years_experience, ap.average_rating, ap.total_reviews, ap.profile_views, ap.is_approved, ap.is_featured, ap.service_areas, ap.created_at,
        c.category_name, c.icon_class
      FROM users u
      INNER JOIN artisan_profiles ap ON u.user_id = ap.user_id
      INNER JOIN categories c ON ap.category_id = c.category_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    // Execute query
    const artisans = await query(querySql, [...params, parsedLimit, offset]);

    // Format service coverage areas from string list into clean arrays for client frontend
    const formattedArtisans = artisans.map(artisan => {
      let areaArray = [];
      if (artisan.service_areas) {
        areaArray = artisan.service_areas.split(',').map(s => s.trim()).filter(Boolean);
      }
      return {
        ...artisan,
        service_areas: areaArray
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        artisans: formattedArtisans,
        total,
        page: parsedPage,
        totalPages,
        perPage: parsedLimit
      }
    });

  } catch (error) {
    console.error('List Artisans API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected internal server error occurred while retrieving artisans' },
      { status: 500 }
    );
  }
}
