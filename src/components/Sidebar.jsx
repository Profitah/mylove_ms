const TABS = [
  { id: 'chat', label: '채팅', icon: '💬' },
  { id: 'gift', label: '선물하기', icon: '🎁' },
]

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <nav className="sidebar" aria-label="주요 탭">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`sidebar-icon${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onSelectTab(tab.id)}
          aria-label={tab.label}
          aria-current={activeTab === tab.id}
        >
          {tab.icon}
        </button>
      ))}
    </nav>
  )
}
