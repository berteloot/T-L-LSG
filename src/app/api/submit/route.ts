import { NextRequest, NextResponse } from 'next/server';
import { scoreAnswers, type Answers, type ScoreResult } from '@/lib/scoring';
import { buildReportPrompt } from '@/lib/prompt';
import { PrismaClient } from '@prisma/client';
import { convertMarkdownToSafeHTML } from '@/lib/sanitizer';
import { z } from 'zod';


// SECURITY: Comprehensive input validation schemas
const submitRequestSchema = z.object({
  email: z.string().email('Invalid email format').max(254, 'Email too long'),
  company: z.string().min(1, 'Company name required').max(100, 'Company name too long'),
  consent: z.boolean().refine(val => val === true, 'Consent is required'),
  
  // Context fields (optional)
  sector: z.string().optional(),
  region: z.string().optional(),
  
  // Assessment questions - using actual question IDs from frontend
  company_roles: z.array(z.string()).min(1, 'At least one selection required').max(8, 'Too many selections'),
  primary_focus: z.string().min(1, 'Please select an option'),
  operational_footprint: z.string().min(1, 'Please select an option'),
  company_size: z.string().min(1, 'Please select an option'),
  improvement_areas: z.array(z.string()).min(1, 'At least one selection required').max(9, 'Too many selections'),
  pressure_areas: z.array(z.string()).min(1, 'At least one selection required').max(6, 'Too many selections'),
  system_count: z.string().min(1, 'Please select an option'),
  performance_tracking: z.string().min(1, 'Please select an option'),
  leadership_views: z.string().min(1, 'Please select an option'),
  ai_concerns: z.record(z.string()).optional(), // Ranking data
  business_goal: z.string().optional(),
  guided_support: z.string().optional(),
}).strict(); // Reject any additional properties

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 3; // Max 3 submissions per 15 minutes per IP

// In-memory rate limiting store (use Redis in production)
const submissionRateLimitStore = new Map<string, { count: number; resetTime: number }>();

const prisma = new PrismaClient();

/**
 * Check rate limiting for submissions
 */
function checkSubmissionRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = submissionRateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    submissionRateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (record.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Clean up expired rate limit records
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, record] of submissionRateLimitStore.entries()) {
    if (now > record.resetTime) {
      submissionRateLimitStore.delete(ip);
    }
  }
}

