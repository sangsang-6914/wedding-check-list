"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  UtensilsCrossed,
} from "lucide-react";
import {
  addGuest,
  updateGuest,
  deleteGuest,
  type GuestDTO,
  type GuestSide,
  type AttendingStatus,
} from "@/actions/guest";

interface GuestPanelProps {
  initialGuests: GuestDTO[];
}

const SIDE_LABEL: Record<GuestSide, string> = { groom: "신랑", bride: "신부" };
const ATTENDING_LABEL: Record<AttendingStatus, string> = {
  pending: "미정",
  yes: "참석",
  no: "불참",
};
const ATTENDING_VARIANT: Record<AttendingStatus, "outline" | "default" | "destructive"> = {
  pending: "outline",
  yes: "default",
  no: "destructive",
};

const DEFAULT_FORM: Omit<GuestDTO, "id"> = {
  name: "",
  side: "groom",
  relation: "",
  attending: "pending",
  plusCount: 0,
  needsMeal: true,
  note: "",
};

/** 하객 명단 관리 패널 */
export function GuestPanel({ initialGuests }: GuestPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [guests, setGuests] = useState<GuestDTO[]>(initialGuests);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterSide, setFilterSide] = useState<"all" | GuestSide>("all");

  const stats = useMemo(() => {
    const attending = guests.filter((g) => g.attending === "yes");
    const mealCount = attending.reduce(
      (sum, g) => sum + (g.needsMeal ? 1 + g.plusCount : 0),
      0
    );
    const totalAttending = attending.reduce((sum, g) => sum + 1 + g.plusCount, 0);
    const groomCount = guests.filter((g) => g.side === "groom").length;
    const brideCount = guests.filter((g) => g.side === "bride").length;
    return { totalAttending, mealCount, groomCount, brideCount };
  }, [guests]);

  const filtered = useMemo(
    () =>
      filterSide === "all"
        ? guests
        : guests.filter((g) => g.side === filterSide),
    [guests, filterSide]
  );

  const handleAdd = useCallback(async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await addGuest(form);
      setGuests((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setForm(DEFAULT_FORM);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleUpdate = useCallback(async () => {
    if (!editingId || !form.name.trim()) return;
    setSaving(true);
    try {
      const updated = await updateGuest(editingId, form);
      setGuests((prev) =>
        prev.map((g) => (g.id === editingId ? updated : g)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      setForm(DEFAULT_FORM);
    } finally {
      setSaving(false);
    }
  }, [editingId, form]);

  const handleDelete = useCallback(async (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    await deleteGuest(id);
  }, []);

  const handleStartEdit = useCallback((guest: GuestDTO) => {
    setEditingId(guest.id);
    setForm({
      name: guest.name,
      side: guest.side,
      relation: guest.relation,
      attending: guest.attending,
      plusCount: guest.plusCount,
      needsMeal: guest.needsMeal,
      note: guest.note,
    });
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(DEFAULT_FORM);
  }, []);

  const handleToggleAttending = useCallback(
    async (guest: GuestDTO) => {
      const next: AttendingStatus =
        guest.attending === "pending"
          ? "yes"
          : guest.attending === "yes"
            ? "no"
            : "pending";
      setGuests((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, attending: next } : g))
      );
      await updateGuest(guest.id, { attending: next });
    },
    []
  );

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-5 text-primary" />
            하객 명단
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {guests.length}명
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
          {/* 요약 통계 */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <p className="text-xs text-muted-foreground">참석 예정</p>
              <p className="text-lg font-bold text-primary">{stats.totalAttending}명</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <UtensilsCrossed className="size-3" /> 식사 인원
              </p>
              <p className="text-lg font-bold text-primary">{stats.mealCount}명</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <p className="text-xs text-muted-foreground">신랑측</p>
              <p className="text-lg font-bold">{stats.groomCount}명</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <p className="text-xs text-muted-foreground">신부측</p>
              <p className="text-lg font-bold">{stats.brideCount}명</p>
            </div>
          </div>

          {/* 필터 */}
          <div className="flex items-center gap-2">
            {(["all", "groom", "bride"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterSide(s);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterSide === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s === "all" ? "전체" : SIDE_LABEL[s]}
              </button>
            ))}
          </div>

          {/* 추가/수정 폼 */}
          {showForm ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="이름 *"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                <input
                  type="text"
                  placeholder="관계 (친구, 직장 등)"
                  value={form.relation}
                  onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
                  className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">측:</span>
                  <select
                    value={form.side}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, side: e.target.value as GuestSide }))
                    }
                    className="border-input bg-background rounded-md border px-2 py-1 text-sm"
                  >
                    <option value="groom">신랑</option>
                    <option value="bride">신부</option>
                  </select>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">참석:</span>
                  <select
                    value={form.attending}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        attending: e.target.value as AttendingStatus,
                      }))
                    }
                    className="border-input bg-background rounded-md border px-2 py-1 text-sm"
                  >
                    <option value="pending">미정</option>
                    <option value="yes">참석</option>
                    <option value="no">불참</option>
                  </select>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">동반:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={form.plusCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        plusCount: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="border-input bg-background rounded-md border px-2 py-1 text-sm w-14"
                  />
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.needsMeal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, needsMeal: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <span className="text-muted-foreground">식사</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="메모 (선택)"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="border-input bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  취소
                </Button>
                <Button
                  size="sm"
                  disabled={!form.name.trim() || saving}
                  onClick={editingId ? handleUpdate : handleAdd}
                >
                  <Check className="size-3.5" />
                  {editingId ? "수정" : "추가"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setForm(DEFAULT_FORM);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <Plus className="size-3.5" />
              하객 추가
            </Button>
          )}

          {/* 하객 리스트 */}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {guests.length === 0
                ? "아직 등록된 하객이 없어요. 하객을 추가해 보세요!"
                : "해당 조건의 하객이 없습니다."}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {guest.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {SIDE_LABEL[guest.side]}
                      </Badge>
                      {guest.relation && (
                        <span className="text-xs text-muted-foreground">
                          {guest.relation}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleToggleAttending(guest)}
                        className="inline-block"
                      >
                        <Badge
                          variant={ATTENDING_VARIANT[guest.attending]}
                          className="text-[10px] cursor-pointer"
                        >
                          {ATTENDING_LABEL[guest.attending]}
                        </Badge>
                      </button>
                      {guest.plusCount > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{guest.plusCount}명
                        </span>
                      )}
                      {guest.needsMeal && (
                        <UtensilsCrossed className="size-3 text-muted-foreground" />
                      )}
                      {guest.note && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {guest.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(guest)}
                      aria-label="수정"
                      className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(guest.id)}
                      aria-label="삭제"
                      className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
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
