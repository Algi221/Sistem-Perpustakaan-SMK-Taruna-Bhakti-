import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    // Next.js 15+ params adalah Promise, harus di-await
    const { path: pathSegments } = await params;
    
    // Gabungkan path segments
    const filePathRelative = pathSegments.join('/');
    
    // Build full path ke public folder
    const filePath = path.join(process.cwd(), 'public', filePathRelative);
    
    // Security check: pastikan file ada di public folder
    const publicPath = path.join(process.cwd(), 'public');
    const resolvedPath = path.resolve(filePath);
    const resolvedPublic = path.resolve(publicPath);
    
    if (!resolvedPath.startsWith(resolvedPublic)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Get file extension untuk determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Return file dengan proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

