/**
 * Main JavaScript file for Portfolio Website
 * Handles navigation, post loading, and interactive features
 */

// =========================================
// Configuration
// =========================================
const CONFIG = {
    postsDirectory: '_posts/',
    postsIndex: '_posts/index.json',
    contentDirectory: '_content/',
    featuredLimit: 3
};

// =========================================
// Utility Functions
// =========================================

/**
 * Convert simple markdown to HTML
 * @param {string} markdown - Markdown content
 * @returns {string} - HTML content
 */
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    // Store code blocks to prevent processing their contents
    const codeBlocks = [];
    let html = markdown.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escapedCode}</code></pre>`);
        return placeholder;
    });
    
    html = html
        // Escape HTML (after code blocks are extracted)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Paragraphs (double newlines)
        .replace(/\n\n/g, '</p><p>')
        // Single newlines within paragraphs
        .replace(/\n/g, '<br>');
    
    // Restore code blocks
    codeBlocks.forEach((block, i) => {
        html = html.replace(`__CODE_BLOCK_${i}__`, block);
    });
    
    // Wrap list items in ul
    html = html.replace(/(<li>.*<\/li>)(?:\s*<br>)?/g, '$1');
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
    
    // Wrap in paragraph tags if not starting with a block element
    if (!html.match(/^<(h[1-6]|ul|ol|div|pre)/)) {
        html = '<p>' + html + '</p>';
    }
    
    // Clean up empty paragraphs and fix spacing
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><(h[1-6]|ul|ol|pre)/g, '<$1');
    html = html.replace(/<\/(h[1-6]|ul|ol|pre)><\/p>/g, '</$1>');
    html = html.replace(/<p><br>/g, '<p>');
    html = html.replace(/<br><\/p>/g, '</p>');
    
    return html.trim();
}

/**
 * Parse frontmatter from markdown content
 * @param {string} content - Raw markdown content with frontmatter
 * @returns {Object} - Object with metadata and content
 */
function parseFrontmatter(content) {
    // Normalize line endings to \n
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        return { metadata: {}, content: content };
    }
    
    const frontmatter = match[1];
    const markdownContent = match[2];
    
    // Parse YAML-like frontmatter with support for arrays of objects and nested arrays
    const metadata = {};
    const lines = frontmatter.split('\n');
    
    let currentKey = null;
    let currentArray = null;
    let currentObject = null;
    let currentNestedKey = null;
    let currentNestedArray = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        // Check indentation level
        const indent = line.search(/\S/);
        
        // Nested array item (deeply indented "- " for bullets)
        if (trimmed.startsWith('- ') && indent >= 6 && currentNestedArray !== null) {
            let itemValue = trimmed.substring(2).trim();
            itemValue = itemValue.replace(/^["']|["']$/g, '');
            currentNestedArray.push(itemValue);
            continue;
        }
        
        // Array item start (- key: value)
        if (trimmed.startsWith('- ') && indent >= 2 && indent < 6) {
            if (currentKey && currentArray !== null) {
                // Save previous object's nested array if exists
                if (currentNestedKey && currentNestedArray && currentObject) {
                    currentObject[currentNestedKey] = currentNestedArray;
                    currentNestedKey = null;
                    currentNestedArray = null;
                }
                // Save previous object if exists
                if (currentObject && Object.keys(currentObject).length > 0) {
                    currentArray.push(currentObject);
                }
                currentObject = {};
                
                // Parse the rest of the line after "- "
                const itemContent = trimmed.substring(2);
                if (itemContent.includes(':')) {
                    const colonIdx = itemContent.indexOf(':');
                    const itemKey = itemContent.substring(0, colonIdx).trim();
                    let itemValue = itemContent.substring(colonIdx + 1).trim();
                    itemValue = itemValue.replace(/^["']|["']$/g, '');
                    currentObject[itemKey] = itemValue;
                }
            }
            continue;
        }
        
        // Indented property (part of current object)
        if (indent >= 4 && indent < 6 && currentObject !== null) {
            // Save any pending nested array
            if (currentNestedKey && currentNestedArray) {
                currentObject[currentNestedKey] = currentNestedArray;
                currentNestedKey = null;
                currentNestedArray = null;
            }
            
            const colonIdx = trimmed.indexOf(':');
            if (colonIdx > -1) {
                const propKey = trimmed.substring(0, colonIdx).trim();
                let propValue = trimmed.substring(colonIdx + 1).trim();
                
                // Check if this starts a nested array
                if (propValue === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
                    currentNestedKey = propKey;
                    currentNestedArray = [];
                    continue;
                }
                
                propValue = propValue.replace(/^["']|["']$/g, '');
                currentObject[propKey] = propValue;
            }
            continue;
        }
        
        // Top-level key
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1 && indent === 0) {
            // Save any pending nested array
            if (currentNestedKey && currentNestedArray && currentObject) {
                currentObject[currentNestedKey] = currentNestedArray;
                currentNestedKey = null;
                currentNestedArray = null;
            }
            // Save any pending array
            if (currentKey && currentArray !== null) {
                if (currentObject && Object.keys(currentObject).length > 0) {
                    currentArray.push(currentObject);
                }
                metadata[currentKey] = currentArray;
                currentArray = null;
                currentObject = null;
            }
            
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Check if this starts an array (empty value, next line is "- ")
            if (value === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
                currentKey = key;
                currentArray = [];
                currentObject = null;
                continue;
            }
            
            // Handle inline arrays (simple format: [item1, item2])
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
            }
            // Remove quotes if present
            else if ((value.startsWith('"') && value.endsWith('"')) || 
                     (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            
            metadata[key] = value;
            currentKey = null;
        }
    }
    
    // Don't forget the last items
    if (currentNestedKey && currentNestedArray && currentObject) {
        currentObject[currentNestedKey] = currentNestedArray;
    }
    if (currentKey && currentArray !== null) {
        if (currentObject && Object.keys(currentObject).length > 0) {
            currentArray.push(currentObject);
        }
        metadata[currentKey] = currentArray;
    }
    
    return { metadata, content: markdownContent };
}

/**
 * Format date string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Formatted date (month and year)
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format date range from start and end dates
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string (can be "present" or a date)
 * @returns {string} - Formatted date range
 */
function formatDateRange(startDate, endDate) {
    if (!startDate) return '';
    
    const startFormatted = formatDate(startDate);
    
    if (!endDate) return startFormatted;
    
    // Handle "present" or "ongoing" as end date
    if (endDate.toLowerCase() === 'present' || endDate.toLowerCase() === 'ongoing') {
        return `${startFormatted} – Present`;
    }
    
    const endFormatted = formatDate(endDate);
    
    // If same month and year, just show one date
    if (startFormatted === endFormatted) {
        return startFormatted;
    }
    
    return `${startFormatted} – ${endFormatted}`;
}

/**
 * Create a portfolio card element
 * @param {Object} post - Post data
 * @returns {HTMLElement} - Portfolio card element
 */
function createPortfolioCard(post) {
    const article = document.createElement('article');
    article.className = 'portfolio-item';
    article.dataset.category = post.category || 'all';
    
    // Store hidden tags as data attribute for filtering
    if (post.hidden_tags && Array.isArray(post.hidden_tags)) {
        article.dataset.hiddenTags = post.hidden_tags.join(',').toLowerCase();
    }
    
    const tags = Array.isArray(post.tags) 
        ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
        : '';
    
    // Hidden tags container (shown only when filtered)
    const hiddenTagsHtml = post.hidden_tags && Array.isArray(post.hidden_tags)
        ? post.hidden_tags.map(tag => `<span class="tag hidden-tag" data-tag="${tag.toLowerCase()}" style="display:none;">${tag}</span>`).join('')
        : '';
    
    const imageStyle = post.image 
        ? `background-image: url('${post.image}')`
        : '';
    
    // Image fit mode: 'fill' (default, covers area) or 'fit' (shows entire image)
    const imageFitClass = post.image_fit === 'fit' ? 'image-fit' : 'image-fill';
    
    article.innerHTML = `
        <a href="post.html?slug=${post.slug}">
            <div class="portfolio-item-image ${imageFitClass}" style="${imageStyle}"></div>
        </a>
        <div class="portfolio-item-content">
            <div class="portfolio-item-tags">${tags}${hiddenTagsHtml}</div>
            <h3>${post.title}</h3>
            <p>${post.excerpt || ''}</p>
            <a href="post.html?slug=${post.slug}" class="portfolio-item-link">
                View Project
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        </div>
    `;
    
    return article;
}

/**
 * Create a professional project group with parent and children
 * @param {Object} project - Parent project data with children
 * @returns {HTMLElement} - Professional project group element
 */
function createProfessionalProjectGroup(project) {
    const container = document.createElement('div');
    container.className = 'professional-project-group';
    container.dataset.category = 'professional';
    
    // Store hidden tags as data attribute for filtering
    if (project.hidden_tags && Array.isArray(project.hidden_tags)) {
        container.dataset.hiddenTags = project.hidden_tags.join(',').toLowerCase();
    }
    
    const parentTags = Array.isArray(project.tags) 
        ? project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
        : '';
    
    // Hidden tags for parent (shown only when filtered)
    const hiddenTagsHtml = project.hidden_tags && Array.isArray(project.hidden_tags)
        ? project.hidden_tags.map(tag => `<span class="tag hidden-tag" data-tag="${tag.toLowerCase()}" style="display:none;">${tag}</span>`).join('')
        : '';
    
    const imageStyle = project.image 
        ? `background-image: url('${project.image}')`
        : '';
    
    // Image fit mode: 'fill' (default) or 'fit'
    const imageFitClass = project.image_fit === 'fit' ? 'image-fit' : 'image-fill';
    
    // Optional icon for the project (displays next to title)
    const iconHtml = project.icon 
        ? `<img src="${project.icon}" alt="" class="project-parent-icon">`
        : '';
    
    // Create parent header
    const parentHtml = `
        <div class="project-parent">
            <div class="project-parent-image ${imageFitClass}" style="${imageStyle}"></div>
            <div class="project-parent-content">
                <div class="portfolio-item-tags">${parentTags}${hiddenTagsHtml}</div>
                <div class="project-parent-title">
                    ${iconHtml}
                    <h3>${project.title}</h3>
                </div>
                <p>${project.excerpt || ''}</p>
                <div class="project-buttons">
                    <button class="project-expand-btn" data-target="overview" aria-expanded="false" aria-label="Toggle project overview">
                        <span class="expand-text">Project Overview</span>
                        <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <button class="project-expand-btn" data-target="children" aria-expanded="true" aria-label="Toggle feature highlights">
                        <span class="expand-text">Feature Highlights</span>
                        <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Create overview container (will be populated with markdown content)
    const overviewHtml = `
        <div class="project-overview" style="display: none;">
            <div class="project-overview-content">Loading...</div>
            <button class="project-collapse-btn" aria-label="Collapse overview">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </button>
        </div>`;
    
    // Create children container
    let childrenHtml = '<div class="project-children">';
    
    if (project.children && project.children.length > 0) {
        project.children.forEach(child => {
            const childTags = Array.isArray(child.tags) 
                ? child.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                : '';
            
            // Hidden tags for child (shown only when filtered)
            const childHiddenTags = child.hidden_tags && Array.isArray(child.hidden_tags)
                ? child.hidden_tags.map(tag => `<span class="tag hidden-tag" data-tag="${tag.toLowerCase()}" style="display:none;">${tag}</span>`).join('')
                : '';
            
            // Store hidden tags as data attribute
            const childHiddenTagsData = child.hidden_tags && Array.isArray(child.hidden_tags)
                ? child.hidden_tags.join(',').toLowerCase()
                : '';
            
            const childImageStyle = child.image 
                ? `background-image: url('${child.image}')`
                : '';
            
            // Image fit mode for child
            const childImageFitClass = child.image_fit === 'fit' ? 'image-fit' : 'image-fill';
            
            childrenHtml += `
                <a href="post.html?slug=${child.slug}" class="project-child" data-hidden-tags="${childHiddenTagsData}">
                    <div class="project-child-image ${childImageFitClass}" style="${childImageStyle}"></div>
                    <div class="project-child-content">
                        <div class="portfolio-item-tags">${childTags}${childHiddenTags}</div>
                        <h4>${child.title}</h4>
                        <p>${child.excerpt || ''}</p>
                        <span class="portfolio-item-link">
                            View Details
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </span>
                    </div>
                </a>
            `;
        });
    }
    
    childrenHtml += '</div>';
    
    container.innerHTML = parentHtml + overviewHtml + childrenHtml;
    
    // Store slug for lazy loading overview content
    container.dataset.slug = project.slug;
    
    // Add expand/collapse functionality
    // Set up toggle buttons
    const expandBtns = container.querySelectorAll('.project-expand-btn');
    const overviewContainer = container.querySelector('.project-overview');
    const childrenContainer = container.querySelector('.project-children');
    
    expandBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const target = btn.dataset.target;
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            if (target === 'overview') {
                btn.setAttribute('aria-expanded', !isExpanded);
                if (!isExpanded) {
                    overviewContainer.style.display = 'block';
                    // Lazy load content if not already loaded
                    const contentDiv = overviewContainer.querySelector('.project-overview-content');
                    if (contentDiv.textContent === 'Loading...') {
                        const postData = await fetchPost(project.slug);
                        if (postData && postData.content) {
                            contentDiv.innerHTML = markdownToHtml(postData.content);
                        } else {
                            contentDiv.innerHTML = '<p>No overview available.</p>';
                        }
                    }
                } else {
                    overviewContainer.style.display = 'none';
                }
            } else if (target === 'children') {
                btn.setAttribute('aria-expanded', !isExpanded);
                childrenContainer.classList.toggle('collapsed');
            }
        });
    });
    
    // Collapse button for overview section
    const collapseBtn = container.querySelector('.project-collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            overviewContainer.style.display = 'none';
            const overviewBtn = container.querySelector('.project-expand-btn[data-target="overview"]');
            if (overviewBtn) {
                overviewBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    return container;
}

// =========================================
// Page Content Loading Functions
// =========================================

/**
 * Fetch and parse a content markdown file
 * @param {string} filename - Name of the content file (e.g., 'home.md')
 * @returns {Promise<Object>} - Object with metadata and content
 */
async function fetchPageContent(filename) {
    try {
        const response = await fetch(`${CONFIG.contentDirectory}${filename}`);
        if (!response.ok) return null;
        const content = await response.text();
        return parseFrontmatter(content);
    } catch (error) {
        console.log(`Content file ${filename} not found, using defaults`);
        return null;
    }
}

/**
 * Load and apply site-wide content
 */
async function loadSiteContent() {
    const data = await fetchPageContent('site.md');
    if (!data) return;
    
    const { metadata } = data;
    
    // Update logo text
    if (metadata.logo_text) {
        document.querySelectorAll('.logo').forEach(el => {
            el.textContent = metadata.logo_text;
        });
    }
    
    // Update footer tagline
    if (metadata.footer_tagline) {
        const tagline = document.querySelector('.footer-brand p');
        if (tagline) tagline.textContent = metadata.footer_tagline;
    }
    
    // Update copyright name
    if (metadata.copyright_name) {
        const copyright = document.querySelector('.footer-bottom p');
        if (copyright) {
            const year = document.getElementById('current-year');
            const yearText = year ? year.outerHTML : new Date().getFullYear();
            copyright.innerHTML = `&copy; ${yearText} ${metadata.copyright_name}. All rights reserved.`;
        }
    }
}

/**
 * Load and apply homepage content
 */
async function loadHomeContent() {
    const data = await fetchPageContent('home.md');
    if (!data) return;
    
    const { metadata } = data;
    
    // Update hero section
    if (metadata.greeting) {
        const greeting = document.querySelector('.hero-greeting');
        if (greeting) greeting.innerHTML = `${metadata.greeting}<span class="cursor">_</span>`;
    }
    
    if (metadata.name) {
        const name = document.querySelector('.hero-title');
        if (name) name.textContent = metadata.name;
        // Update page title
        document.title = `${metadata.name} | ${metadata.title || 'Portfolio'}`;
    }
    
    if (metadata.title) {
        const title = document.querySelector('.hero-subtitle');
        if (title) title.textContent = metadata.title;
    }
    
    if (metadata.description) {
        const desc = document.querySelector('.hero-description');
        if (desc) desc.textContent = metadata.description;
    }
    
    // Update CTA buttons
    if (metadata.cta_primary_text) {
        const btn = document.querySelector('.hero-cta .btn-primary');
        if (btn) {
            btn.textContent = metadata.cta_primary_text;
            if (metadata.cta_primary_link) btn.href = metadata.cta_primary_link;
        }
    }
    
    if (metadata.cta_secondary_text) {
        const btn = document.querySelector('.hero-cta .btn-outline');
        if (btn) {
            btn.textContent = metadata.cta_secondary_text;
            if (metadata.cta_secondary_link) btn.href = metadata.cta_secondary_link;
        }
    }
    
    // Update featured section
    if (metadata.featured_title) {
        const title = document.querySelector('.featured-work .section-title');
        if (title) title.textContent = metadata.featured_title;
    }
    
    if (metadata.featured_subtitle) {
        const subtitle = document.querySelector('.featured-work .section-subtitle');
        if (subtitle) subtitle.textContent = metadata.featured_subtitle;
    }
}

/**
 * Load and apply about page content
 */
async function loadAboutContent() {
    const data = await fetchPageContent('about.md');
    if (!data) return;
    
    const { metadata, content } = data;
    
    if (metadata.page_title) {
        const title = document.querySelector('.page-hero h1');
        if (title) title.textContent = metadata.page_title;
    }
    
    if (metadata.page_subtitle) {
        const subtitle = document.querySelector('.page-hero p');
        if (subtitle) subtitle.textContent = metadata.page_subtitle;
    }
    
    // Parse and render markdown body content (bio)
    if (content) {
        const aboutContent = document.querySelector('[data-content="about-body"]');
        if (aboutContent) {
            aboutContent.innerHTML = markdownToHtml(content);
        }
    }
    
    // Populate timeline from experience data
    if (metadata.experience && Array.isArray(metadata.experience)) {
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            timeline.innerHTML = metadata.experience.map(job => {
                const bulletsList = job.bullets && Array.isArray(job.bullets) 
                    ? `<ul class="job-bullets">${job.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
                    : (job.description ? `<p>${job.description}</p>` : '');
                return `
                    <div class="timeline-item">
                        <div class="timeline-date">${job.date || ''}</div>
                        <h4>${job.title || ''}</h4>
                        <p class="company">${job.company || ''}</p>
                        ${bulletsList}
                    </div>
                `;
            }).join('');
            
            // Add education section below experience
            if (metadata.education && Array.isArray(metadata.education)) {
                const educationHtml = metadata.education.map(edu => {
                    const locationHtml = edu.location 
                        ? ` <span class="school-location">— ${edu.location}</span>` 
                        : '';
                    const concentrationHtml = edu.concentration 
                        ? `<p class="concentration">Concentration: ${edu.concentration}</p>` 
                        : '';
                    return `
                        <div class="timeline-item education-item">
                            <div class="timeline-date">${edu.date || ''}</div>
                            <h4>${edu.degree || ''}</h4>
                            <p class="company">${edu.school || ''}${locationHtml}</p>
                            ${concentrationHtml}
                        </div>
                    `;
                }).join('');
                
                timeline.innerHTML += `
                    <div class="timeline-section-divider">
                        <span>Education</span>
                    </div>
                    ${educationHtml}
                `;
            }
        }
    }
    
    // Load skills from JSON
    await loadSkills();
}

/**
 * Load and render skills from skills.json
 */
async function loadSkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;
    
    try {
        const response = await fetch(`${CONFIG.contentDirectory}skills.json`);
        if (!response.ok) return;
        const skillGroups = await response.json();
        
        container.innerHTML = skillGroups.map(group => `
            <div class="skills-group">
                <h4>${group.category}</h4>
                <div class="tag-list">
                    ${group.skills.map(skill => 
                        `<a href="portfolio.html?tag=${encodeURIComponent(skill.tag)}" class="skill-tag">${skill.name}</a>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

/**
 * Load and apply contact page content
 */
async function loadContactContent() {
    const data = await fetchPageContent('contact.md');
    if (!data) return;
    
    const { metadata, content } = data;
    
    if (metadata.page_title) {
        const title = document.querySelector('.page-hero h1');
        if (title) title.textContent = metadata.page_title;
    }
    
    if (metadata.page_subtitle) {
        const subtitle = document.querySelector('.page-hero p');
        if (subtitle) subtitle.textContent = metadata.page_subtitle;
    }
    
    // Parse and render markdown body content
    if (content) {
        const contactContent = document.querySelector('[data-content="contact-body"]');
        if (contactContent) {
            contactContent.innerHTML = markdownToHtml(content);
        }
    }
}

/**
 * Load and apply portfolio page content
 */
async function loadPortfolioContent() {
    const data = await fetchPageContent('portfolio.md');
    if (!data) return;
    
    const { metadata } = data;
    
    if (metadata.page_title) {
        const title = document.querySelector('.page-hero h1');
        if (title) title.textContent = metadata.page_title;
    }
    
    if (metadata.page_subtitle) {
        const subtitle = document.querySelector('.page-hero p');
        if (subtitle) subtitle.textContent = metadata.page_subtitle;
    }
}

// =========================================
// Post Loading Functions
// =========================================

/**
 * Fetch the posts index
 * @returns {Promise<Array>} - Array of post metadata
 */
/**
 * Fetch frontmatter from a markdown file
 * @param {string} slug - Post slug
 * @returns {Promise<Object>} - Frontmatter metadata
 */
async function fetchPostFrontmatter(slug) {
    try {
        const response = await fetch(`${CONFIG.postsDirectory}${slug}.markdown`);
        if (!response.ok) return null;
        const content = await response.text();
        const { metadata } = parseFrontmatter(content);
        return { slug, ...metadata };
    } catch (error) {
        console.error(`Error loading frontmatter for ${slug}:`, error);
        return null;
    }
}

/**
 * Fetch posts index and enrich with markdown frontmatter
 * @returns {Promise<Array>} - Array of post data
 */
async function fetchPostsIndex() {
    try {
        const response = await fetch(CONFIG.postsIndex);
        if (!response.ok) throw new Error('Failed to load posts index');
        const index = await response.json();
        
        // Fetch frontmatter for each post and merge with index data
        const enrichedPosts = await Promise.all(index.map(async (entry) => {
            const frontmatter = await fetchPostFrontmatter(entry.slug);
            
            // Handle children (sub-projects) if present
            let children = null;
            if (entry.children && Array.isArray(entry.children)) {
                children = await Promise.all(entry.children.map(async (childSlug) => {
                    const childFrontmatter = await fetchPostFrontmatter(childSlug);
                    return childFrontmatter || { slug: childSlug, title: childSlug };
                }));
            }
            
            return {
                ...frontmatter,
                ...entry, // index.json values override frontmatter for category, featured, isParent
                children: children || entry.children
            };
        }));
        
        return enrichedPosts.filter(post => post !== null);
    } catch (error) {
        console.error('Error loading posts index:', error);
        return [];
    }
}

/**
 * Fetch a single post by slug (full content)
 * @param {string} slug - Post slug
 * @returns {Promise<Object>} - Post data with content
 */
async function fetchPost(slug) {
    try {
        const response = await fetch(`${CONFIG.postsDirectory}${slug}.markdown`);
        if (!response.ok) throw new Error('Post not found');
        const content = await response.text();
        return parseFrontmatter(content);
    } catch (error) {
        console.error('Error loading post:', error);
        return null;
    }
}

/**
 * Load featured posts on the homepage
 */
async function loadFeaturedPosts() {
    const container = document.getElementById('featured-posts');
    if (!container) return;
    
    const posts = await fetchPostsIndex();
    const featuredPosts = posts
        .filter(post => post.featured)
        .slice(0, CONFIG.featuredLimit);
    
    // If no featured posts, show the most recent ones
    const postsToShow = featuredPosts.length > 0 
        ? featuredPosts 
        : posts.slice(0, CONFIG.featuredLimit);
    
    container.innerHTML = '';
    postsToShow.forEach(post => {
        // For homepage, show professional project groups differently
        if (post.isParent && post.children && post.children.length > 0) {
            container.appendChild(createProfessionalProjectGroup(post));
        } else {
            container.appendChild(createPortfolioCard(post));
        }
    });
}

/**
 * Load all posts on the portfolio page
 */
async function loadAllPosts() {
    const container = document.getElementById('portfolio-grid');
    const loading = document.getElementById('loading');
    
    if (!container) return;
    
    if (loading) loading.classList.add('show');
    
    const posts = await fetchPostsIndex();
    
    if (loading) loading.classList.remove('show');
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="no-posts">No projects found. Check back soon!</p>';
        return;
    }
    
    container.innerHTML = '';
    posts.forEach(post => {
        // Check if this is a professional project with children (two-tier)
        if (post.isParent && post.children && post.children.length > 0) {
            container.appendChild(createProfessionalProjectGroup(post));
        } else {
            container.appendChild(createPortfolioCard(post));
        }
    });
    
    // Initialize filters after posts are loaded
    initFilters();
    initTagFilterDropdown();
    
    // Check for tag filter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tagFilter = urlParams.get('tag');
    if (tagFilter) {
        filterByTag(tagFilter);
    }
}

/**
 * Filter portfolio items by tag
 * @param {string} tag - Tag to filter by
 */
function filterByTag(tag) {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const projectGroups = document.querySelectorAll('.professional-project-group');
    const tagLower = tag.toLowerCase();
    let hasMatches = false;
    
    // Reset category filters to "All"
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Hide all hidden tags and remove active state from all tags first
    document.querySelectorAll('.hidden-tag').forEach(tag => {
        tag.style.display = 'none';
    });
    document.querySelectorAll('.tag').forEach(tag => {
        tag.classList.remove('tag-active');
    });
    
    // Filter regular portfolio items by tag (including hidden tags)
    portfolioItems.forEach(item => {
        const visibleTags = item.querySelectorAll('.tag:not(.hidden-tag)');
        const hiddenTags = item.dataset.hiddenTags || '';
        let matchFound = false;
        let matchedHiddenTag = null;
        let matchedVisibleTagEl = null;
        
        // Check visible tags
        visibleTags.forEach(tagEl => {
            if (tagEl.textContent.toLowerCase().includes(tagLower)) {
                matchFound = true;
                matchedVisibleTagEl = tagEl;
            }
        });
        
        // Check hidden tags
        if (!matchFound && hiddenTags) {
            const hiddenTagsArray = hiddenTags.split(',');
            hiddenTagsArray.forEach(ht => {
                if (ht.includes(tagLower)) {
                    matchFound = true;
                    matchedHiddenTag = ht;
                }
            });
        }
        
        if (matchFound) {
            item.style.display = 'block';
            hasMatches = true;
            
            // Highlight the matching tag
            if (matchedVisibleTagEl) {
                matchedVisibleTagEl.classList.add('tag-active');
            }
            
            // Show the matching hidden tag if it was the match
            if (matchedHiddenTag) {
                const hiddenTagEl = item.querySelector(`.hidden-tag[data-tag="${matchedHiddenTag}"]`);
                if (hiddenTagEl) {
                    hiddenTagEl.style.display = 'inline-flex';
                    hiddenTagEl.classList.add('tag-active');
                }
            }
        } else {
            item.style.display = 'none';
        }
    });
    
    // Filter professional project groups by tag (check parent and children, including hidden tags)
    projectGroups.forEach(group => {
        const parentElement = group.querySelector('.project-parent');
        const parentVisibleTags = parentElement ? parentElement.querySelectorAll('.tag:not(.hidden-tag)') : [];
        const parentHiddenTags = group.dataset.hiddenTags || '';
        let parentMatchFound = false;
        let matchedParentTagEls = [];
        let matchedParentHiddenTagEl = null;
        
        // Check parent visible tags
        parentVisibleTags.forEach(tagEl => {
            if (tagEl.textContent.toLowerCase().includes(tagLower)) {
                parentMatchFound = true;
                matchedParentTagEls.push(tagEl);
            }
        });
        
        // Check parent hidden tags
        if (!parentMatchFound && parentHiddenTags) {
            const hiddenTagsArray = parentHiddenTags.split(',');
            hiddenTagsArray.forEach(ht => {
                if (ht.includes(tagLower)) {
                    parentMatchFound = true;
                    matchedParentHiddenTagEl = group.querySelector(`.project-parent .hidden-tag[data-tag="${ht}"]`);
                }
            });
        }
        
        // Get all child items
        const childItems = group.querySelectorAll('.project-child');
        let anyChildMatch = false;
        
        if (parentMatchFound) {
            // Parent has the tag - show all children
            group.style.display = 'block';
            hasMatches = true;
            
            // Highlight parent tags
            matchedParentTagEls.forEach(tagEl => {
                tagEl.classList.add('tag-active');
            });
            if (matchedParentHiddenTagEl) {
                matchedParentHiddenTagEl.style.display = 'inline-flex';
                matchedParentHiddenTagEl.classList.add('tag-active');
            }
            
            // Show all children
            childItems.forEach(child => {
                child.style.display = '';
            });
        } else {
            // Parent doesn't have the tag - check each child individually
            childItems.forEach(child => {
                const childVisibleTags = child.querySelectorAll('.tag:not(.hidden-tag)');
                const childHiddenTags = child.dataset.hiddenTags || '';
                let childMatchFound = false;
                let matchedChildTagEl = null;
                let matchedChildHiddenTagEl = null;
                
                // Check child visible tags
                childVisibleTags.forEach(tagEl => {
                    if (tagEl.textContent.toLowerCase().includes(tagLower)) {
                        childMatchFound = true;
                        matchedChildTagEl = tagEl;
                    }
                });
                
                // Check child hidden tags
                if (!childMatchFound && childHiddenTags) {
                    const childHiddenTagsArray = childHiddenTags.split(',');
                    childHiddenTagsArray.forEach(ht => {
                        if (ht.includes(tagLower)) {
                            childMatchFound = true;
                            matchedChildHiddenTagEl = child.querySelector(`.hidden-tag[data-tag="${ht}"]`);
                        }
                    });
                }
                
                if (childMatchFound) {
                    child.style.display = '';
                    anyChildMatch = true;
                    
                    // Highlight matching tag
                    if (matchedChildTagEl) {
                        matchedChildTagEl.classList.add('tag-active');
                    }
                    if (matchedChildHiddenTagEl) {
                        matchedChildHiddenTagEl.style.display = 'inline-flex';
                        matchedChildHiddenTagEl.classList.add('tag-active');
                    }
                } else {
                    child.style.display = 'none';
                }
            });
            
            if (anyChildMatch) {
                group.style.display = 'block';
                hasMatches = true;
            } else {
                group.style.display = 'none';
            }
        }
    });
    
    // Show message if no matches
    const container = document.getElementById('portfolio-grid');
    const existingMsg = document.querySelector('.filter-message');
    if (existingMsg) existingMsg.remove();
    
    if (hasMatches) {
        const msg = document.createElement('p');
        msg.className = 'filter-message';
        msg.innerHTML = `Showing projects with <strong>${tag}</strong> <a href="portfolio.html" class="clear-filter">Clear filter</a>`;
        container.insertAdjacentElement('beforebegin', msg);
    } else {
        const msg = document.createElement('p');
        msg.className = 'filter-message no-results';
        msg.innerHTML = `No projects found with <strong>${tag}</strong> <a href="portfolio.html" class="clear-filter">Show all</a>`;
        container.insertAdjacentElement('beforebegin', msg);
    }
}

/**
 * Load a single post on the post page
 */
async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        window.location.href = 'portfolio.html';
        return;
    }
    
    const postData = await fetchPost(slug);
    
    if (!postData) {
        window.location.href = 'portfolio.html';
        return;
    }
    
    const { metadata, content } = postData;
    
    // Update page title
    document.title = `${metadata.title} | Alec Grover`;
    
    // Update hero image
    const heroElement = document.getElementById('post-hero');
    if (heroElement && metadata.image) {
        heroElement.style.backgroundImage = `url('${metadata.image}')`;
    }
    
    // Update header
    const headerElement = document.getElementById('post-header');
    if (headerElement) {
        const tags = Array.isArray(metadata.tags)
            ? metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';
        
        headerElement.innerHTML = `
            <h1>${metadata.title}</h1>
            <div class="post-meta">
                <span>${formatDateRange(metadata.start_date, metadata.end_date)}</span>
                ${metadata.client ? `<span>Client: ${metadata.client}</span>` : ''}
            </div>
            <div class="portfolio-item-tags">${tags}</div>
        `;
    }
    
    // Render markdown content
    const contentElement = document.getElementById('post-content');
    if (contentElement && typeof marked !== 'undefined') {
        contentElement.innerHTML = marked.parse(content);
    } else if (contentElement) {
        // Fallback: basic markdown rendering
        contentElement.innerHTML = content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/gim, '<br>');
    }
}

// =========================================
// Filter Functionality
// =========================================

/**
 * Initialize portfolio filters
 */
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        // Remove existing listeners to prevent duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', () => {
            const filter = newButton.dataset.filter;
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            newButton.classList.add('active');
            
            // Clear any tag filter message
            const existingMsg = document.querySelector('.filter-message');
            if (existingMsg) existingMsg.remove();
            
            // Filter regular portfolio items
            document.querySelectorAll('.portfolio-item').forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Filter professional project groups
            document.querySelectorAll('.professional-project-group').forEach(group => {
                if (filter === 'all' || group.dataset.category === filter) {
                    group.style.display = 'block';
                    // Reset all children to visible
                    group.querySelectorAll('.project-child').forEach(child => {
                        child.style.display = '';
                    });
                } else {
                    group.style.display = 'none';
                }
            });
            
            // Reset tag active states and hide hidden tags
            document.querySelectorAll('.tag').forEach(tag => {
                tag.classList.remove('tag-active');
            });
            document.querySelectorAll('.hidden-tag').forEach(tag => {
                tag.style.display = 'none';
            });
        });
    });
}

/**
 * Initialize the tag filter dropdown
 */
function initTagFilterDropdown() {
    const toggle = document.getElementById('tag-filter-toggle');
    const dropdown = document.getElementById('tag-filter-dropdown');
    const tagList = document.getElementById('tag-filter-list');
    
    if (!toggle || !dropdown || !tagList) return;
    
    // Collect all unique tags from portfolio items
    const allTags = new Set();
    
    // Get tags from regular portfolio items
    document.querySelectorAll('.portfolio-item .tag:not(.hidden-tag)').forEach(tag => {
        allTags.add(tag.textContent.trim());
    });
    
    // Get tags from professional project groups (parent and children)
    document.querySelectorAll('.professional-project-group .tag:not(.hidden-tag)').forEach(tag => {
        allTags.add(tag.textContent.trim());
    });
    
    // Sort tags alphabetically
    const sortedTags = Array.from(allTags).sort((a, b) => 
        a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    // Populate the dropdown
    tagList.innerHTML = sortedTags.map(tag => 
        `<span class="tag" data-filter-tag="${tag}">${tag}</span>`
    ).join('');
    
    // Toggle dropdown
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle.classList.toggle('active');
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            dropdown.classList.remove('active');
        }
    });
    
    // Handle tag click
    tagList.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const tagText = tag.dataset.filterTag;
            filterByTag(tagText);
            
            // Close dropdown
            toggle.classList.remove('active');
            dropdown.classList.remove('active');
        });
    });
}

// =========================================
// Mobile Navigation
// =========================================

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }
}

// =========================================
// Header Scroll Effect
// =========================================

/**
 * Add scroll effect to header
 */
function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Initialize scroll indicator behavior
 */
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        });
    }
}

/**
 * Initialize hero image animation
 * Cycles through Dodo images at 500ms intervals
 */
function initHeroAnimation() {
    const heroImage = document.getElementById('hero-animation');
    if (!heroImage) return;
    
    const frames = [
        'assets/images/Dodo_1.png',
        'assets/images/Dodo_2.png',
        'assets/images/Dodo_3.png'
    ];
    
    let currentFrame = 0;
    
    setInterval(() => {
        currentFrame = (currentFrame + 1) % frames.length;
        heroImage.src = frames[currentFrame];
    }, 500);
}

// =========================================
// Initialize
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize header scroll effect
    initHeaderScroll();
    
    // Initialize scroll indicator
    initScrollIndicator();
    
    // Load site-wide content
    loadSiteContent();
    
    // Load page-specific content based on current page
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    
    if (page === 'index.html' || page === '') {
        loadHomeContent();
        initHeroAnimation();
    } else if (page === 'about.html') {
        loadAboutContent();
    } else if (page === 'contact.html') {
        loadContactContent();
    } else if (page === 'portfolio.html') {
        loadPortfolioContent();
    }
});
