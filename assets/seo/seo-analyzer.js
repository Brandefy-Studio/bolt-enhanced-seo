/**
 * Real-time SEO Analyzer for Bolt Enhanced SEO v1.1.2
 */

class SeoAnalyzer {
    constructor() {
        this.checks = {
            titleLength: { weight: 15, name: 'SEO Title Length' },
            descriptionLength: { weight: 15, name: 'Meta Description Length' },
            keyphraseInTitle: { weight: 15, name: 'Keyphrase in Title' },
            keyphraseInDescription: { weight: 10, name: 'Keyphrase in Description' },
            keyphraseInSlug: { weight: 10, name: 'Keyphrase in URL' },
            keywords: { weight: 5, name: 'Keywords', conditional: true },
            keyphraseInContent: { weight: 8, name: 'Keyphrase in Content' },
            keyphraseDensity: { weight: 8, name: 'Keyphrase Density' },
            contentLength: { weight: 10, name: 'Content Length' },
            externalLinks: { weight: 5, name: 'External Links' },
            internalLinks: { weight: 4, name: 'Internal Links' }
        };
        
        this.thresholds = {
            title: { min: 30, max: 60, optimal: 50 },
            description: { min: 120, max: 160, optimal: 140 },
            keywords: { min: 3, optimal: 7, max: 15 },
            keyphraseDensity: { min: 0.5, max: 2.5, optimal: 1.5 },
            contentLength: { min: 300, optimal: 800 },
            externalLinks: { min: 1, optimal: 3 },
            internalLinks: { min: 2, optimal: 5 }
        };
        
        // Check if keywords field is enabled by checking max length in field
        this.keywordsEnabled = this.checkKeywordsEnabled();
    }
    
    checkKeywordsEnabled() {
        // Check if keywords field exists as a TEXTAREA (not hidden input)
        // When disabled, template renders: <input type='hidden' id="seofields-keywords">
        // When enabled, template renders: <textarea id="seofields-keywords">
        const keywordsInput = document.querySelector('#seofields-keywords');
        
        // Check if it exists AND is a textarea (not hidden input)
        const enabled = keywordsInput !== null && keywordsInput.tagName === 'TEXTAREA';
        
        console.log('[SEO Analyzer] Keywords field detection:', {
            fieldExists: keywordsInput !== null,
            isTextarea: keywordsInput?.tagName === 'TEXTAREA',
            isHiddenInput: keywordsInput?.type === 'hidden',
            enabled: enabled
        });
        
        return enabled;
    }

    analyze(data) {
        const results = {
            score: 0,
            checks: {},
            feedback: []
        };

        results.checks.titleLength = this.checkTitleLength(data.title);
        results.checks.descriptionLength = this.checkDescriptionLength(data.description);
        results.checks.keyphraseInTitle = this.checkKeyphraseInTitle(data.title, data.keyphrase);
        results.checks.keyphraseInDescription = this.checkKeyphraseInDescription(data.description, data.keyphrase);
        results.checks.keyphraseInSlug = this.checkKeyphraseInSlug(data.slug, data.keyphrase);
        
        // Only check keywords if field is enabled (maxlength > 0)
        if (this.keywordsEnabled) {
            results.checks.keywords = this.checkKeywords(data.keywords);
        }
        
        results.checks.keyphraseInContent = this.checkKeyphraseInContent(data.content, data.keyphrase);
        results.checks.keyphraseDensity = this.checkKeyphraseDensity(data.content, data.keyphrase);
        results.checks.contentLength = this.checkContentLength(data.content);
        results.checks.externalLinks = this.checkExternalLinks(data.content);
        results.checks.internalLinks = this.checkInternalLinks(data.content);

        let earnedScore = 0;
        let totalWeight = 0;
        
        Object.keys(results.checks).forEach(checkName => {
            const check = results.checks[checkName];
            const weight = this.checks[checkName].weight;
            totalWeight += weight;
            earnedScore += (check.score / 100) * weight;
        });

        // Normalize score to 100 (in case keywords is disabled, weights don't add to 100)
        results.score = Math.round((earnedScore / totalWeight) * 100);
        results.feedback = this.generateFeedback(results.checks);

        return results;
    }

    checkTitleLength(title) {
        const length = title.trim().length;
        const { min, max, optimal } = this.thresholds.title;
        
        if (length === 0) {
            return { score: 0, status: 'bad', message: 'No SEO title set.', value: length };
        } else if (length < min) {
            return {
                score: Math.round((length / min) * 60),
                status: 'warning',
                message: `Title too short (${length}/${min}-${max} chars)`,
                value: length
            };
        } else if (length > max) {
            return {
                score: 70,
                status: 'warning',
                message: `Title too long (${length}/${max} chars max)`,
                value: length
            };
        } else {
            return {
                score: 100 - Math.abs(length - optimal) * 2,
                status: 'good',
                message: `Title length perfect (${length} chars)`,
                value: length
            };
        }
    }

