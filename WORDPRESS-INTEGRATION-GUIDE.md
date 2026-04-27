# Sokogate Calculator - WordPress Integration Guide

## Overview
This guide provides comprehensive deployment strategies for integrating the Sokogate Construction Calculator (Node.js/Express app) into a WordPress page at `https://ultimotradingltd.co.ke/Calculate/`.

## Prerequisites
- WordPress installation at domain root
- Node.js hosting environment (cPanel with Passenger, or separate server)
- FTP/File Manager access to WordPress installation
- Administrator access to WordPress admin panel

## Configuration Updates Applied

### 1. Build Optimization
- Updated `BASE_PATH` in `app.js` from `/sokogate-calc` to `/Calculate`
- Configured Express routing to use `/Calculate/` as the application root

### 2. Routing Configuration
- Express routes configured with configurable `BASE_PATH` environment variable
- All internal navigation uses relative paths with base path prefix
- Form submissions and API endpoints properly prefixed

### 3. WordPress Integration Methods

#### Method A: Iframe Integration (Recommended)
**Best for:** Quick deployment, isolation, minimal WordPress modifications

1. **Deploy Node.js App:**
   ```bash
   # Upload app files to a subdirectory (e.g., via FTP)
   # Directory structure:
   # public_html/
   #   ├── wp-content/
   #   ├── wp-admin/
   #   ├── wp-includes/
   #   └── Calculate/  # ← Node.js app here
   #       ├── app.js
   #       ├── package.json
   #       ├── views/
   #       ├── public/
   #       └── .htaccess
   ```

2. **Configure .htaccess:**
   - Use the provided `.htaccess` file in the `/Calculate/` directory
   - For Passenger-enabled hosting: No additional configuration needed
   - For non-Passenger: Uncomment the proxy rewrite rule

3. **Create WordPress Page:**
   - Go to WordPress Admin → Pages → Add New
   - Title: "Calculate"
   - Permalink: `/Calculate/`
   - Content: Add HTML block with iframe:
   ```html
   <iframe
       src="/Calculate/"
       width="100%"
       height="800"
       frameborder="0"
       style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
       title="Sokogate Construction Calculator">
       <p>Your browser does not support iframes. <a href="/Calculate/" target="_blank">Open Calculator</a></p>
   </iframe>
   ```

**Pros:** Easy deployment, no WordPress core modifications, isolated environment
**Cons:** Iframe limitations (printing, full-screen), potential CORS issues

#### Method B: WordPress Shortcode Integration
**Best for:** Seamless integration, advanced customization

1. **Install Plugin:**
   - Upload `sokogate-calculator-wordpress-plugin.php` to `wp-content/plugins/`
   - Activate the plugin in WordPress Admin → Plugins

2. **Use Shortcode:**
   - Create/edit the Calculate page
   - Add shortcode: `[sokogate_calculator height="1000px"]`
   - Customize parameters: width, height, scrolling, frameborder

3. **Advanced Configuration:**
   - Modify the plugin to match your Node.js app URL
   - Adjust iframe styling and behavior
   - Add custom CSS/JS if needed

**Pros:** Native WordPress integration, customizable, SEO-friendly
**Cons:** Requires plugin installation, potential conflicts

#### Method C: Direct File Upload (Not Recommended)
**Note:** This method is not feasible for Node.js applications. Use iframe or shortcode methods instead.

### 4. Server-Side Configuration (.htaccess)

For iframe deployment, use this `.htaccess` in the `/Calculate/` directory:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /Calculate/

    # Allow direct access to actual files
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # For Passenger-enabled hosting (cPanel)
    # No additional rules needed - Passenger handles Node.js routing

    # For non-Passenger hosting with mod_proxy:
    # RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>
```

**WordPress Permalink Protection:**
- Ensure WordPress permalinks don't conflict with `/Calculate/*` routes
- The iframe method isolates the app routing from WordPress
- No modifications to WordPress `.htaccess` needed

### 5. Asset Pathing

**Configuration Applied:**
- All asset links use `<%= basePath %>` in EJS templates
- CSS, JS, and image paths are relative to the base path
- Form actions use base path prefixes
- Client-side JavaScript receives `APP_BASE_PATH` variable

**Verification:**
- CSS: `href="<%= basePath %>/style.css?v=1.0.2"`
- JS: `src="<%= basePath %>/script.js"`
- Forms: `action="<%= basePath %>/calculate"`

## Deployment Steps

1. **Prepare Application:**
   ```bash
   # Set environment variable for base path
   export BASE_PATH=/Calculate

   # Install dependencies
   npm install
   ```

2. **Upload Files:**
   - Upload entire `sokogate-calc/` directory to `/Calculate/`
   - Ensure file permissions are correct (755 for directories, 644 for files)
   - For cPanel: Use "Setup Node.js App" to configure the application

3. **Configure WordPress:**
   - Create page with slug "Calculate"
   - Add iframe or shortcode content
   - Test the integration

4. **Testing:**
   - Verify calculator loads at `/Calculate/`
   - Test form submissions
   - Check responsive design
   - Confirm no 404 errors on refresh

## Troubleshooting

**Common Issues:**

1. **404 Errors:**
   - Ensure `.htaccess` is properly configured
   - Check that Passenger is enabled for Node.js apps
   - Verify base path configuration

2. **Asset Loading Issues:**
   - Confirm all paths use `<%= basePath %>`
   - Check browser developer tools for failed requests
   - Verify file permissions

3. **WordPress Conflicts:**
   - Ensure no WordPress plugins interfere with `/Calculate/` routes
   - Check for permalink conflicts
   - Test in incognito mode to rule out caching

4. **Iframe Issues:**
   - Test calculator directly at `/Calculate/` first
   - Check for mixed content warnings (HTTP/HTTPS)
   - Verify iframe allow attributes if needed

## Performance Optimization

- Enable gzip compression in cPanel
- Set appropriate caching headers for static assets
- Monitor Node.js app performance
- Consider CDN for static assets if needed

## Security Considerations

- Keep Node.js dependencies updated
- Use HTTPS for all connections
- Implement proper error handling
- Monitor for security vulnerabilities
- Regular backups of both WordPress and Node.js app

## Support

For issues with this integration:
1. Test the Node.js app independently at `/Calculate/`
2. Check browser console for errors
3. Verify server logs
4. Contact hosting provider for Node.js/Passenger issues