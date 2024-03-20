export default function decorate(block) {
  const quickLinkContainerDiv = document.createElement('div');
  quickLinkContainerDiv.className = 'quicklinks-container';
  quickLinkContainerDiv.innerText = 'Quick Links';
  block.append(quickLinkContainerDiv);
}
