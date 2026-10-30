import { useEffect, useMemo, useState } from "react";
import {
  BookHeart,
  Plus,
  Sparkles,
  Search,
  Heart,
  Clock3,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Save,
  LoaderCircle,
  Feather,
  Archive,
  BookOpen,
  Menu,
  X,
  CalendarDays,
  UserRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Moon,
  Sun,
  Quote,
} from "lucide-react";

import "./App.css";

const API = "/api";

const TONES = [
  {
    value: "warm",
    label: "Warm & Loving",
    emoji: "🤍",
    description: "Gentle and heartfelt",
  },
  {
    value: "reflective",
    label: "Reflective",
    emoji: "🌙",
    description: "Thoughtful and nostalgic",
  },
  {
    value: "celebratory",
    label: "Celebratory",
    emoji: "✨",
    description: "Joyful and uplifting",
  },
];

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function formatDate(date) {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [memories, setMemories] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [notification, setNotification] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [form, setForm] = useState({
    title: "",
    person: "",
    memory: "",
    tone: "warm",
  });

  const savedMemories = memories.filter((m) => m.status === "SAVED");

  const draftMemories = memories.filter((m) => m.status === "DRAFT");

  const filteredMemories = useMemo(() => {
    return memories.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.title?.toLowerCase().includes(keyword) ||
        item.person?.toLowerCase().includes(keyword) ||
        item.original_memory?.toLowerCase().includes(keyword);

      const matchesFilter = filter === "ALL" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [memories, search, filter]);

  function notify(message, type = "success") {
    setNotification({ message, type });
  }

  async function loadMemories() {
    try {
      setLoading(true);

      const response = await apiRequest("/memories");

      setMemories(response.memories || []);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification]);

  function navigate(nextPage) {
    setPage(nextPage);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNewMemory() {
    setForm({
      title: "",
      person: "",
      memory: "",
      tone: "warm",
    });

    setSelected(null);
    navigate("create");
  }

  function openMemory(memory) {
    setSelected(memory);
    navigate("detail");
  }

  async function generateStory(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.memory.trim()) {
      notify("Please enter a title and your memory.", "error");
      return;
    }

    try {
      setGenerating(true);

      const response = await apiRequest("/generate-memory-story", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const generated = response.memory;

      setMemories((previous) => [
        generated,
        ...previous.filter((m) => m.id !== generated.id),
      ]);

      setSelected(generated);

      notify("Your memory story is ready!");
      navigate("detail");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function saveMemory(memory) {
    try {
      setActionLoading(true);

      const response = await apiRequest(`/memories/${memory.id}/save`, {
        method: "PATCH",
      });

      const updated = response.memory;

      setMemories((previous) =>
        previous.map((m) => (m.id === updated.id ? updated : m)),
      );

      setSelected(updated);
      notify("Memory preserved in your collection.");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteMemory(memory) {
    const confirmed = window.confirm(`Delete "${memory.title}" permanently?`);

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await apiRequest(`/memories/${memory.id}`, {
        method: "DELETE",
      });

      setMemories((previous) => previous.filter((m) => m.id !== memory.id));

      setSelected(null);
      notify("Memory deleted.");
      navigate("dashboard");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setActionLoading(false);
    }
  }

  function MemoryCard({ memory }) {
    return (
      <button
        type="button"
        className="memory-card"
        onClick={() => openMemory(memory)}
      >
        <div className="card-top">
          <span className="memory-emoji">
            {memory.tone === "celebratory"
              ? "✨"
              : memory.tone === "reflective"
                ? "🌙"
                : "🤍"}
          </span>

          <span className={`status ${memory.status.toLowerCase()}`}>
            {memory.status === "SAVED" ? "Preserved" : "Draft"}
          </span>
        </div>

        <div className="memory-card-body">
          <span className="card-date">
            <CalendarDays size={13} />
            {formatDate(memory.created_at)}
          </span>

          <h3>{memory.title}</h3>

          <p>{memory.story || memory.original_memory}</p>
        </div>

        <div className="card-bottom">
          <span>
            <UserRound size={14} />
            {memory.person || "Personal Memory"}
          </span>

          <ArrowRight size={17} />
        </div>
      </button>
    );
  }

  function MemoryCollection({ title, description }) {
    return (
      <section className="collection-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR COLLECTION</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <button
            className="icon-button refresh-button"
            onClick={loadMemories}
            title="Refresh memories"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="collection-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search your memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            {["ALL", "SAVED", "DRAFT"].map((value) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
              >
                {value === "ALL"
                  ? "All"
                  : value === "SAVED"
                    ? "Preserved"
                    : "Drafts"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <LoaderCircle className="spin" size={32} />
            <h3>Gathering your memories...</h3>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BookHeart size={30} />
            </div>
            <h3>
              {memories.length === 0
                ? "Your story begins here"
                : "No matching memories"}
            </h3>
            <p>
              {memories.length === 0
                ? "Every precious moment deserves a place to live."
                : "Try changing your search or filter."}
            </p>
            <button className="primary-button" onClick={startNewMemory}>
              <Plus size={17} />
              Create a Memory
            </button>
          </div>
        ) : (
          <div className="memory-grid">
            {filteredMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <BookHeart size={25} strokeWidth={1.7} />
          </div>
          <div className="brand-text">
            <strong>Memory Keeper</strong>
            <span>KEEP YOUR MOMENTS ALIVE</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">YOUR SPACE</div>

        <nav className="sidebar-nav">
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => navigate("dashboard")}
          >
            <BookOpen size={19} />
            Overview
          </button>

          <button
            className={page === "collection" ? "active" : ""}
            onClick={() => {
              setFilter("ALL");
              navigate("collection");
            }}
          >
            <Archive size={19} />
            Memory Collection
          </button>

          <button
            className={page === "create" ? "active" : ""}
            onClick={startNewMemory}
          >
            <Feather size={19} />
            Write a Memory
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <Quote size={22} />
            <p>
              "The most beautiful things in life are not things. They're
              memories."
            </p>
          </div>

          <div className="sidebar-footer">
            <Sparkles size={16} />
            Powered by Gemma + Ollama
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />
      )}

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-button"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>

            <span className="breadcrumb">
              Your Space <ChevronRight size={14} />
              <strong>
                {page === "dashboard"
                  ? "Overview"
                  : page === "collection"
                    ? "Memory Collection"
                    : page === "create"
                      ? "Create Memory"
                      : "Memory Story"}
              </strong>
            </span>
          </div>

          <div className="topbar-actions">
            <span className="local-badge">
              <span className="online-dot" />
              Local AI
            </span>

            <button
              className="icon-button"
              title="Toggle theme"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <main className="page-content">
          {page === "dashboard" && (
            <>
              <section className="hero">
                <div className="hero-content">
                  <span className="hero-label">
                    <Sparkles size={15} />A HOME FOR YOUR STORIES
                  </span>

                  <h1>
                    Some moments deserve
                    <br />
                    to last <em>forever.</em>
                  </h1>

                  <p>
                    Preserve the people, places, and moments that made you who
                    you are. Let AI help you turn memories into timeless
                    stories.
                  </p>

                  <button className="hero-button" onClick={startNewMemory}>
                    <Plus size={18} />
                    Create a Memory
                    <ArrowRight size={17} />
                  </button>
                </div>

                <div className="hero-art" aria-hidden="true">
                  <div className="art-circle circle-one" />
                  <div className="art-circle circle-two" />
                  <div className="floating-paper paper-one">
                    <Heart size={35} fill="currentColor" />
                  </div>
                  <div className="floating-paper paper-two">
                    <span>Dear memories,</span>
                    <div className="paper-line" />
                    <div className="paper-line short" />
                    <div className="paper-line" />
                    <div className="paper-line short" />
                    <span className="paper-heart">♡</span>
                  </div>
                  <div className="art-star star-one">✦</div>
                  <div className="art-star star-two">✧</div>
                </div>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <BookHeart size={22} />
                  </div>
                  <div>
                    <span>Total Memories</span>
                    <strong>{memories.length}</strong>
                    <small>Your growing story</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon peach">
                    <Heart size={22} />
                  </div>
                  <div>
                    <span>Preserved Stories</span>
                    <strong>{savedMemories.length}</strong>
                    <small>Forever in your collection</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon sage">
                    <Clock3 size={22} />
                  </div>
                  <div>
                    <span>Draft Memories</span>
                    <strong>{draftMemories.length}</strong>
                    <small>Waiting to be preserved</small>
                  </div>
                </div>
              </section>

              <MemoryCollection
                title="Your Precious Memories"
                description="A collection of moments worth remembering."
              />
            </>
          )}

          {page === "collection" && (
            <MemoryCollection
              title="Memory Collection"
              description="Revisit the stories that matter most."
            />
          )}

          {page === "create" && (
            <div className="create-page">
              <button
                className="back-link"
                onClick={() => navigate("dashboard")}
              >
                <ArrowLeft size={17} />
                Back to Overview
              </button>

              <div className="page-intro">
                <span className="eyebrow">A NEW CHAPTER</span>
                <h1>Let's capture a memory.</h1>
                <p>
                  Tell us about a moment you hold close to your heart. Every
                  detail makes it special.
                </p>
              </div>

              <form className="memory-form" onSubmit={generateStory}>
                <div className="form-heading">
                  <div className="form-heading-icon">
                    <Feather size={24} />
                  </div>
                  <div>
                    <h2>Your Memory</h2>
                    <p>Start by sharing your story.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Give your memory a title *</label>
                  <input
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Summers at Grandmother's House"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Who is this memory about?
                    <span className="optional">Optional</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. My Grandmother"
                    value={form.person}
                    onChange={(e) =>
                      setForm({ ...form, person: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Share your memory *</label>
                  <textarea
                    rows={8}
                    maxLength={5000}
                    placeholder="I still remember that afternoon... The sunlight was warm, and we were sitting together..."
                    value={form.memory}
                    onChange={(e) =>
                      setForm({ ...form, memory: e.target.value })
                    }
                    required
                  />
                  <span className="character-count">
                    {form.memory.length}/5000 characters
                  </span>
                </div>

                <div className="form-group">
                  <label>How should your story feel?</label>

                  <div className="tone-grid">
                    {TONES.map((tone) => (
                      <button
                        type="button"
                        key={tone.value}
                        className={`tone-card ${
                          form.tone === tone.value ? "selected" : ""
                        }`}
                        onClick={() => setForm({ ...form, tone: tone.value })}
                      >
                        <span className="tone-emoji">{tone.emoji}</span>
                        <strong>{tone.label}</strong>
                        <small>{tone.description}</small>
                        {form.tone === tone.value && (
                          <CheckCircle2 size={17} className="tone-check" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-footer">
                  <div className="privacy-note">
                    <Heart size={16} />
                    Your memories stay on your local machine.
                  </div>

                  <button
                    className="primary-button generate-button"
                    type="submit"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <LoaderCircle size={18} className="spin" />
                        Weaving your story...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Bring Memory to Life
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {page === "detail" && selected && (
            <div className="detail-page">
              <button
                className="back-link"
                onClick={() => navigate("dashboard")}
              >
                <ArrowLeft size={17} />
                Back to Memories
              </button>

              <div className="story-layout">
                <div className="story-paper">
                  <div className="story-decoration">
                    ✦ &nbsp; A MEMORY WORTH KEEPING &nbsp; ✦
                  </div>

                  <div className="story-topline">
                    <span className={`status ${selected.status.toLowerCase()}`}>
                      {selected.status === "SAVED" ? "Preserved" : "Draft"}
                    </span>
                    <span>{formatDate(selected.created_at)}</span>
                  </div>

                  <div className="story-heading">
                    <span className="story-icon">♡</span>
                    <h1>{selected.story_title || selected.title}</h1>
                    {selected.person && (
                      <p>In memory of moments with {selected.person}</p>
                    )}
                  </div>

                  <div className="story-divider">
                    <span>✦</span>
                  </div>

                  <div className="story-body">{selected.story}</div>

                  {selected.closing_note && (
                    <div className="closing-note">
                      <Heart size={20} />
                      <p>{selected.closing_note}</p>
                    </div>
                  )}

                  <div className="story-signature">
                    Preserved with love, Memory Keeper ♡
                  </div>
                </div>

                <div className="story-sidebar">
                  <div className="detail-panel">
                    <span className="eyebrow">YOUR MEMORY</span>
                    <h3>Story Details</h3>

                    <div className="detail-row">
                      <BookOpen size={17} />
                      <div>
                        <small>Original Title</small>
                        <strong>{selected.title}</strong>
                      </div>
                    </div>

                    <div className="detail-row">
                      <UserRound size={17} />
                      <div>
                        <small>Person</small>
                        <strong>{selected.person || "Personal"}</strong>
                      </div>
                    </div>

                    <div className="detail-row">
                      <CalendarDays size={17} />
                      <div>
                        <small>Created On</small>
                        <strong>{formatDate(selected.created_at)}</strong>
                      </div>
                    </div>

                    <div className="detail-row">
                      <Sparkles size={17} />
                      <div>
                        <small>Story Tone</small>
                        <strong className="capitalize">{selected.tone}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="detail-panel original-panel">
                    <span className="eyebrow">YOUR OWN WORDS</span>
                    <h3>Original Memory</h3>
                    <p>{selected.original_memory}</p>
                  </div>

                  {selected.status === "DRAFT" && (
                    <button
                      className="primary-button full-width"
                      disabled={actionLoading}
                      onClick={() => saveMemory(selected)}
                    >
                      <Save size={17} />
                      Preserve This Memory
                    </button>
                  )}

                  {selected.status === "SAVED" && (
                    <div className="saved-banner">
                      <CheckCircle2 size={19} />
                      Safely preserved in your collection
                    </div>
                  )}

                  <button
                    className="delete-button"
                    disabled={actionLoading}
                    onClick={() => deleteMemory(selected)}
                  >
                    <Trash2 size={17} />
                    Delete Memory
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <span>© 2026 Memory Keeper AI</span>
          <span>Made with ♡ for Hacktoberfest 2026</span>
        </footer>
      </div>

      {notification && (
        <div className={`toast ${notification.type}`}>
          {notification.type === "error" ? (
            <AlertCircle size={19} />
          ) : (
            <CheckCircle2 size={19} />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
