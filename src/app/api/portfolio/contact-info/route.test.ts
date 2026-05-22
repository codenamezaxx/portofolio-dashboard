/**
 * Tests for GET /api/portfolio/contact-info endpoint
 */

import { GET } from './route';
import { supabase } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock Supabase
jest.mock('@/lib/db', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('GET /api/portfolio/contact-info', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return contact info successfully', async () => {
    const mockContactInfo = {
      id: '1',
      github_url: 'https://github.com/example',
      linkedin_url: 'https://linkedin.com/in/example',
      instagram_url: 'https://instagram.com/example',
      telegram_url: 'https://t.me/example',
      email: 'example@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockContactInfo,
            error: null,
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/portfolio/contact-info');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockContactInfo);
  });

  it('should return 500 when database query fails', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/portfolio/contact-info');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch contact information');
  });

  it('should set proper caching headers for ISR', async () => {
    const mockContactInfo = {
      id: '1',
      github_url: 'https://github.com/example',
      linkedin_url: 'https://linkedin.com/in/example',
      instagram_url: 'https://instagram.com/example',
      telegram_url: 'https://t.me/example',
      email: 'example@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockContactInfo,
            error: null,
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/portfolio/contact-info');
    const response = await GET(request);

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('s-maxage=3600');
    expect(cacheControl).toContain('stale-while-revalidate=86400');
  });

  it('should include all contact info fields in response', async () => {
    const mockContactInfo = {
      id: '1',
      github_url: 'https://github.com/example',
      linkedin_url: 'https://linkedin.com/in/example',
      instagram_url: 'https://instagram.com/example',
      telegram_url: 'https://t.me/example',
      email: 'example@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockContactInfo,
            error: null,
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/portfolio/contact-info');
    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('github_url');
    expect(data.data).toHaveProperty('linkedin_url');
    expect(data.data).toHaveProperty('instagram_url');
    expect(data.data).toHaveProperty('telegram_url');
    expect(data.data).toHaveProperty('email');
  });

  it('should handle contact info with null values', async () => {
    const mockContactInfo = {
      id: '1',
      github_url: 'https://github.com/example',
      linkedin_url: null,
      instagram_url: null,
      telegram_url: null,
      email: 'example@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockContactInfo,
            error: null,
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/portfolio/contact-info');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.github_url).toBe('https://github.com/example');
    expect(data.data.linkedin_url).toBeNull();
    expect(data.data.email).toBe('example@example.com');
  });

  it('should handle unexpected errors gracefully', async () => {
    (supabase.from as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const request = new NextRequest('http://localhost:3000/api/portfolio/contact-info');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