// Clean up expired records every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkSubmissionRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // SECURITY: Check request size limit
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10000) { // 10KB limit
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    // Check for required environment variables
    const requiredEnvVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars);
      return NextResponse.json(
        { 
          error: 'Server configuration incomplete. Please contact support.',
          details: `Missing: ${missingVars.join(', ')}`
        },
        { status: 500 }
      );
    }

    // SECURITY: Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // SECURITY: Validate input with Zod schema
    const validationResult = submitRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Input validation failed:', validationResult.error.issues);
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: validationResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        },
        { status: 400 }
      );
    }

    const { email, company, consent, ...answers } = validationResult.data;

    // SECURITY: Additional business logic validation
    if (!consent) {
      return NextResponse.json(
        { error: 'Consent is required to proceed' },
        { status: 400 }
      );
    }

    // Map answers directly to scoring format (no need for q1-q9 mapping)
    const mappedAnswers: Answers = {
      company_roles: answers.company_roles,
      primary_focus: answers.primary_focus,
      operational_footprint: answers.operational_footprint,
      company_size: answers.company_size,
      improvement_areas: answers.improvement_areas,
      pressure_areas: answers.pressure_areas,
      system_count: answers.system_count,
      performance_tracking: answers.performance_tracking,
      leadership_views: answers.leadership_views,
      company_name: company,
      email: email,
    };

    // SECURITY: Validate answer values are within expected ranges
    const totalScore = scoreAnswers(mappedAnswers);
    if (totalScore.score < 0 || totalScore.score > totalScore.maxScore) {
      console.error('Score validation failed:', totalScore);
      return NextResponse.json(
        { error: 'Invalid assessment data' },
        { status: 400 }
      );
    }

    // Generate AI report using OpenAI
    let aiReport = '';
    try {
      const prompt = buildReportPrompt(totalScore, mappedAnswers);
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert operations and CX transformation consultant. Generate professional, actionable AI Readiness Quick Check reports.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json();
        aiReport = openaiData.choices[0]?.message?.content || 'Unable to generate AI report';
      } else {
        console.error('OpenAI API error:', await openaiResponse.text());
        aiReport = 'AI report generation temporarily unavailable';
      }
    } catch (openaiError) {
      console.error('OpenAI integration error:', openaiError);
      aiReport = 'AI report generation temporarily unavailable';
    }

    // Send email via SendGrid
    let emailSent = false;
    try {
      console.log('Attempting to send email via SendGrid...');
      console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Present' : 'Missing');
      console.log('From Email:', process.env.SENDGRID_FROM_EMAIL || 'reports@yourdomain.com');
      console.log('To Email:', email);
      
      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email, name: `${company} Team` }],
              subject: `Lean Solutions Group T&L AI Readiness Quick Check Report - ${company}`,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'reports@yourdomain.com',
            name: process.env.SENDGRID_FROM_NAME || 'AI Readiness Quick Check Reports',
          },
          content: [
            {
              type: 'text/plain',
              value: generateEmailText(totalScore, aiReport, mappedAnswers, company),
            },
            {
              type: 'text/html',
              value: generateEmailHTML(totalScore, aiReport, mappedAnswers, company),
            },
          ],
        }),
      });

      console.log('SendGrid Response Status:', emailResponse.status);
      console.log('SendGrid Response Headers:', Object.fromEntries(emailResponse.headers.entries()));

      if (emailResponse.ok) {
        emailSent = true;
        console.log('Email sent successfully to:', email);
      } else {
        const errorText = await emailResponse.text();
        console.error('SendGrid API error response:', errorText);
        console.error('SendGrid API error status:', emailResponse.status);
      }
    } catch (emailError) {
      console.error('SendGrid integration error:', emailError);
    }

    // Store submission in PostgreSQL database
    try {
      const submission = await prisma.submission.create({
        data: {
          user: {
            connectOrCreate: {
              where: { email },
              create: { email }
            }
          },
          company,
          answers: answers, // Store the raw answers from validation
          score: totalScore.score,
          tier: mapTier(totalScore.tier),
          aiReport,
          painPoints: extractPainPoints(mappedAnswers),
          emailedAt: emailSent ? new Date() : null,
          emailStatus: emailSent ? 'SENT' : 'FAILED'
        }
      });
      
      console.log('Submission saved to database:', submission.id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with email sending even if storage fails
    }

    // Return the calculated score, AI report, and email status
    return NextResponse.json({
      success: true,
      result: totalScore,
      aiReport,
      emailSent,
      message: emailSent 
        ? 'Assessment completed successfully! AI report generated and sent to your email.'
        : 'Assessment completed successfully! AI report generated. Email delivery issue - please contact support.',
      email: email
    });

  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// SECURITY: Using secure sanitizer instead of vulnerable local function

function mapTier(tier: string): 'NOT_READY' | 'GETTING_STARTED' | 'AI_ENHANCED' {
  switch (tier) {
    case 'Foundation Stage':
      return 'NOT_READY';
    case 'Developing':
      return 'GETTING_STARTED';
    case 'AI-Enhanced':
      return 'AI_ENHANCED';
    default:
      return 'NOT_READY';
  }
}

function extractPainPoints(answers: Answers): string[] {
  const painPoints: string[] = [];
  
  // Simple logic based on answer values
  // company_roles: Technology Infrastructure
  const company_roles = answers.company_roles;
  if (company_roles && (company_roles.includes('none') || company_roles.length === 0)) {
    painPoints.push('Technology Infrastructure');
  }
  
  // primary_focus: Data Foundation
  const primary_focus = answers.primary_focus;
  if (primary_focus && ['separate_systems', 'no_centralized'].includes(primary_focus)) {
    painPoints.push('Data Foundation');
  }
  
  // operational_footprint: Human Capital
  const operational_footprint = answers.operational_footprint;
  if (operational_footprint && ['no_training_open', 'resistant'].includes(operational_footprint)) {
    painPoints.push('Human Capital');
  }
  
  // company_size: Strategic Planning
  const company_size = answers.company_size;
  if (company_size && ['limited_scaling', 'no_scalability'].includes(company_size)) {
    painPoints.push('Strategic Planning');
  }
  
  // improvement_areas: Measurement & Analytics
  const improvement_areas = answers.improvement_areas;
  if (improvement_areas && (improvement_areas.includes('none') || improvement_areas.length === 0)) {
    painPoints.push('Measurement & Analytics');
  }
  
  // pressure_areas: Risk Management
  const pressure_areas = answers.pressure_areas;
  if (pressure_areas && (pressure_areas.includes('none') || pressure_areas.length === 0)) {
    painPoints.push('Risk Management');
  }
  
  // system_count: Organizational Support
  const system_count = answers.system_count;
  if (system_count && ['interest_no_budget', 'limited_engagement'].includes(system_count)) {
    painPoints.push('Organizational Support');
  }
  
  return painPoints;
}

function generateEmailHTML(result: ScoreResult, aiReport: string, answers: Answers, company: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lean Solutions Group AI Readiness Quick Check Report</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #0099FF 0%, #006EF2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .company-name { 
          font-size: 20px; 
          font-weight: 600; 
          color: #001F38; 
          margin-bottom: 20px;
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 8px;
          border: 1px solid #0099FF;
        }
        .score-card { 
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #0099FF; 
          border-radius: 12px; 
          padding: 30px; 
          margin: 25px 0; 
          text-align: center; 
          box-shadow: 0 4px 14px 0 rgba(0, 153, 255, 0.15);
        }
        .score { 
          font-size: 56px; 
          font-weight: 800; 
          color: #0099FF; 
          margin-bottom: 10px;
          line-height: 1;
        }
        .score-subtitle {
          font-size: 18px;
          color: #6c757d;
          margin-bottom: 15px;
        }
        .tier { 
          font-size: 28px; 
          color: #006EF2; 
          font-weight: 700;
          margin: 0;
        }
        .breakdown { 
          background: white; 
          border: 1px solid #dee2e6; 
          border-radius: 12px; 
          padding: 25px; 
          margin: 25px 0; 
        }
        .breakdown h3 {
          margin: 0 0 20px 0;
          color: #495057;
          font-size: 20px;
          font-weight: 600;
        }
        .section { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin: 12px 0; 
          padding: 12px 0; 
          border-bottom: 1px solid #e9ecef; 
        }
        .section:last-child {
          border-bottom: none;
        }
        .section-name {
          font-weight: 500;
          color: #495057;
        }
        .section-score {
          font-weight: 700;
          color: #0099FF;
          font-size: 16px;
        }
        .ai-report { 
          background: #f8f9fa; 
          border-left: 4px solid #0099FF; 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 0 8px 8px 0;
        }
        .ai-report h3 {
          margin: 0 0 20px 0;
          color: #495057;
          font-size: 20px;
          font-weight: 600;
        }
        .ai-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #495057;
          white-space: pre-wrap;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          padding: 25px; 
          color: #001F38; 
          font-size: 14px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-top: 2px solid #0099FF;
        }
        .footer p {
          margin: 8px 0;
        }
        @media (max-width: 600px) {
          body { padding: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 20px; }
          .score { font-size: 48px; }
          .tier { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>T&L - AI Readiness Quick Check Report</h1>
          <p>Your personalized analysis and roadmap for AI transformation</p>
        </div>

        <div class="content">
          <div class="company-name">Company: ${company}</div>

          <div class="score-card">
            <div class="score">${result.score}</div>
            <div class="score-subtitle">out of ${result.maxScore} points</div>
            <div class="tier">${result.tier}</div>
          </div>

          <div class="breakdown">
            <h3>Score Breakdown by Section</h3>
            ${Object.keys(result.breakdown).length > 0 ? 
              Object.entries(result.breakdown).map(([key, score]) => `
                <div class="section">
                  <span class="section-name">${getSectionName(key)}</span>
                  <span class="section-score">${score}/${getMaxScore(key)}</span>
                </div>
              `).join('') : 
              '<div class="section"><span class="section-name">No breakdown data available</span></div>'
            }
          </div>

          <div class="ai-report">
            <h3>AI-Generated Analysis & Recommendations</h3>
            <div class="ai-content">
              ${convertMarkdownToSafeHTML(aiReport)}
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Report generated on ${new Date().toLocaleDateString()}</strong></p>
          <p>For questions or support, please contact Lean Solutions Group</p>
          <p>This quick check was powered by advanced AI analysis</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(result: ScoreResult, aiReport: string, answers: Answers, company: string): string {
  // Convert markdown to plain text for email
  const plainTextReport = aiReport
    .replace(/^#+\s*/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\n\n/g, '\n\n') // Keep paragraph breaks
    // Clean up citations to only show organization names, not full URLs
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links but keep text
    .replace(/https?:\/\/[^\s]+/g, '') // Remove any remaining URLs
    .trim();

  return `
LEAN SOLUTIONS GROUP - T&L - AI READINESS QUICK CHECK REPORT
====================================================

Company: ${company}
Assessment Date: ${new Date().toLocaleDateString()}

YOUR RESULTS
-----------
Total Score: ${result.score} out of ${result.maxScore} points
Readiness Tier: ${result.tier}

SCORE BREAKDOWN BY SECTION
-------------------------
${Object.keys(result.breakdown).length > 0 ? 
  Object.entries(result.breakdown).map(([key, score]) => `• ${getSectionName(key)}: ${score}/${getMaxScore(key)} points`).join('\n') : 
  '• No breakdown data available'
}

AI-GENERATED ANALYSIS & RECOMMENDATIONS
======================================
${plainTextReport}

---
This report was generated by Lean Solutions Group's AI Readiness Quick Check.
For questions or support, please contact us.

Powered by advanced AI analysis and industry expertise.
  `.trim();
}

function getSectionName(key: string): string {
  const sectionNames: Record<string, string> = {
    s1: 'Technology Infrastructure',
    s2: 'Data Foundation',
    s3: 'Human Capital',
    s4: 'Strategic Planning',
    s5: 'Measurement & Analytics',
    s6: 'Risk Management',
    s7: 'Organizational Support'
  };
  return sectionNames[key] || key;
}

function getMaxScore(key: string): number {
  const maxScores: Record<string, number> = {
    s1: 16,
    s2: 4,
    s3: 4,
    s4: 4,
    s5: 9,
    s6: 12,
    s7: 4
  };
  return maxScores[key] || 0;
}
