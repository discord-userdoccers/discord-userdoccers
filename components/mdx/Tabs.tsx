import React, { useState } from "react";
import classNames from "../../lib/classnames";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

export const Tabs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      React.isValidElement(child) && "label" in (child.props as TabProps),
  );
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="mt-6">
      <div className="mb-4 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={classNames(
              "font-whitney border-b-2 px-4 py-2 font-bold whitespace-nowrap transition-colors duration-200",
              activeTab === index
                ? "border-brand-blurple text-brand-blurple"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            )}
            onClick={() => setActiveTab(index)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="py-2">{tabs[activeTab]}</div>
    </div>
  );
};
