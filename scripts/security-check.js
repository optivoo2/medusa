#!/usr/bin/env node

/**
 * 🔐 Security Validation Script
 * Validates production security configuration before deployment
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

class SecurityChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
  }

  // Check if secrets are properly configured
  checkSecrets() {
    log.info('Checking security secrets...');
    
    const requiredSecrets = ['JWT_SECRET', 'COOKIE_SECRET'];
    const weakSecrets = ['supersecret', 'secret', 'password', '123456'];
    
    for (const secret of requiredSecrets) {
      const value = process.env[secret];
      
      if (!value) {
        this.errors.push(`${secret} is not set`);
        continue;
      }
      
      // Check for weak secrets
      if (weakSecrets.some(weak => value.toLowerCase().includes(weak.toLowerCase()))) {
        this.errors.push(`${secret} contains weak/default values`);
        continue;
      }
      
      // Check minimum length (should be at least 32 characters for good entropy)
      if (value.length < 32) {
        this.warnings.push(`${secret} is shorter than recommended (32+ characters)`);
      }
      
      // Check if it looks like a proper random hex string
      if (!/^[a-f0-9]{64,}$/i.test(value)) {
        this.warnings.push(`${secret} doesn't appear to be a cryptographically secure hex string`);
      } else {
        this.passed++;
        log.success(`${secret} is properly configured`);
      }
    }
  }

  // Check database configuration
  checkDatabase() {
    log.info('Checking database configuration...');
    
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      this.errors.push('DATABASE_URL is not set');
      return;
    }
    
    // Check for SSL in production
    if (process.env.NODE_ENV === 'production') {
      if (!dbUrl.includes('sslmode=require') && !dbUrl.includes('ssl=true')) {
        this.warnings.push('Database connection should use SSL in production');
      }
    }
    
    // Check for weak database credentials
    if (dbUrl.includes('password') || dbUrl.includes('123456') || dbUrl.includes('admin')) {
      this.warnings.push('Database URL might contain weak credentials');
    }
    
    this.passed++;
    log.success('Database configuration checked');
  }

  // Check CORS configuration
  checkCORS() {
    log.info('Checking CORS configuration...');
    
    const corsOrigin = process.env.CORS_ORIGIN;
    
    if (!corsOrigin && process.env.NODE_ENV === 'production') {
      this.warnings.push('CORS_ORIGIN not set for production');
      return;
    }
    
    if (corsOrigin) {
      const origins = corsOrigin.split(',');
      
      // Check for localhost in production
      if (process.env.NODE_ENV === 'production') {
        const hasLocalhost = origins.some(origin => 
          origin.includes('localhost') || origin.includes('127.0.0.1')
        );
        
        if (hasLocalhost) {
          this.errors.push('CORS origins contain localhost in production environment');
        }
      }
      
      // Check for wildcard origins
      if (origins.includes('*')) {
        this.errors.push('CORS origins should not use wildcard (*) in production');
      }
    }
    
    this.passed++;
    log.success('CORS configuration checked');
  }

  // Check file permissions
  checkFilePermissions() {
    log.info('Checking file permissions...');
    
    const sensitiveFiles = [
      '.env',
      '.env.production', 
      '.env.local',
      'production.env.template'
    ];
    
    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const mode = stats.mode & parseInt('777', 8);
        
        // Check if file is readable by others
        if (mode & parseInt('044', 8)) {
          this.warnings.push(`${file} is readable by group/others (permissions: ${mode.toString(8)})`);
        }
      }
    }
    
    this.passed++;
    log.success('File permissions checked');
  }

  // Check for sensitive data in config files
  checkConfigFiles() {
    log.info('Checking configuration files for sensitive data...');
    
    const configFiles = [
      'medusa-config.js',
      'vercel.json',
      'railway.toml'
    ];
    
    const sensitivePatterns = [
      /supersecret/gi,
      /password.*=.*['"]\w+['"]/gi,
      /secret.*=.*['"]\w+['"]/gi,
      /key.*=.*['"]\w+['"]/gi
    ];
    
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of sensitivePatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.warnings.push(`${file} might contain hardcoded sensitive data: ${matches[0]}`);
          }
        }
      }
    }
    
    this.passed++;
    log.success('Configuration files checked');
  }

  // Check Node.js security settings
  checkNodeSecurity() {
    log.info('Checking Node.js security settings...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      this.warnings.push(`Node.js version ${nodeVersion} is outdated. Consider upgrading to v18+`);
    }
    
    // Check for security-related environment variables
    const securityVars = {
      'NODE_ENV': 'production',
      'NODE_OPTIONS': '--max-old-space-size'
    };
    
    for (const [varName, expectedValue] of Object.entries(securityVars)) {
      const value = process.env[varName];
      if (varName === 'NODE_ENV' && value !== expectedValue) {
        this.warnings.push(`${varName} should be set to '${expectedValue}' in production`);
      }
    }
    
    this.passed++;
    log.success('Node.js security settings checked');
  }

  // Generate security report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 SECURITY VALIDATION REPORT');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success(`All ${this.passed} security checks passed! 🎉`);
      console.log('\n✅ Your application is ready for production deployment.');
      return true;
    }
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.red}CRITICAL ISSUES (${this.errors.length}):${colors.reset}`);
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}WARNINGS (${this.warnings.length}):${colors.reset}`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    console.log(`\n📊 Summary: ${this.passed} passed, ${this.warnings.length} warnings, ${this.errors.length} errors`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ DEPLOYMENT BLOCKED: Fix critical issues before deploying to production.');
      return false;
    }
    
    console.log('\n⚠️  Review warnings and fix them when possible.');
    return true;
  }

  // Run all security checks
  runAllChecks() {
    console.log('🔐 Starting security validation...\n');
    
    this.checkSecrets();
    this.checkDatabase();
    this.checkCORS();
    this.checkFilePermissions();
    this.checkConfigFiles();
    this.checkNodeSecurity();
    
    return this.generateReport();
  }
}

// Main execution
if (require.main === module) {
  const checker = new SecurityChecker();
  const passed = checker.runAllChecks();
  
  process.exit(passed ? 0 : 1);
}

module.exports = SecurityChecker;
