/**
 * GET /api/content/all
 * 
 * Fetch all portfolio content types in a single request.
 * This endpoint is optimized for server-side rendering and ISR.
 * 
 * Returns:
 * {
 *   profile: Profile | null,
 *   techStack: TechStackItem[],
 *   journey: JourneyItem[],
 *   projects: Project[],
 *   achievements: Achievement[],
 *   contactInfo: ContactInfo | null
 * }
 * 
 * Public read access - no authentication required
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch all content types in parallel
    const [
      { data: profileData, error: profileError },
      { data: techStackData, error: techStackError },
      { data: journeyData, error: journeyError },
      { data: projectsData, error: projectsError },
      { data: achievementsData, error: achievementsError },
      { data: contactInfoData, error: contactInfoError }
    ] = await Promise.all([
      supabase.from('profiles').select('*').limit(1),
      supabase.from('tech_stack').select('*').order('display_order', { ascending: true }),
      supabase.from('journey_items').select('*').order('display_order', { ascending: true }),
      supabase.from('projects').select('*').order('display_order', { ascending: true }),
      supabase.from('achievements').select('*').order('display_order', { ascending: true }),
      supabase.from('contact_info').select('*').limit(1)
    ]);

    // Check for errors
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    if (techStackError) {
      console.error('Error fetching tech stack:', techStackError);
      return NextResponse.json(
        { error: 'Failed to fetch tech stack data' },
        { status: 500 }
      );
    }

    if (journeyError) {
      console.error('Error fetching journey items:', journeyError);
      return NextResponse.json(
        { error: 'Failed to fetch journey data' },
        { status: 500 }
      );
    }

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects data' },
        { status: 500 }
      );
    }

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return NextResponse.json(
        { error: 'Failed to fetch achievements data' },
        { status: 500 }
      );
    }

    if (contactInfoError) {
      console.error('Error fetching contact info:', contactInfoError);
      return NextResponse.json(
        { error: 'Failed to fetch contact info data' },
        { status: 500 }
      );
    }

    // Map snake_case to camelCase
    const transformedProfile = profileData?.[0] ? {
      id: profileData[0].id,
      name: profileData[0].name,
      role: profileData[0].role,
      tagline: profileData[0].tagline,
      heroImageUrl: profileData[0].hero_image_url,
      resumeUrl: profileData[0].resume_url,
      createdAt: profileData[0].created_at,
      updatedAt: profileData[0].updated_at,
    } : null;

    const transformedTechStack = (techStackData || []).map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon_url,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const transformedJourney = (journeyData || []).map(item => ({
      id: item.id,
      year: item.year,
      title: item.title,
      description: item.description,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const transformedProjects = (projectsData || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.image_url,
      technologies: item.technologies,
      githubLink: item.github_link,
      liveLink: item.live_link,
      demoLink: item.demo_link,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const transformedAchievements = (achievementsData || []).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      issuer: item.issuer,
      year: item.year,
      pdfUrl: item.pdf_url,
      externalLink: item.external_link,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const transformedContactInfo = contactInfoData?.[0] ? {
      id: contactInfoData[0].id,
      githubUrl: contactInfoData[0].github_url,
      linkedinUrl: contactInfoData[0].linkedin_url,
      instagramUrl: contactInfoData[0].instagram_url,
      telegramUrl: contactInfoData[0].telegram_url,
      email: contactInfoData[0].email,
      createdAt: contactInfoData[0].created_at,
      updatedAt: contactInfoData[0].updated_at,
    } : null;

    // Return all content types
    return NextResponse.json({
      data: {
        profile: transformedProfile,
        techStack: transformedTechStack,
        journey: transformedJourney,
        projects: transformedProjects,
        achievements: transformedAchievements,
        contactInfo: transformedContactInfo
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/content/all:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
