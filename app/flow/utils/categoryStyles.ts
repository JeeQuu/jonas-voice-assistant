import { Category, CategoryStyle } from '../types';

// Flat geometric patterns like the reference image
const patterns = {
  jobb: `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <!-- Large triangles -->
      <polygon points="0,0 100,100 0,200" fill="#FF6B4A" opacity="0.6"/>
      <polygon points="100,0 200,0 100,100" fill="#2C3E50" opacity="0.8"/>
      <polygon points="200,100 100,100 200,200" fill="#87CEEB" opacity="0.5"/>
      <!-- Small accents -->
      <polygon points="0,100 50,150 0,200" fill="#2C3E50" opacity="0.9"/>
      <rect x="150" y="150" width="50" height="50" fill="#FF6B4A" opacity="0.7"/>
    </svg>
  `,
  familj: `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <!-- Circles and blocks -->
      <circle cx="50" cy="50" r="40" fill="#87CEEB" opacity="0.7"/>
      <rect x="100" y="0" width="100" height="100" fill="#2C3E50" opacity="0.8"/>
      <polygon points="0,200 100,100 0,100" fill="#FF6B4A" opacity="0.6"/>
      <circle cx="150" cy="150" r="50" fill="#87CEEB" opacity="0.5"/>
      <rect x="0" y="150" width="50" height="50" fill="#2C3E50" opacity="0.9"/>
    </svg>
  `,
  hälsa: `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <!-- Geometric blocks -->
      <rect x="0" y="0" width="100" height="100" fill="#2C3E50" opacity="0.8"/>
      <rect x="100" y="100" width="100" height="100" fill="#2C3E50" opacity="0.8"/>
      <polygon points="100,0 200,100 100,100" fill="#87CEEB" opacity="0.6"/>
      <polygon points="0,100 100,200 0,200" fill="#FF6B4A" opacity="0.5"/>
      <!-- Cross pattern -->
      <rect x="80" y="0" width="40" height="200" fill="#87CEEB" opacity="0.3"/>
      <rect x="0" y="80" width="200" height="40" fill="#FF6B4A" opacity="0.3"/>
    </svg>
  `
};

const categoryStyles: Record<Category, CategoryStyle> = {
  jobb: {
    bg: 'bg-[#FF6B4A]', // Flat orange
    borderColor: 'border-[#2C3E50]',
    textColor: 'text-white',
    shadowColor: 'none',
    badgeBg: 'bg-[#2C3E50]',
    pattern: `data:image/svg+xml,${encodeURIComponent(patterns.jobb)}`
  },
  familj: {
    bg: 'bg-[#87CEEB]', // Flat light blue
    borderColor: 'border-[#2C3E50]',
    textColor: 'text-white',
    shadowColor: 'none',
    badgeBg: 'bg-[#2C3E50]',
    pattern: `data:image/svg+xml,${encodeURIComponent(patterns.familj)}`
  },
  hälsa: {
    bg: 'bg-[#2C3E50]', // Flat navy
    borderColor: 'border-[#87CEEB]',
    textColor: 'text-white',
    shadowColor: 'none',
    badgeBg: 'bg-[#87CEEB]',
    pattern: `data:image/svg+xml,${encodeURIComponent(patterns.hälsa)}`
  }
};

export function getCategoryStyle(category: Category): CategoryStyle {
  return categoryStyles[category] || categoryStyles.jobb;
}

export function getCategory(task: any): Category {
  // Smart categorization based on task content
  const content = (task.title + ' ' + (task.description || '')).toLowerCase();

  if (content.match(/liseberg|projekt|deadline|meeting|möte|klient|work/i)) {
    return 'jobb';
  }
  if (content.match(/familj|sonja|sigge|stella|karin|barn|kids|family/i)) {
    return 'familj';
  }
  if (content.match(/träning|löpning|hälsa|health|gym|yoga|walk/i)) {
    return 'hälsa';
  }

  return 'jobb'; // Default
}