    checkDescriptionLength(description) {
        const length = description.trim().length;
        const { min, max, optimal } = this.thresholds.description;
        
        if (length === 0) {
            return { score: 0, status: 'bad', message: 'No meta description set.', value: length };
        } else if (length < min) {
            return {
                score: Math.round((length / min) * 60),
                status: 'warning',
                message: `Description too short (${length}/${min}-${max} chars)`,
                value: length
            };
        } else if (length > max) {
            return {
                score: 60,
                status: 'warning',
                message: `Description too long (${length}/${max} chars max)`,
                value: length
            };
        } else {
            return {
                score: 100 - Math.abs(length - optimal),
                status: 'good',
                message: `Description length perfect (${length} chars)`,
                value: length
            };
        }
    }

    checkKeywords(keywords) {
        if (!keywords || !keywords.trim()) {
            return { 
                score: 40, 
                status: 'warning', 
                message: 'No keywords specified', 
                value: 0 
            };
        }
        
        // Split by comma and count
        const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        const count = keywordList.length;
        
        const { min, optimal, max } = this.thresholds.keywords;
        
        if (count === 0) {
            return { 
                score: 40, 
                status: 'warning', 
                message: 'No keywords added', 
                value: 0 
            };
        } else if (count < min) {
            return { 
                score: 60, 
                status: 'warning', 
                message: `Only ${count} keyword(s) - add more`, 
                value: count 
            };
        } else if (count >= optimal && count <= max) {
            return { 
                score: 100, 
                status: 'good', 
                message: `${count} keyword(s) (optimal)`, 
                value: count 
            };
        } else if (count > max) {
            return { 
                score: 70, 
                status: 'warning', 
                message: `${count} keywords - may be too many`, 
                value: count 
            };
        } else {
            return { 
                score: 85, 
                status: 'good', 
                message: `${count} keyword(s)`, 
                value: count 
            };
        }
    }

    checkKeyphraseInTitle(title, keyphrase) {
        if (!keyphrase?.trim()) {
            return { score: 0, status: 'neutral', message: 'Set a focus keyphrase', value: false };
        }

        const titleLower = title.toLowerCase();
        const keyphraseLower = keyphrase.toLowerCase();
        
        if (titleLower.includes(keyphraseLower)) {
            const position = titleLower.indexOf(keyphraseLower);
            const score = position === 0 ? 100 : (position < 10 ? 90 : 75);
            return {
                score,
                status: 'good',
                message: position === 0 ? 'Keyphrase at start of title!' : 'Keyphrase in title',
                value: true
            };
        }
        
        return { score: 0, status: 'bad', message: 'Keyphrase not in title', value: false };
    }

    checkKeyphraseInDescription(description, keyphrase) {
        if (!keyphrase?.trim()) {
            return { score: 0, status: 'neutral', message: 'Set a focus keyphrase', value: false };
        }

        if (description.toLowerCase().includes(keyphrase.toLowerCase())) {
            return { score: 100, status: 'good', message: 'Keyphrase in description', value: true };
        }
        
        return { score: 0, status: 'bad', message: 'Keyphrase not in description', value: false };
    }

    checkKeyphraseInSlug(slug, keyphrase) {
        if (!keyphrase?.trim()) {
            return { score: 0, status: 'neutral', message: 'Set a focus keyphrase', value: false };
        }

        const slugLower = slug.toLowerCase();
        const keyphraseLower = keyphrase.toLowerCase().replace(/\s+/g, '-');
        
        if (slugLower.includes(keyphraseLower)) {
            return { score: 100, status: 'good', message: 'Keyphrase in URL', value: true };
        }
        
        return { score: 0, status: 'warning', message: 'Keyphrase not in URL', value: false };
    }

