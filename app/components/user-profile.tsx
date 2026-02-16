"use client";

import { signOut } from "next-auth/react";
import styles from "./user-profile.module.scss";
import { IconButton } from "./button";
import LogoutIcon from "../icons/logout.svg";

interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const handleSignOut = async () => {
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
          {user.name && (
            <div className={styles["user-name"]}>{user.name}</div>
          )}
          {user.email && (
            <div className={styles["user-email"]}>{user.email}</div>
          )}
        </div>
      </div>
      <IconButton
        icon={<LogoutIcon />}
        text="Sign Out"
        className={styles["logout-button"]}
        onClick={handleSignOut}
      />
    </div>
  );
}
