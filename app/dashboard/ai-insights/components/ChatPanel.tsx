"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Volume2, VolumeX, BarChart3, Sparkles, MessageCircle, DollarSign, Lightbulb, Target } from "lucide-react";
import { AIMessage, AIModelConfig, FinancialInsight, AIProvider } from "@/lib/ai";
import { AIProviderModelSelector } from "./AIProviderModelSelector";
import { VoiceInterface } from "./VoiceInterface";
import { TypingIndicator } from "./TypingIndicator";
import { InsightMessage } from "./InsightMessage";
import { MessageRenderer } from "./MessageRenderer";
import "./chat-overflow-fixes.css";

interface ChatPanelProps {
  readonly messages: AIMessage[];
  readonly loading: boolean;
  readonly currentModelConfig: AIModelConfig;
  readonly availableProviders: AIProvider[];
  readonly availableModels: Record<string, any[]>;
  readonly loadingModels: Record<string, boolean>;
  readonly insights?: FinancialInsight[];
  readonly onSendMessageAction: (message: string) => Promise<string | null> | void;
  readonly onModelConfigChangeAction: (provider: AIProvider, model: string) => void;
  readonly onRequestInsights?: () => void;
  readonly className?: string;
}

export function ChatPanel({ 
  messages, 
  loading, 
  currentModelConfig,
  availableProviders,
  availableModels,
  loadingModels,
  insights = [],
  onSendMessageAction, 
  onModelConfigChangeAction,
  onRequestInsights,
  className = "" 
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speakFunctionRef = useRef<((text: string) => void) | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
    // Fallback: use messagesEndRef if container scroll fails
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
    // Fallback: use messagesStartRef
    setTimeout(() => {
      messagesStartRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle scroll events to show/hide scroll buttons
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isScrollable = container.scrollHeight > container.clientHeight;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      
      setShowScrollButtons(isScrollable);
      setIsNearBottom(isAtBottom);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change with slight delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [messages]);

  // Additional effect to ensure scrolling works after component mounts
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Auto-speak AI responses when enabled
  useEffect(() => {
    if (autoSpeak && messages.length > 0 && speakFunctionRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !loading) {
        speakFunctionRef.current(lastMessage.content);
      }
    }
  }, [messages, autoSpeak, loading]);

  // Handle real-time transcript updates
  const handleTranscriptUpdate = (transcript: string) => {
    setCurrentTranscript(transcript);
  };

  // Handle voice transcript with real-time updates
  const handleVoiceTranscript = (text: string) => {
    setCurrentTranscript("");
    const newMessage = inputMessage + (inputMessage ? ' ' : '') + text;
    setInputMessage(newMessage);
    
    // Auto-send if the transcript seems complete (ends with punctuation)
    if (/[.!?]$/.exec(text.trim())) {
      setTimeout(() => {
        if (!loading) {
          onSendMessageAction(newMessage.trim());
          setInputMessage("");
          setCurrentTranscript("");
        }
      }, 1000); // Wait 1 second for user to add more
    }
  };

  // Handle voice state changes
  const handleVoiceStateChange = (listening: boolean, transcript: string = "") => {
    setIsListening(listening);
    if (!listening) {
      setCurrentTranscript("");
    }
  };

  const handleSpeakTextSetup = (speakFunction: (text: string) => void) => {
    speakFunctionRef.current = speakFunction;
  };

  const handleSend = () => {
    if (inputMessage.trim() && !loading) {
      onSendMessageAction(inputMessage.trim());
      setInputMessage("");
      // Force scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakMessage = (messageContent: string) => {
    if (speakFunctionRef.current) {
      speakFunctionRef.current(messageContent);
    }
  };

  // Filter out system messages for display
  const displayMessages = messages.slice(1);

  return (
    <Card className={`flex flex-col ${className} border chat-container`}>
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="relative">
              <div className="relative w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground">
                AI Financial Assistant
              </div>
              <div className="text-xs text-muted-foreground font-normal">
                Your intelligent finance companion
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-foreground rounded-full mr-1 animate-pulse"></div>
              {currentModelConfig.provider}
            </Badge>
            {onRequestInsights && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestInsights}
                disabled={loading}
                className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Show Insights
              </Button>
            )}
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className="text-xs transition-colors hover:scale-105"
            >
              {autoSpeak ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
              Auto-speak
            </Button>
            <AIProviderModelSelector
              currentProvider={currentModelConfig.provider}
              currentModel={currentModelConfig.model}
              availableProviders={availableProviders}
              availableModels={availableModels}
              loadingModels={loadingModels}
              onChange={onModelConfigChangeAction}
              disabled={loading}
              className="flex-shrink-0"
            />
          </div>
        </div>
        
        {/* Voice Interface */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-center mb-3">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Ask me anything about your finances using voice or text
            </p>
          </div>
          <VoiceInterface
            onTranscriptAction={handleVoiceTranscript}
            onSpeakTextAction={handleSpeakTextSetup}
            onListeningChangeAction={handleVoiceStateChange}
            onTranscriptUpdateAction={handleTranscriptUpdate}
            disabled={loading}
            className="justify-center"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            ref={messagesContainerRef}
            className="overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 sm:space-y-6 chat-messages-area"
            style={{ height: '400px', maxHeight: '400px', scrollBehavior: 'smooth' }}
            onScroll={handleScroll}
          >
            <div ref={messagesStartRef} className="h-0" />
            {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="relative mb-6">
                <div className="relative w-16 h-16 bg-foreground rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-background" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Ready to chat about your finances!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
                I'm your AI financial assistant. Ask me anything about your finances, budgets, spending patterns, 
                or get personalized advice. I can help you make smarter financial decisions.
              </p>
              
              {/* Enhanced Quick Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("Show me my financial insights")}
                  disabled={loading}
                  className="text-xs h-12 bg-muted/30 hover:bg-muted border-border hover:border-border transition-colors group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-foreground" />
                    <span className="font-medium">Financial Insights</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("How much did I spend this month?")}
                  disabled={loading}
                  className="text-xs h-12 bg-muted/30 hover:bg-muted border-border hover:border-border transition-colors group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Monthly Spending</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("Give me budget recommendations")}
                  disabled={loading}
                  className="text-xs h-12 bg-muted/30 hover:bg-muted border-border hover:border-border transition-colors group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Lightbulb className="h-5 w-5" />
                    <span className="font-medium">Budget Tips</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("What are some ways I can save money?")}
                  disabled={loading}
                  className="text-xs h-12 bg-muted/30 hover:bg-muted border-border hover:border-border transition-colors group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">Save Money</span>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((message, index) => {
                const messageKey = `message-${index}-${message.content.slice(0, 20)}`;
                const actionHandler = (action: string, insight: any) => {
                  if (action === 'tell-me-more') {
                    onSendMessageAction(`Tell me more about ${insight.title.toLowerCase()}`);
                  } else if (action === 'take-action') {
                    let actionText = 'improve my budget';
                    if (insight.type === 'saving_suggestion') {
                      actionText = 'save more money';
                    } else if (insight.type === 'budget_warning') {
                      actionText = 'reduce my spending';
                    }
                    onSendMessageAction(`How can I ${actionText}?`);
                  }
                };

                return (
                <div 
                  key={messageKey} 
                  className={`flex gap-2 sm:gap-4 animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-muted flex items-center justify-center  ring-2 ring-primary/20">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`flex-1 min-w-0 max-w-[80%] sm:max-w-[85%] rounded-lg shadow-sm transition-all duration-300  group overflow-hidden message-bubble ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto shadow-primary/20' 
                      : 'bg-card/80 backdrop-blur border border-border/50 shadow-black/5'
                  }`}>
                    <div className="p-4 chat-message-container">
                      {/* Enhanced message rendering */}
                      {message.role === 'assistant' && 
                       insights.length > 0 && 
                       (message.content.toLowerCase().includes('insight') || 
                        message.content.toLowerCase().includes('analysis') ||
                        message.content.toLowerCase().includes('budget') ||
                        message.content.toLowerCase().includes('spending')) ? (
                        <div className="space-y-4 break-words">
                          <InsightMessage 
                            insights={insights}
                            onActionClick={actionHandler}
                          />
                        </div>
                      ) : (
                        <div className="break-words overflow-wrap-anywhere">
                          <MessageRenderer
                            content={message.content}
                            role={message.role as 'user' | 'assistant'}
                            onSpeak={message.role === 'assistant' ? handleSpeakMessage : undefined}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card-foreground/20 flex items-center justify-center  ring-2 ring-muted-foreground/10">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                );
              })}
              {loading && (
                <div className="flex gap-2 sm:gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-muted flex items-center justify-center  ring-2 ring-primary/20">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="bg-card/80 backdrop-blur border border-border/50 rounded-lg p-3 sm:p-4 shadow-sm overflow-hidden">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
          </div>
          
          {/* Scroll Navigation Buttons */}
          {showScrollButtons && (
            <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-20 pointer-events-none">"
              {!isNearBottom && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToBottom}
                  className="h-10 w-10 p-0 rounded-full bg-background/90 border transition-colors pointer-events-auto"
                  title="Scroll to bottom"
                >
                  <svg 
                    className="h-4 w-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                className="h-10 w-10 p-0 rounded-full bg-background/90 border transition-colors pointer-events-auto"
                title="Scroll to top"
              >
                <svg 
                  className="h-4 w-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </Button>
            </div>
          )}
        </div>
        
        {/* Enhanced Input Area */}
        <div className="flex-shrink-0 border-t p-6">
          {/* Voice Listening Feedback */}
          {isListening && (
            <div className="mb-4 flex items-center gap-3 text-sm bg-muted border border-border rounded-lg p-4">
              <div className="relative">
                <div className="w-3 h-3 bg-foreground rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <span className="text-foreground font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Listening for your voice...
                </span>
                {currentTranscript && (
                  <div className="text-muted-foreground italic mt-1 text-xs">
                    "{currentTranscript}"
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Speak clearly..." : "Ask me anything about your finances..."}
                disabled={loading}
                className={`h-12 px-4 text-sm bg-background border transition-colors focus:ring-2 focus:ring-foreground/10 ${
                  isListening 
                    ? "border-foreground/30 bg-muted/30" 
                    : "border-border hover:border-border/80"
                } ${inputMessage.trim() ? "border-foreground/20" : ""}`}
              />
              {/* Enhanced Voice indicator in input */}
              {isListening && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-foreground rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-foreground/80 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-2 bg-foreground/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
            <Button 
              onClick={handleSend} 
              disabled={loading || !inputMessage.trim()}
              size="lg"
              className="h-12 px-6 transition-colors disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span className="text-xs font-medium">Send</span>
                </div>
              )}
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center gap-4">
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to send</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> for new line</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {inputMessage.length > 0 && (
                <span className="text-primary font-medium">{inputMessage.length} chars</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
