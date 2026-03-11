# Admin Panel Documentation

## Overview

The JobPortal Admin Panel is a comprehensive management system for controlling jobs, posts, users, and viewing analytics. It features an intuitive interface with a modern design that matches the main platform.

## Access & Authentication

### Accessing the Admin Panel
- Navigate to `http://localhost:3000/admin` (or your deployed domain)
- You must be logged in and have admin privileges
- Non-admin users will be redirected to the homepage

### Setting Up Your First Admin User

Since the panel requires manual setup, you need to grant admin access to a user:

1. **Option A: Direct Database Update**
   ```javascript
   // Use MongoDB shell or compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     {
       $set: {
         isAdmin: true,
         role: "superadmin",
         adminPermissions: {
           canManageJobs: true,
           canManagePosts: true,
           canManageUsers: true,
           canViewAnalytics: true
         }
       }
     }
   )
   ```

2. **Option B: Create a Seeding Script**
   - Add a script to populate initial admin users during deployment
   - Example:
   ```javascript
   // scripts/seed-admin.js
   const User = require('../lib/models/User');
   await User.updateOne(
     { email: process.env.ADMIN_EMAIL },
     { $set: { isAdmin: true, role: 'superadmin', ... } }
   );
   ```

## Admin Panel Sections

### 1. Dashboard
**Path:** `/admin`

The main dashboard displays:
- **Quick Stats Cards:**
  - Total Jobs
  - Active Jobs
  - Published Posts
  - Total Users

- **Job Overview:** Total views, applications, featured count
- **Post Overview:** Total views, likes, shares
- **Recent Activity:** Last 5 jobs and posts

**Auto-refreshes with real-time data**

### 2. Jobs Management
**Path:** `/admin/jobs`

Full CRUD operations for job postings:

#### Features:
- **Search & Filter:**
  - Search by job title or company name
  - Filter by status (Active/Inactive)
  - Pagination (10 items per page)

- **Create New Job:**
  - Click "Post New Job" button
  - Fill in comprehensive form:
    - Basic info (title, category, type, experience level)
    - Company details (name, website, logo, description)
    - Location & remote settings
    - Work arrangement & salary
    - Description, requirements, responsibilities, benefits
    - Required skills
    - Application URL & deadline
    - Feature option for homepage promotion
  - Save to database

- **Edit Job:**
  - Click edit icon on any job
  - Modify any field
  - Changes reflect immediately on website

- **Delete Job:**
  - Click trash icon
  - Confirm deletion
  - Job removed from database and website

#### Job Posting Structure:
```javascript
{
  title: "Senior Developer",
  company: { name, website, logo, description, size },
  location: { city, country, isRemote },
  description: "Full job description",
  requirements: ["req1", "req2"],
  responsibilities: ["resp1", "resp2"],
  benefits: ["benefit1", "benefit2"],
  skills: ["skill1", "skill2"],
  type: "full-time",
  experienceLevel: "senior",
  workArrangement: "remote",
  salary: { min, max, currency, period },
  category: "Technology",
  applyUrl: "https://...",
  isFeatured: false,
  isActive: true
}
```

### 3. Posts Management
**Path:** `/admin/posts`

Create and manage blog posts and content:

#### Features:
- **Search & Filter:**
  - Search by title or excerpt
  - Filter by status (Published/Draft/Archived)
  - Pagination support

- **Create New Post:**
  - Click "Create Post" button
  - Fill form:
    - Title & excerpt
    - Full content (supports markdown)
    - Category selection
    - Tags (comma-separated)
    - Featured image (URL + alt text)
    - SEO settings (title, description, keywords)
    - Publishing status

- **Edit Post:**
  - Modify content, images, SEO
  - Change publish status
  - Updates visible immediately

- **Delete Post:**
  - Confirm deletion
  - Post removed from website

#### Post Categories Available:
- Career Tips
- Industry News
- Interview Prep
- Resume Guide
- Success Stories
- Company Spotlight
- Other

### 4. Analytics Dashboard
**Path:** `/admin/analytics`

Comprehensive platform analytics:

#### Job Analytics:
- Total jobs count
- Active jobs count
- Total views on jobs
- Total applications received
- Breakdown by category (bar chart)
- Breakdown by job type (bar chart)

#### Post Analytics:
- Total posts count
- Published vs draft count
- Total views, likes, shares
- Breakdown by category

