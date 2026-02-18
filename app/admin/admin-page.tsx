"use client";

import { useState } from "react";
import styles from "./admin.module.scss";

interface UserData {
  email: string;
  name: string;
  image: string;
  createdAt: string;
}

interface ActivityData {
  email: string;
  event: string;
  timestamp: string;
}

interface AdminPageProps {
  users: UserData[];
  activities: ActivityData[];
}

export function AdminPage({ users, activities }: AdminPageProps) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const activitiesByEmail = activities.reduce(
    (acc, a) => {
      if (!acc[a.email]) acc[a.email] = [];
      acc[a.email].push(a);
      return acc;
    },
    {} as Record<string, ActivityData[]>,
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.subtitle}>
        {users.length} user{users.length !== 1 ? "s" : ""} registered
      </p>

      <div className={styles.userList}>
        {users.map((user) => {
          const isExpanded = expandedEmail === user.email;
          const userActivities = activitiesByEmail[user.email] || [];

          return (
            <div key={user.email} className={styles.userCard}>
              <div
                className={styles.userRow}
                onClick={() =>
                  setExpandedEmail(isExpanded ? null : user.email)
                }
              >
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name}
                    className={styles.avatar}
                  />
                )}
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
                <div className={styles.userMeta}>
                  <span className={styles.badge}>
                    {userActivities.length} events
                  </span>
                  <span className={styles.date}>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={styles.chevron}>
                  {isExpanded ? "\u25B2" : "\u25BC"}
                </span>
              </div>

              {isExpanded && (
                <div className={styles.activitySection}>
                  {userActivities.length === 0 ? (
                    <p className={styles.noActivity}>No activity recorded</p>
                  ) : (
                    <table className={styles.activityTable}>
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Timestamp (UTC)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userActivities.map((a, i) => (
                          <tr key={i}>
                            <td>
                              <span
                                className={`${styles.eventBadge} ${
                                  a.event === "login"
                                    ? styles.login
                                    : styles.logout
                                }`}
                              >
                                {a.event}
                              </span>
                            </td>
                            <td>
                              {new Date(a.timestamp).toLocaleString("en-US", {
                                timeZone: "UTC",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
