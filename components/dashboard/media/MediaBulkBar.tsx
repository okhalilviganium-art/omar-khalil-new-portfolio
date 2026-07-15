"use client";

interface Props {
  selectedCount: number;
  onDelete: () => void;
  onMove: () => void;
  onCopyUrls: () => void;
  onCopyIds: () => void;
  onClear: () => void;
}

export default function MediaBulkBar({ selectedCount, onDelete, onMove, onCopyUrls, onCopyIds, onClear }: Props) {
  if (selectedCount === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--bg-card)", borderTop: "1px solid var(--border)",
      padding: ".75rem 1.5rem", display: "flex", alignItems: "center", gap: ".75rem",
      boxShadow: "0 -4px 20px rgba(0,0,0,.3)",
    }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", color: "var(--text)", fontWeight: 600 }}>
        {selectedCount} selected
      </span>

      <div style={{ display: "flex", gap: ".35rem", marginLeft: "auto" }}>
        <button className="dash-btn dash-btn-sm" onClick={onCopyUrls} style={{ fontSize: ".65rem" }}>
          <i className="bi bi-clipboard" /> Copy URLs
        </button>
        <button className="dash-btn dash-btn-sm" onClick={onCopyIds} style={{ fontSize: ".65rem" }}>
          <i className="bi bi-clipboard" /> Copy IDs
        </button>
        <button className="dash-btn dash-btn-sm" onClick={onMove} style={{ fontSize: ".65rem" }}>
          <i className="bi bi-folder-symlink" /> Move
        </button>
        <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={onDelete} style={{ fontSize: ".65rem" }}>
          <i className="bi bi-trash" /> Delete
        </button>
        <button className="dash-btn dash-btn-sm" onClick={onClear} style={{ fontSize: ".65rem" }}>
          <i className="bi bi-x-lg" /> Clear
        </button>
      </div>
    </div>
  );
}
