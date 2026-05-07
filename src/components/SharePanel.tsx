"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Check, X, Trash2, ChevronDown } from "lucide-react";
import {
  ShareInfo,
  invitePartner,
  acceptInvite,
  rejectInvite,
  removeShare,
} from "@/actions/share";

interface SharePanelProps {
  initialShares: ShareInfo[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "대기중",
  accepted: "수락됨",
  rejected: "거절됨",
};

/** 파트너 공유 패널 */
export function SharePanel({ initialShares }: SharePanelProps) {
  const [shares, setShares] = useState<ShareInfo[]>(initialShares);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const acceptedCount = shares.filter((s) => s.status === "accepted").length;
  const pendingCount = shares.filter((s) => s.status === "pending").length;

  const handleInvite = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!email.trim()) return;

      setLoading(true);
      try {
        const share = await invitePartner(email);
        setShares((prev) => [...prev.filter((s) => s.id !== share.id), share]);
        setEmail("");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "초대 실패");
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const handleAccept = useCallback(async (shareId: string) => {
    await acceptInvite(shareId);
    setShares((prev) =>
      prev.map((s) => (s.id === shareId ? { ...s, status: "accepted" } : s))
    );
  }, []);

  const handleReject = useCallback(async (shareId: string) => {
    await rejectInvite(shareId);
    setShares((prev) =>
      prev.map((s) => (s.id === shareId ? { ...s, status: "rejected" } : s))
    );
  }, []);

  const handleRemove = useCallback(async (shareId: string) => {
    await removeShare(shareId);
    setShares((prev) => prev.filter((s) => s.id !== shareId));
  }, []);

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-5 text-primary" />
            파트너 공유
          </CardTitle>
          <div className="flex items-center gap-2">
            {acceptedCount > 0 && (
              <Badge variant="default" className="text-xs">
                {acceptedCount}명 연결됨
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pendingCount}건 대기
              </Badge>
            )}
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="파트너 이메일 입력..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground h-9 flex-1 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button type="submit" size="sm" disabled={loading || !email.trim()}>
              <Plus className="size-4" />
              초대
            </Button>
          </form>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {shares.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              아직 공유된 파트너가 없습니다.
              <br />
              파트너의 이메일을 입력하여 초대해보세요.
            </p>
          ) : (
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{share.partnerEmail}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          share.status === "accepted"
                            ? "default"
                            : share.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {STATUS_LABELS[share.status]}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {share.isOwner ? "내가 초대함" : "나를 초대함"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!share.isOwner && share.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 text-green-600 hover:text-green-700"
                          onClick={() => handleAccept(share.id)}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 text-destructive"
                          onClick={() => handleReject(share.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
                    {share.isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(share.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
