import { buildPracticeVisualTags } from '../lib/practiceVisualTags'

const getPracticeTagClassName = (tone) => {
  const toneClassMap = {
    slate: 'bg-white/10 text-white/70 border-white/15',
    cyan: 'bg-cyan-500/15 text-cyan-100 border-cyan-300/25',
    violet: 'bg-violet-500/15 text-violet-100 border-violet-300/25',
    green: 'bg-emerald-500/15 text-emerald-100 border-emerald-300/25',
    amber: 'bg-amber-500/15 text-amber-100 border-amber-300/25',
    blue: 'bg-blue-500/15 text-blue-100 border-blue-300/25',
  }

  return toneClassMap[tone] ?? toneClassMap.slate
}

const sizeClassNameMap = {
  sm: 'px-2 py-1 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
}

const PracticeTags = ({ session, size = 'sm', className = '' }) => {
  const tags = buildPracticeVisualTags(session)

  if (tags.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={`${session.id}-${tag.id}`}
          className={`inline-flex items-center gap-1 rounded-full border ${sizeClassNameMap[size] ?? sizeClassNameMap.sm} ${getPracticeTagClassName(tag.tone)}`}
        >
          {tag.icon && <span>{tag.icon}</span>}
          <span>{tag.label}</span>
        </span>
      ))}
    </div>
  )
}

export default PracticeTags
