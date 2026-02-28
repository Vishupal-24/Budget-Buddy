"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface QuotaStatusCardProps {
  quotaError: string | null;
  quotaStatus: any;
  onRefreshStatus: () => void;
}

export function QuotaStatusCard({ quotaError, quotaStatus, onRefreshStatus }: QuotaStatusCardProps) {
  if (!quotaError) return null;

  return (
    <Card className="mb-4 border-border bg-muted dark:border-border dark:bg-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground dark:text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          API Quota Limit Reached
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground dark:text-foreground mb-3">{quotaError}</p>
        {quotaStatus && (
          <div className="text-sm text-foreground dark:text-foreground">
            <p>Current usage: {quotaStatus.status?.usage}</p>
            <p>Quota resets in: {quotaStatus.status?.timeUntilReset}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshStatus}
          className="border-border text-foreground hover:bg-muted dark:border-border dark:text-foreground dark:hover:bg-muted"
        >
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  );
}
