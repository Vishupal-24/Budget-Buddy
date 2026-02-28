import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const VALID_SUBJECTS = ['general', 'support', 'billing', 'feedback', 'partnership'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required (min 2 characters)' }, { status: 400 });
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!subject || !VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: 'Valid subject is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message is required (min 10 characters)' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject,
        message: message.trim(),
      });

    if (error) {
      console.error('Contact form submission error:', error);
      return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Message sent successfully! We\'ll get back to you soon.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