    checkKeyphraseInContent(content, keyphrase) {
        if (!keyphrase?.trim()) {
            return { score: 0, status: 'neutral', message: 'Set a focus keyphrase', value: 0 };
        }

        const plainText = this.stripHtml(content);
        const regex = new RegExp(keyphrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = plainText.match(regex);
        const count = matches ? matches.length : 0;
        
        if (count === 0) {
            return { score: 0, status: 'bad', message: 'Keyphrase not in content', value: 0 };
        } else if (count < 3) {
            return { score: 60, status: 'warning', message: `Keyphrase appears ${count} time(s)`, value: count };
        } else {
            return { score: 100, status: 'good', message: `Keyphrase appears ${count} times`, value: count };
        }
    }

    checkKeyphraseDensity(content, keyphrase) {
        if (!keyphrase?.trim()) {
            return { score: 0, status: 'neutral', message: 'Set a focus keyphrase', value: 0 };
        }

        const plainText = this.stripHtml(content);
        const words = plainText.split(/\s+/).filter(w => w.length > 0);
        
        if (words.length === 0) {
            return { score: 0, status: 'neutral', message: 'No content yet', value: 0 };
        }

        const regex = new RegExp(keyphrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = plainText.toLowerCase().match(regex);
        const count = matches ? matches.length : 0;
        const density = (count / words.length) * 100;
        
        const { min, max } = this.thresholds.keyphraseDensity;
        
        if (count === 0) {
            return { score: 0, status: 'bad', message: 'No keyphrase in content', value: 0 };
        } else if (density < min) {
            return { score: 50, status: 'warning', message: `Density low (${density.toFixed(1)}%)`, value: density };
        } else if (density > max) {
            return { score: 40, status: 'warning', message: `Density high (${density.toFixed(1)}%)`, value: density };
        } else {
            return { score: 100, status: 'good', message: `Density good (${density.toFixed(1)}%)`, value: density };
        }
    }

    checkContentLength(content) {
        const plainText = this.stripHtml(content);
        const words = plainText.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const { min, optimal } = this.thresholds.contentLength;
        
        if (wordCount === 0) {
            return { score: 0, status: 'bad', message: 'No content', value: 0 };
        } else if (wordCount < min) {
            return {
                score: Math.round((wordCount / min) * 50),
                status: 'warning',
                message: `${wordCount}/${min} words minimum`,
                value: wordCount
            };
        } else if (wordCount >= optimal) {
            return { score: 100, status: 'good', message: `${wordCount} words (excellent!)`, value: wordCount };
        } else {
            return {
                score: 50 + Math.round(((wordCount - min) / (optimal - min)) * 50),
                status: 'good',
                message: `${wordCount} words`,
                value: wordCount
            };
        }
    }

    checkExternalLinks(content) {
        const links = this.extractLinks(content);
        // Filter: only links where isExternalLink returns true (excluding null)
        const externalLinks = links.filter(link => this.isExternalLink(link) === true);
        const count = externalLinks.length;
        
        if (count === 0) {
            return { score: 60, status: 'warning', message: 'No external links', value: 0 };
        } else if (count <= 3) {
            return { score: 100, status: 'good', message: `${count} external link(s)`, value: count };
        } else {
            return { score: 80, status: 'good', message: `${count} external links`, value: count };
        }
    }

    checkInternalLinks(content) {
        const links = this.extractLinks(content);
        // Filter: only links where isExternalLink returns false (excluding null for anchors)
        const internalLinks = links.filter(link => this.isExternalLink(link) === false);
        const count = internalLinks.length;
        
        if (count === 0) {
            return { score: 40, status: 'warning', message: 'No internal links', value: 0 };
        } else if (count >= 2) {
            return { score: 100, status: 'good', message: `${count} internal link(s)`, value: count };
        } else {
            return { score: 70, status: 'warning', message: `Only ${count} internal link`, value: count };
        }
    }

    generateFeedback(checks) {
        const feedback = [];
        Object.keys(checks).forEach(checkName => {
            const check = checks[checkName];
            if (check.status === 'bad' || check.status === 'warning') {
                feedback.push({
                    type: check.status,
                    check: this.checks[checkName].name,
                    message: check.message
                });
            }
        });
        
        feedback.sort((a, b) => (a.type === 'bad' ? -1 : 1));
        return feedback;
    }

    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    extractLinks(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const anchors = div.querySelectorAll('a[href]');
        return Array.from(anchors).map(a => {
            const href = a.getAttribute('href');
            // Return both href and full URL for better analysis
            return {
                href: href,
                fullUrl: this.resolveUrl(href)
            };
        });
    }

    resolveUrl(href) {
        // Resolve relative URLs to absolute URLs
        try {
            return new URL(href, window.location.origin).href;
        } catch (e) {
            return href;
        }
    }

    isExternalLink(linkObj) {
        const href = linkObj.href;
        const fullUrl = linkObj.fullUrl;
        
        // Skip anchors, javascript, mailto, tel, etc.
        if (!href || 
            href.startsWith('#') || 
            href.startsWith('javascript:') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('sms:')) {
            return null; // Not counted as either internal or external
        }
        
        try {
            const url = new URL(fullUrl);
            const currentHostname = window.location.hostname;
            
            // Compare hostnames (ignoring www)
            const urlHost = url.hostname.replace(/^www\./, '');
            const currentHost = currentHostname.replace(/^www\./, '');
            
            // External if different hostname
            return urlHost !== currentHost;
        } catch (e) {
            // If URL parsing fails, treat as internal (relative link)
            return false;
        }
    }
}
