"use client";

import { signOut } from "next-auth/react";
import LogoutIcon from "../icons/logout.svg";
import { IconButton } from "./button";
import styles from "./user-profile.module.scss";

interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("[Logout] Failed to record logout:", e);
    }
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className={styles["user-profile"]}>
      <div className={styles["user-info"]}>
        {user.image && (
          <img
            src={user.image}
            alt={user.name || "User"}
            className={styles["user-avatar"]}
          />
        )}
        <div className={styles["user-details"]}>
          {user.name && <div className={styles["user-name"]}>{user.name}</div>}
          {user.email && (
            <div className={styles["user-email"]}>{user.email}</div>
          )}
        </div>
        <div>
          <IconButton icon={<LogoutIcon />} onClick={handleSignOut} />
        </div>
      </div>
    </div>
  );
}
