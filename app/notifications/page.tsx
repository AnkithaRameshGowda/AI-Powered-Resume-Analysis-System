"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Bell, CheckCircle, XCircle, User } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

interface Notification {
  id: string;
  type: "application" | "status";
  jobTitle: string;
  company: string;
  status?: "accepted" | "rejected" | "pending";
  jobId: string;
  applicantName?: string;
  timestamp: string;
  timestamp_readable?: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/notifications');
        if (response.data && response.data.notifications) {
          // Deduplicate by id
          const seen = new Set();
          const unique = response.data.notifications.filter((n: Notification) => {
            if (seen.has(n.id)) return false;
            seen.add(n.id);
            return true;
          });
          setNotifications(unique);
        }
      } catch (err) {
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchNotifications();
  }, [user]);

  const getNotificationText = (notification: Notification) => {
    const jobName = notification.jobTitle && notification.jobTitle !== 'Job' && notification.jobTitle !== ''
      ? notification.jobTitle
      : "a job";

    if (notification.type === "application") {
      const applicantPart = notification.applicantName ? ` from ${notification.applicantName}` : '';
      return `New application${applicantPart} for ${jobName}`;
    }
    return `Application ${notification.status || "updated"} for ${jobName}`;
  };

  const getHref = (notification: Notification) => {
    if (!notification.jobId || notification.jobId === 'undefined') return "#";
    return notification.type === "application"
      ? `/job/${notification.jobId}/manage`
      : `/job/${notification.jobId}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg text-red-800">
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-10">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              {user?.role === 'recruiter'
                ? "You'll receive notifications when applicants apply to your jobs."
                : "You'll receive notifications when recruiters update your application status."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Link key={notification.id} href={getHref(notification)}>
                <Card className="hover:bg-accent transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        {notification.type === "application" ? (
                          <User className="h-5 w-5" />
                        ) : notification.status === "accepted" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : notification.status === "rejected" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{getNotificationText(notification)}</h3>
                            <p className="text-sm text-muted-foreground">{notification.company || ""}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp_readable || notification.timestamp || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <NavigationBar />
    </div>
  );
}