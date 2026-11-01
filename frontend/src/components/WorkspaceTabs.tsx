interface TabItem {
  value: string;
  label: string;
}
export function WorkspaceTabs({
  items,
  value,
  onChange,
  prefix,
  label,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  prefix: string;
  label: string;
}) {
  return (
    <div className="workspace-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          id={prefix + "-tab-" + item.value}
          aria-selected={value === item.value}
          aria-controls={prefix + "-panel"}
          tabIndex={value === item.value ? 0 : -1}
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => {
            const next =
              event.key === "ArrowRight"
                ? (index + 1) % items.length
                : event.key === "ArrowLeft"
                  ? (index + items.length - 1) % items.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? items.length - 1
                      : null;
            if (next !== null) {
              event.preventDefault();
              onChange(items[next].value);
              document
                .getElementById(prefix + "-tab-" + items[next].value)
                ?.focus();
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
