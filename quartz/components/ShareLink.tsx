import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ShareLink: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const slug = fileData.slug === "index" ? "" : fileData.slug
  const shareUrl = `https://mohan.is-a.dev/curiosity/${slug}`

  return (
    <div
      role="button"
      tabindex="0"
      class={classNames(displayClass, "share-button")}
      data-share-url={shareUrl}
      aria-label="Copy sharing link"
      title="Copy sharing link (mohan.is-a.dev)"
      onclick={`
        var btn = this;
        var url = btn.getAttribute('data-share-url');
        navigator.clipboard.writeText(url).then(function() {
          var svg = btn.innerHTML;
          btn.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tertiary)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'></polyline></svg>";
          setTimeout(function() { btn.innerHTML = svg; }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy', err);
        });
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </div>
  )
}

ShareLink.css = `
.share-button {
  background-color: var(--highlight);
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  color: var(--secondary);
  padding: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.share-button:hover {
  background-color: var(--lightgray);
  color: var(--tertiary);
}
.share-button:focus {
  outline: none;
  border: 1px solid var(--tertiary);
}
`

export default (() => ShareLink) satisfies QuartzComponentConstructor
