import React, { useRef, useState } from "react";
import { useEndpointContext } from "./EndpointContext";
import { SearchIcon } from "./mdx/icons/SearchIcon";
import Chevron from "./icons/Chevron";
import useOnClickOutside from "../hooks/useOnClickOutside";
import Styles from "../stylesheets/modules/EndpointFilter.module.css";

export default function EndpointFilter() {
  const {
    search,
    setSearch,
    showBot,
    setShowBot,
    showOAuth2,
    setShowOAuth2,
    showUnauthenticated,
    setShowUnauthenticated,
  } = useEndpointContext();

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);

  useOnClickOutside(ref, () => setIsOpen(false));

  const activeCount = [showBot, showOAuth2, showUnauthenticated].filter(Boolean).length;

  return (
    <div className={Styles.container}>
      <div className={Styles.searchContainer}>
        <SearchIcon className={Styles.searchIcon} />
        <input
          className={Styles.searchInput}
          type="search"
          placeholder="Search endpoints..."
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      <div className={Styles.filterContainer} ref={ref}>
        <button onClick={() => setIsOpen(!isOpen)} className={Styles.filterButton}>
          Filters
          {activeCount > 0 && <span className={Styles.filterBadge}>{activeCount}</span>}
          <Chevron className={`${Styles.chevron} ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className={Styles.dropdown}>
            <FilterOption label="Supports Bots" checked={showBot} onChange={setShowBot} />
            <FilterOption label="Supports OAuth2" checked={showOAuth2} onChange={setShowOAuth2} />
            <FilterOption label="Unauthenticated" checked={showUnauthenticated} onChange={setShowUnauthenticated} />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={Styles.optionLabel}>
      <div className={Styles.checkboxContainer}>
        <input
          type="checkbox"
          className={Styles.checkbox}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
      <span className={Styles.optionText}>{label}</span>
    </label>
  );
}
