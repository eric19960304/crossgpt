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

interface ModelProviderData {
  id: string;
  providerName: string;
  providerType: string;
  sorted: number;
}

interface ModelData {
  _id: string;
  name: string;
  available: boolean;
  sorted: number;
  provider: ModelProviderData;
}

interface AdminPageProps {
  users: UserData[];
  activities: ActivityData[];
  models: ModelData[];
}

const PROVIDER_OPTIONS: ModelProviderData[] = [
  { id: "openai", providerName: "OpenAI", providerType: "openai", sorted: 1 },
  { id: "google", providerName: "Google", providerType: "google", sorted: 3 },
  { id: "anthropic", providerName: "Anthropic", providerType: "anthropic", sorted: 4 },
  { id: "xai", providerName: "XAI", providerType: "xai", sorted: 11 },
];

export function AdminPage({ users, activities, models: initialModels }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<"users" | "models">("users");
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  // Models state
  const [models, setModels] = useState<ModelData[]>(initialModels);
  const [newModelName, setNewModelName] = useState("");
  const [newModelProvider, setNewModelProvider] = useState(PROVIDER_OPTIONS[0].id);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const activitiesByEmail = activities.reduce(
    (acc, a) => {
      if (!acc[a.email]) acc[a.email] = [];
      acc[a.email].push(a);
      return acc;
    },
    {} as Record<string, ActivityData[]>,
  );

  async function handleToggle(model: ModelData) {
    const res = await fetch(`/api/admin/models/${model._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !model.available }),
    });
    if (res.ok) {
      const updated = await res.json();
      setModels((prev) =>
        prev.map((m) =>
          m._id === model._id ? { ...m, available: updated.available } : m,
        ),
      );
    }
  }

  async function handleDelete(model: ModelData) {
    if (!confirm(`Delete model "${model.name}"?`)) return;
    const res = await fetch(`/api/admin/models/${model._id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setModels((prev) => prev.filter((m) => m._id !== model._id));
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newModelName.trim();
    if (!name) return;
    setAdding(true);
    setAddError("");
    const provider = PROVIDER_OPTIONS.find((p) => p.id === newModelProvider)!;
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, provider }),
    });
    if (res.ok) {
      const created = await res.json();
      setModels((prev) => [
        ...prev,
        {
          _id: created._id,
          name: created.name,
          available: created.available,
          sorted: created.sorted,
          provider: created.provider,
        },
      ]);
      setNewModelName("");
    } else {
      const err = await res.json().catch(() => ({}));
      setAddError(err.error || "Failed to add model");
    }
    setAdding(false);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "models" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("models")}
        >
          Models ({models.length})
        </button>
      </div>

      {activeTab === "users" && (
        <>
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
                                  {new Date(a.timestamp).toLocaleString(
                                    "en-US",
                                    { timeZone: "UTC" },
                                  )}
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
        </>
      )}

      {activeTab === "models" && (
        <div className={styles.modelsSection}>
          <form className={styles.addModelForm} onSubmit={handleAdd}>
            <input
              className={styles.modelInput}
              type="text"
              placeholder="Model name (e.g. gpt-4o)"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              required
            />
            <select
              className={styles.modelSelect}
              value={newModelProvider}
              onChange={(e) => setNewModelProvider(e.target.value)}
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.providerName}
                </option>
              ))}
            </select>
            <button className={styles.addBtn} type="submit" disabled={adding}>
              {adding ? "Adding…" : "Add Model"}
            </button>
          </form>
          {addError && <p className={styles.errorMsg}>{addError}</p>}

          <table className={styles.modelsTable}>
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...models]
                .sort((a, b) => {
                  const p = a.provider.providerName.localeCompare(b.provider.providerName);
                  return p !== 0 ? p : a.name.localeCompare(b.name);
                })
                .map((model) => (
                <tr
                  key={model._id}
                  className={!model.available ? styles.disabledRow : ""}
                >
                  <td className={styles.modelName}>{model.name}</td>
                  <td>
                    <span className={styles.providerBadge}>
                      {model.provider.providerName}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        model.available ? styles.enabled : styles.disabled
                      }`}
                    >
                      {model.available ? "enabled" : "disabled"}
                    </span>
                  </td>
                  <td className={styles.modelActions}>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => handleToggle(model)}
                    >
                      {model.available ? "Disable" : "Enable"}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(model)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