#### User Analytics:
- Total registered users
- Total admin/superadmin accounts

**All metrics auto-refresh on page load**

### 5. User Management
**Path:** `/admin/users`

Manage user accounts and admin roles:

#### Features:
- **View Users:**
  - Search by name or email
  - See join date
  - View current role

- **Edit User:**
  - Click edit icon
  - Change role:
    - User (default)
    - Admin (can manage content)
    - Superadmin (full access)

  - Grant permissions:
    - Can Manage Jobs
    - Can Manage Posts
    - Can Manage Users
    - Can View Analytics

#### User Roles:
- **User:** Regular user account (default)
- **Admin:** Can manage jobs and posts, view analytics (no user management)
- **Superadmin:** Full admin privileges including user role assignment

### 6. Settings
**Path:** `/admin/settings`

Configure platform-wide settings:

#### General Settings:
- Site name
- Site tagline
- Contact email
- Support email

#### Platform Settings:
- Maintenance mode toggle
- Job application approval requirement
- Auto-publish posts option

#### Danger Zone:
- Clear all cache
- (Add more destructive operations here)

## Design & UI

### Color Scheme
The admin panel uses the same color palette as the main site:
- **Primary:** Blue (#3b82f6)
- **Success:** Emerald (#10b981)
- **Warning:** Amber (#f59e0b)
- **Info:** Violet (#8b5cf6)
- **Danger:** Red (#ef4444)

### Responsive Design
- Full desktop layout with collapsible sidebar
- Mobile-optimized navigation
- Tablet-friendly tables and forms
- Touch-friendly buttons and controls

### Dark Mode Support
- Full dark mode support using next-themes
- Consistent across all sections
- Toggle in user menu

## API Endpoints

### Jobs API
- `GET /api/admin/jobs` - List all jobs with pagination
- `POST /api/admin/jobs` - Create new job
- `PUT /api/admin/jobs/[id]` - Update specific job
- `DELETE /api/admin/jobs/[id]` - Delete specific job

### Posts API
- `GET /api/admin/posts` - List all posts with pagination
- `POST /api/admin/posts` - Create new post
- `PUT /api/admin/posts/[id]` - Update specific post
- `DELETE /api/admin/posts/[id]` - Delete specific post

### Analytics API
- `GET /api/admin/analytics` - Get comprehensive analytics data

### Users API
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users` - Update user role and permissions

## Security Features

### Authentication
- NextAuth.js JWT-based authentication
- Session validation required
- Admin role verification on backend

### Authorization
- Role-based access control (RBAC)
- Permission-based feature access
- API endpoint authorization checks

### Data Protection
- Secure password hashing (bcryptjs, 12 salt rounds)
- HTTPS enforcement (in production)
- CORS protection

## Best Practices

### Job Posting
1. Always fill in required fields (title, company, description, URL)
2. Add accurate skill requirements for better job matching
3. Use featured option for priority jobs
4. Keep descriptions between 300-2000 characters
5. Set realistic salary ranges

### Post Creation
1. Write compelling titles and excerpts
2. Include proper SEO metadata
3. Add relevant tags for discoverability
4. Use featured images for visual appeal
5. Review before publishing

### User Management
1. Assign minimal necessary permissions
2. Use admin role for trusted moderators
3. Superadmin role only for key admins
4. Regularly audit user roles

### Analytics Review
1. Check analytics weekly
2. Monitor job performance
3. Track user engagement trends
4. Optimize based on data

## Troubleshooting

### Admin Access Denied
- Verify user has `isAdmin: true` in database
- Check `role` field is 'admin' or 'superadmin'
- Clear browser cache and re-login

### Changes Not Appearing
- Verify API response status (should be 2xx)
- Check browser console for errors
- Verify database connection
- Clear application cache

### Slow Dashboard Loading
- Check network tab for slow API calls
- Verify database indexes are created
- Consider adding pagination to large datasets
- Check server resources

## Future Enhancements

Potential additions to the admin panel:
- Bulk job operations (import/export)
- Email campaign management
- User messaging system
- Advanced scheduling for posts
- Report generation and export
- Webhook management for external integrations
- Admin activity logs
- Custom analytics reports

## Support

For issues or feature requests:
1. Check this documentation
2. Review API error messages
3. Check browser console for client errors
4. Review server logs for backend errors
5. Contact development team

---

**Last Updated:** 2024
**Version:** 1.0
**Admin Panel URL:** `/admin`
