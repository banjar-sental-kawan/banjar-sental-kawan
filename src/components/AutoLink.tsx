/**
 * AutoLink — converts plain-text URLs inside a string into clickable <a> tags.
 * Safe: uses rel="noopener noreferrer" and target="_blank".
 * Handles multiple URLs per string and preserves surrounding text.
 */

interface AutoLinkProps {
  text: string
  className?: string
}

export default function AutoLink({ text, className }: AutoLinkProps) {
  const regex = /https?:\/\/[^\s]+/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Text before the URL
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    // The URL itself as a link
    const url = match[0]
    nodes.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-600 underline underline-offset-2 hover:text-amber-700 transition-colors"
        style={{ wordBreak: 'break-all' }}
      >
        {url}
      </a>
    )
    lastIndex = match.index + url.length
  }

  // Remaining text after the last URL
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return (
    <span className={className} style={{ overflowWrap: 'anywhere' }}>
      {nodes}
    </span>
  )
}
