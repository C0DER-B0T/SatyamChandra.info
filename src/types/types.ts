// ============================================
// HOME SECTION
// ============================================
export interface SocialLink {
  name: string;
  iconType: 'builtin' | 'custom'; // Type of icon
  icon?: string; // Built-in icon name (e.g., 'Github', 'Linkedin')
  iconUrl?: string; // Custom icon URL
  url: string; // Link URL
}

export interface HomeData {
  id: string;
  displayName: string;
  profilePicture: string; // Cloudinary URL - NEW
  description: string; // Main description/tagline
  roles: string[]; // Array of taglines/roles
  resumeLink: string;
  socialLinks: SocialLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeFormData {
  displayName: string;
  profilePicture: string; // NEW
  description: string;
  roles: string[];
  resumeLink: string;
  socialLinks: SocialLink[];
}

// ============================================
// ABOUT SECTION
// ============================================
export interface AboutData {
  id: string;
  profilePicture: string; // Cloudinary URL
  tagline: string;
  shortBio: string;
  fullBio: string;
  currentFocus: string;
  mission: string;
  currentExp: number; // Current EXP points
  maxExp: number; // Max EXP for current level (e.g., 100)
  level: number; // Current level
  createdAt: Date;
  updatedAt: Date;
}

export interface AboutFormData {
  profilePicture: string;
  tagline: string;
  shortBio: string;
  fullBio: string;
  currentFocus: string;
  mission: string;
  currentExp: number;
  maxExp: number;
  level: number;
}

// ============================================
// SKILLS SECTION
// ============================================
export interface Skill {
  name: string;
  confidence: number; // 0-100 percentage
}

export interface SkillCategory {
  id: string;
  category: string; // Fixed category name
  skills: Skill[]; // Array of skills with confidence levels
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillCategoryFormData {
  category: string;
  skills: Skill[];
}

// Fixed skill categories
export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Machine Learning',
  'Deep Learning',
  'Cloud & DevOps',
  'Databases',
  'Deployment',
  'Automation',
  'Soft Skills',
  'Tools & Others',
] as const;

// ============================================
// EDUCATION SECTION
// ============================================
export interface Education {
  id: string;
  instituteName: string;
  courseTitle: string;
  duration: string; // e.g., "2020 - 2024"
  description: string;
  keyAchievements: string[]; // Array of bullet points
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationFormData {
  instituteName: string;
  courseTitle: string;
  duration: string;
  description: string;
  keyAchievements: string[];
}

// ============================================
// EXPERIENCE SECTION
// ============================================
export interface Experience {
  id: string;
  jobRole: string;
  companyName: string;
  location: string;
  duration: string; // e.g., "Jan 2023 - Present"
  activityDescription: string;
  keyContributions: string[]; // Array of contributions
  technicalSkills: string[]; // Array of technical skills
  softSkills: string[]; // Array of soft skills
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceFormData {
  jobRole: string;
  companyName: string;
  location: string;
  duration: string;
  activityDescription: string;
  keyContributions: string[];
  technicalSkills: string[];
  softSkills: string[];
}

// ============================================
// PROJECTS SECTION
// ============================================
export interface Project {
  id: string;
  projectName: string;
  objective: string; // One-liner
  coverPhoto: string; // Cloudinary URL
  detailedDescription: string;
  techStack: string[]; // Array of technologies
  githubLink: string;
  liveDemoLink: string;
  date: string; // Format: "YYYY-MM" or "Month YYYY"
  level: 'Basic' | 'Medium' | 'Advanced';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFormData {
  projectName: string;
  objective: string;
  coverPhoto: string;
  detailedDescription: string;
  techStack: string[];
  githubLink: string;
  liveDemoLink: string;
  date: string;
  level: 'Basic' | 'Medium' | 'Advanced';
}

// ============================================
// CERTIFICATES SECTION
// ============================================
export interface Certificate {
  id: string;
  certificateName: string;
  issuingOrganization: string;
  description: string;
  skillsLearned: string[]; // Array of skills/technologies
  verificationLink: string;
  certificateImage: string; // Cloudinary URL
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateFormData {
  certificateName: string;
  issuingOrganization: string;
  description: string;
  skillsLearned: string[];
  verificationLink: string;
  certificateImage: string;
}

// ============================================
// LEGACY TYPES (for backward compatibility)
// ============================================
export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  profilePhoto: string;
  socialLinks: SocialLink[];
  resumeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
  profilePhoto: string;
  socialLinks: SocialLink[];
  resumeUrl: string;
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkExperienceFormData {
  role: string;
  company: string;
  period: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credential: string;
  description: string;
  skills: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificationFormData {
  title: string;
  issuer: string;
  date: string;
  credential: string;
  description: string;
  skills: string[];
}

export interface About {
  id: string;
  intro: string;
  features: AboutFeature[];
  mission: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AboutFeature {
  icon: string;
  title: string;
  description: string;
}
