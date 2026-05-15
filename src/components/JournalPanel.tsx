"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntryDTO,
} from "@/actions/journal";

interface JournalPanelProps {
  initialEntries: JournalEntryDTO[];
}

/** 날짜를 한국어 포맷으로 변환 */
function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")} (${weekdays[dt.getDay()]})`;
}

/** 오늘 날짜를 YYYY-MM-DD로 반환 */
function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 준비 일지 패널 */
export function JournalPanel({ initialEntries }: JournalPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<JournalEntryDTO[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState(todayString);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = useCallback(async () => {
    const trimmed = newContent.trim();
    if (!trimmed || !newDate) return;

    setSaving(true);
    try {
      const entry = await addJournalEntry(newDate, trimmed);
      setEntries((prev) => [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      setNewContent("");
      setNewDate(todayString());
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }, [newDate, newContent]);

  const handleUpdate = useCallback(
    async (id: string) => {
      const trimmed = editContent.trim();
      if (!trimmed) return;

      setSaving(true);
      try {
        const updated = await updateJournalEntry(id, trimmed);
        setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        setEditingId(null);
      } finally {
        setSaving(false);
      }
    },
    [editContent]
  );

  const handleDelete = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await deleteJournalEntry(id);
  }, []);

  const handleStartEdit = useCallback((entry: JournalEntryDTO) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  }, []);

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            준비 일지
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {entries.length}개 기록
            </Badge>
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
          {/* 추가 버튼 또는 입력 폼 */}
          {showForm ? (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="오늘의 준비 과정을 기록해 보세요..."
                rows={3}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none resize-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setNewContent("");
                  }}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  disabled={!newContent.trim() || !newDate || saving}
                  onClick={handleAdd}
                >
                  <Check className="size-3.5" />
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              <Plus className="size-3.5" />
              새 일지 작성
            </Button>
          )}

          {/* 엔트리 목록 */}
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              아직 기록이 없어요. 첫 일지를 작성해 보세요!
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="relative rounded-lg border border-border/60 p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatKoreanDate(entry.date)}
                    </span>
                    <div className="flex items-center gap-1">
                      {editingId !== entry.id && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(entry)}
                            aria-label="수정"
                            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            aria-label="삭제"
                            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === entry.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none resize-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate(entry.id)}
                          disabled={!editContent.trim() || saving}
                          className="inline-flex size-7 items-center justify-center rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                        >
                          <Check className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
