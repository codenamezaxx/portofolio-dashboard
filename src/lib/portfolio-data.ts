/**
 * Portfolio Data Fetching Utilities
 * Server-side functions for fetching portfolio content from Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Use service role key on server-side to bypass RLS, fall back to anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Type definitions
export interface Profile {
  id?: string;
  name: string;
  role: string;
  tagline: string;
  hero_image_url?: string;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TechStackItem {
  id?: string;
  name: string;
  icon_url: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface JourneyItem {
  id?: string;
  year: string;
  title: string;
  description: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  technologies: string[];
  github_link?: string;
  live_link?: string;
  demo_link?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Achievement {
  id?: string;
  title: string;
  category: string;
  issuer: string;
  year: number;
  pdf_url: string;
  external_link?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContactInfo {
  id?: string;
  github_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  telegram_url?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch functions with error handling and caching

/**
 * Fetch profile data
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return (data && data.length > 0 ? data[0] : null) as Profile | null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Fetch all tech stack items
 */
export async function getTechStack(): Promise<TechStackItem[]> {
  try {
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching tech stack:', error);
      return [];
    }

    return (data as TechStackItem[]) || [];
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return [];
  }
}

/**
 * Fetch all journey items
 */
export async function getJourneyItems(): Promise<JourneyItem[]> {
  try {
    const { data, error } = await supabase
      .from('journey_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching journey items:', error);
      return [];
    }

    return (data as JourneyItem[]) || [];
  } catch (error) {
    console.error('Error fetching journey items:', error);
    return [];
  }
}

/**
 * Fetch all projects
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return (data as Project[]) || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Fetch a single project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return data as Project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

/**
 * Fetch projects by category
 */
export async function getProjectsByCategory(category: string): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('category', category)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects by category:', error);
      return [];
    }

    return (data as Project[]) || [];
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    return [];
  }
}

/**
 * Fetch all achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return (data as Achievement[]) || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

/**
 * Fetch achievements by category
 */
export async function getAchievementsByCategory(category: string): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching achievements by category:', error);
      return [];
    }

    return (data as Achievement[]) || [];
  } catch (error) {
    console.error('Error fetching achievements by category:', error);
    return [];
  }
}

/**
 * Fetch contact information
 */
export async function getContactInfo(): Promise<ContactInfo | null> {
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching contact info:', error);
      return null;
    }

    return (data && data.length > 0 ? data[0] : null) as ContactInfo | null;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return null;
  }
}

/**
 * Get all portfolio data at once
 */
export async function getAllPortfolioData() {
  try {
    const [profile, techStack, journey, projects, achievements, contactInfo] = await Promise.all([
      getProfile(),
      getTechStack(),
      getJourneyItems(),
      getProjects(),
      getAchievements(),
      getContactInfo()
    ]);

    return {
      profile,
      techStack,
      journey,
      projects,
      achievements,
      contactInfo
    };
  } catch (error) {
    console.error('Error fetching all portfolio data:', error);
    return {
      profile: null,
      techStack: [],
      journey: [],
      projects: [],
      achievements: [],
      contactInfo: null
    };
  }
}
