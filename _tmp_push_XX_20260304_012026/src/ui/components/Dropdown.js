export function renderDropdown({ triggerLabel = '', items = [] }) {
  const root = document.createElement('div');
  root.className = 'dropdown';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.textContent = triggerLabel;
  const menu = document.createElement('ul');
  menu.hidden = true;
  menu.role = 'listbox';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.role = 'option';
    li.tabIndex = 0;
    li.dataset.value = item.value;
    li.textContent = item.label;
    menu.append(li);
  });
  trigger.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
  });
  root.append(trigger, menu);
  return { root, trigger, menu };
}
