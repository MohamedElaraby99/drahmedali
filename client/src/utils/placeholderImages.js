// SVG Placeholder Images that work offline
export const placeholderImages = {
  // Blog image placeholder
  blog: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#4F46E5"/>
      <text x="200" y="100" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
        Blog Image
      </text>
    </svg>
  `)}`,

  // Course thumbnail placeholder
  course: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#4F46E5"/>
      <text x="200" y="150" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
        Course Thumbnail
      </text>
    </svg>
  `)}`,

  // User avatar placeholder
  avatar: `data:image/svg+xml;base64,${btoa(`
    <svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
      <rect width="250" height="250" fill="#4F46E5"/>
      <text x="125" y="125" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
        User Avatar
      </text>
    </svg>
  `)}`,

  // Small blog thumbnail placeholder
  blogSmall: `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#4F46E5"/>
      <text x="20" y="20" font-family="Arial, sans-serif" font-size="8" fill="white" text-anchor="middle" dominant-baseline="middle">
        Blog
      </text>
    </svg>
  `)}`,

  // Large blog image placeholder
  blogLarge: `data:image/svg+xml;base64,${btoa(`
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#4F46E5"/>
      <text x="400" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
        Blog Image
      </text>
    </svg>
  `)}`
}; 