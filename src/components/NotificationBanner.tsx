"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Settings, X, ChevronDown } from "lucide-react";
import {
  DueDateAlert,
  NotificationSettingData,
  saveNotificationSetting,
} from "@/actions/notification";

interface NotificationBannerProps {
  alerts: DueDateAlert[];
  initialSetting: NotificationSettingData;
}

/** 마감일 알림 배너 */
export function NotificationBanner({
  alerts: initialAlerts,
  initialSetting,
}: NotificationBannerProps) {
  const [setting, setSetting] = useState(initialSetting);
  const [showSettings, setShowSettings] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(initialAlerts.length > 0);

  const visibleAlerts = initialAlerts.filter(
    (a) => !dismissed.has(a.itemId) && setting.enabled
  );

  const handleToggleEnabled = useCallback(async () => {
    const next = { ...setting, enabled: !setting.enabled };
    setSetting(next);
    await saveNotificationSetting(next);
  }, [setting]);

  const handleDaysChange = useCallback(
    async (days: number) => {
      const next = { ...setting, daysBefore: days };
      setSetting(next);
      await saveNotificationSetting(next);
    },
    [setting]
  );

  const handleDismiss = useCallback((itemId: string) => {
    setDismissed((prev) => new Set([...prev, itemId]));
  }, []);

  if (!setting.enabled && visibleAlerts.length === 0) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
              <BellOff className="size-5" />
              알림 꺼짐
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleEnabled}
              className="text-xs"
            >
              알림 켜기
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className={
        visibleAlerts.length > 0
          ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
          : ""
      }
    >
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell
              className={`size-5 ${
                visibleAlerts.length > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-primary"
              }`}
            />
            마감일 알림
            {visibleAlerts.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
              >
                {visibleAlerts.length}건
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
            >
              <Settings className="size-4 text-muted-foreground" />
            </Button>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {showSettings && (
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/60 p-3 mb-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  알림 기준
                </label>
                <select
                  value={setting.daysBefore}
                  onChange={(e) =>
                    handleDaysChange(parseInt(e.target.value))
                  }
                  className="border-input bg-background text-foreground h-7 rounded-md border px-2 text-xs shadow-xs outline-none"
                >
                  <option value={1}>1일 전</option>
                  <option value={3}>3일 전</option>
                  <option value={5}>5일 전</option>
                  <option value={7}>7일 전</option>
                  <option value={14}>14일 전</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleToggleEnabled}
              >
                {setting.enabled ? (
                  <>
                    <BellOff className="size-3" /> 끄기
                  </>
                ) : (
                  <>
                    <Bell className="size-3" /> 켜기
                  </>
                )}
              </Button>
            </div>
          )}

          {visibleAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {setting.daysBefore}일 이내 마감인 항목이 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {visibleAlerts.map((alert) => (
                <div
                  key={alert.itemId}
                  className="flex items-center justify-between rounded-md border border-amber-200 dark:border-amber-800 bg-white dark:bg-background px-3 py-2"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm truncate">{alert.itemLabel}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {alert.categoryTitle}
                      </span>
                      <Badge
                        variant={alert.daysLeft <= 1 ? "destructive" : "secondary"}
                        className="text-[10px]"
                      >
                        {alert.daysLeft === 0
                          ? "오늘 마감"
                          : `D-${alert.daysLeft}`}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-6 p-0 shrink-0 text-muted-foreground"
                    onClick={() => handleDismiss(alert.itemId)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
