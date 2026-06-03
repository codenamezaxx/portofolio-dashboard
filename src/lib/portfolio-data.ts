/**
 * Portfolio Data Fetching Utilities
 * Server-side functions for fetching portfolio content from Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { queryCache, cacheKeys } from './query-cache';

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
  status_label?: string;
  hero_image_url?: string;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TechStackItem {
  id?: string;
  name: string;
  icon: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
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
  const cacheKey = cacheKeys.profile();
  const cached = queryCache.get<Profile | null>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

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

    const result = (data && data.length > 0 ? data[0] : null) as Profile | null;
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Fetch all tech stack items
 */
export async function getTechStack(): Promise<TechStackItem[]> {
  const cacheKey = cacheKeys.techStack();
  const cached = queryCache.get<TechStackItem[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching tech stack:', error);
      return [];
    }

    const result = (data as TechStackItem[]) || [];
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return [];
  }
}

/**
 * Fetch all journey items
 */
export async function getJourneyItems(): Promise<JourneyItem[]> {
  const cacheKey = cacheKeys.journeyItems();
  const cached = queryCache.get<JourneyItem[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('journey_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching journey items:', error);
      return [];
    }

    const result = (data as JourneyItem[]) || [];
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching journey items:', error);
    return [];
  }
}

/**
 * Fetch all projects
 */
export async function getProjects(): Promise<Project[]> {
  const cacheKey = cacheKeys.projects();
  const cached = queryCache.get<Project[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true});

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    const result = (data as Project[]) || [];
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Fetch a single project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const cacheKey = cacheKeys.projectById(id);
  const cached = queryCache.get<Project | null>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

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

    const result = data as Project;
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

/**
 * Fetch projects by category
 */
export async function getProjectsByCategory(category: string): Promise<Project[]> {
  const cacheKey = cacheKeys.projectsByCategory(category);
  const cached = queryCache.get<Project[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

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

    const result = (data as Project[]) || [];
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    return [];
  }
}

/**
 * Fetch all achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  const cacheKey = cacheKeys.achievements();
  const cached = queryCache.get<Achievement[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    const result = (data as Achievement[]) || [];
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

/**
 * Fetch achievements by category
 */
export async function getAchievementsByCategory(category: string): Promise<Achievement[]> {
  const cacheKey = cacheKeys.achievementsByCategory(category);
  const cached = queryCache.get<Achievement[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

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

    const result = (data as Achievement[]) || [];
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching achievements by category:', error);
    return [];
  }
}

/**
 * Fetch contact information
 */
export async function getContactInfo(): Promise<ContactInfo | null> {
  const cacheKey = cacheKeys.contactInfo();
  const cached = queryCache.get<ContactInfo | null>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

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

    const result = (data && data.length > 0 ? data[0] : null) as ContactInfo | null;
    queryCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return null;
  }
}

/**
 * Get all portfolio data at once
 * Uses caching for individual queries via the underlying fetch functions
 */
export async function getAllPortfolioData(): Promise<{
  profile: Profile | null;
  techStack: TechStackItem[];
  journey: JourneyItem[];
  projects: Project[];
  achievements: Achievement[];
  contactInfo: ContactInfo | null;
}> {
  const cacheKey = cacheKeys.allPortfolioData();
  const cached = queryCache.get<Awaited<ReturnType<typeof getAllPortfolioData>>>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const [profile, techStack, journey, projects, achievements, contactInfo] = await Promise.all([
      getProfile(),
      getTechStack(),
      getJourneyItems(),
      getProjects(),
      getAchievements(),
      getContactInfo()
    ]);

    const result = {
      profile,
      techStack,
      journey,
      projects,
      achievements,
      contactInfo
    };
    
    queryCache.set(cacheKey, result);
    return result;
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
