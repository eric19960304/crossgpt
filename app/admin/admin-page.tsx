"use client";

import { useState } from "react";
import styles from "./admin.module.scss";

interface UserData {
  email: string;
  name: string;
  image: string;
  createdAt: string;
  creditUSD: number;
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
  costPerMillion: number;
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
  const [activeTab, setActiveTab] = useState<"users" | "models" | "credits">("users");
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  // Models state
  const [models, setModels] = useState<ModelData[]>(initialModels);
  const [newModelName, setNewModelName] = useState("");
  const [newModelProvider, setNewModelProvider] = useState(PROVIDER_OPTIONS[0].id);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Inline cost editing state: modelId -> draft value string
  const [editingCost, setEditingCost] = useState<Record<string, string>>({});

  // Credits grant state
  const [grantEmail, setGrantEmail] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantResult, setGrantResult] = useState<{ ok: boolean; message: string } | null>(null);

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
          costPerMillion: created.costPerMillion ?? 0,
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

  async function handleCostSave(model: ModelData) {
    const raw = editingCost[model._id];
    if (raw === undefined) return;
    const cost = parseFloat(raw);
    if (isNaN(cost) || cost < 0) return;
    const res = await fetch(`/api/admin/models/${model._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ costPerMillion: cost }),
    });
    if (res.ok) {
      setModels((prev) =>
        prev.map((m) => (m._id === model._id ? { ...m, costPerMillion: cost } : m)),
      );
      setEditingCost((prev) => {
        const next = { ...prev };
        delete next[model._id];
        return next;
      });
    }
  }

  async function handleGrantCredit(e: React.FormEvent) {
    e.preventDefault();
    setGranting(true);
    setGrantResult(null);
    const amount = parseFloat(grantAmount);
    if (!grantEmail.trim() || isNaN(amount)) {
      setGrantResult({ ok: false, message: "Invalid email or amount" });
      setGranting(false);
      return;
    }
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: grantEmail.trim(), amount }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setGrantResult({
        ok: true,
        message: `Granted $${amount.toFixed(2)} to ${grantEmail.trim()}. New balance: $${data.balance?.toFixed(2) ?? "?"}`,
      });
      setGrantEmail("");
      setGrantAmount("");
    } else {
      setGrantResult({ ok: false, message: data.error || "Failed to grant credit" });
    }
    setGranting(false);
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
        <button
          className={`${styles.tab} ${activeTab === "credits" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("credits")}
        >
          Credits
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
                      <span className={styles.creditBadge}>
                        ${user.creditUSD.toFixed(2)}
                      </span>
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
                <th>Cost / 1M tokens</th>
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
                .map((model) => {
                  const draftCost = editingCost[model._id];
                  const isEditing = draftCost !== undefined;
                  return (
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
                        {isEditing ? (
                          <span className={styles.costEditCell}>
                            <input
                              className={styles.costInput}
                              type="number"
                              min="0"
                              step="0.01"
                              value={draftCost}
                              onChange={(e) =>
                                setEditingCost((prev) => ({
                                  ...prev,
                                  [model._id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCostSave(model);
                                if (e.key === "Escape")
                                  setEditingCost((prev) => {
                                    const next = { ...prev };
                                    delete next[model._id];
                                    return next;
                                  });
                              }}
                              autoFocus
                            />
                            <button
                              className={styles.saveCostBtn}
                              onClick={() => handleCostSave(model)}
                            >
                              Save
                            </button>
                            <button
                              className={styles.cancelCostBtn}
                              onClick={() =>
                                setEditingCost((prev) => {
                                  const next = { ...prev };
                                  delete next[model._id];
                                  return next;
                                })
                              }
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <span
                            className={styles.costDisplay}
                            onClick={() =>
                              setEditingCost((prev) => ({
                                ...prev,
                                [model._id]: String(model.costPerMillion),
                              }))
                            }
                            title="Click to edit"
                          >
                            ${model.costPerMillion.toFixed(2)}
                          </span>
                        )}
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
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "credits" && (
        <div className={styles.creditsSection}>
          <h2 className={styles.sectionTitle}>Grant Credit</h2>
          <p className={styles.subtitle}>Add credit balance to a user&apos;s account.</p>
          <form className={styles.grantForm} onSubmit={handleGrantCredit}>
            <input
              className={styles.modelInput}
              type="email"
              placeholder="User email"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              required
            />
            <input
              className={styles.costInput}
              type="number"
              step="0.01"
              placeholder="Amount (USD)"
              value={grantAmount}
              onChange={(e) => setGrantAmount(e.target.value)}
              required
            />
            <button className={styles.addBtn} type="submit" disabled={granting}>
              {granting ? "Granting…" : "Grant Credit"}
            </button>
          </form>
          {grantResult && (
            <p
              className={
                grantResult.ok ? styles.successMsg : styles.errorMsg
              }
            >
              {grantResult.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
