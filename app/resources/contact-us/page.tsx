"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageSquare, Loader2, CheckCircle } from "lucide-react";

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setResponseMessage(data.message || 'Message sent!');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setResponseMessage(data.error || 'Failed to send message');
      }
    } catch {
      setStatus('error');
      setResponseMessage('Network error. Please try again.');
    }
  };
  return (
    <main className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have questions or need help? We&apos;re here for you.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="bg-card border rounded-md p-8">
            <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
            
            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-4">{responseMessage}</p>
                <Button variant="outline" onClick={() => setStatus('idle')}>Send Another</Button>
              </div>
            ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background" 
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background" 
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                <select 
                  id="subject" 
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership Opportunity</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                <textarea 
                  id="message" 
                  rows={5} 
                  required
                  minLength={10}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background" 
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              {status === 'error' && (
                <p className="text-sm text-destructive">{responseMessage}</p>
              )}
              
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
            )}
          </div>
          
          <div className="space-y-8">
            <div className="bg-card border rounded-md p-8">
              <h2 className="text-2xl font-semibold mb-6">Get in touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="font-medium">Email Us</div>
                    <a href="mailto:itisaddy7@gmail.com" className="text-primary hover:underline">itisaddy7@gmail.com</a>
                    <p className="text-sm text-muted-foreground mt-1">We respond to emails within 24 hours on business days.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="font-medium">Live Chat</div>
                    <p className="text-muted-foreground mt-1">Our support team is available Monday-Friday from 9am to 5pm IST.</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card border rounded-md p-8">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">How do I reset my password?</h3>
                  <p className="text-sm text-muted-foreground">Visit the login page and click on &quot;Forgot Password&quot; to receive reset instructions.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Is my financial data secure?</h3>
                  <p className="text-sm text-muted-foreground">Yes, we use bank-level encryption to protect all your data.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Can I cancel my subscription?</h3>
                  <p className="text-sm text-muted-foreground">Yes, you can cancel your subscription anytime from your account settings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
