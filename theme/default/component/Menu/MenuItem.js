import * as React from 'react';
import cx from 'classnames';
import { getMenuStyle } from './util';
import { useMenuContext } from './context';
import styles from './style/index.less';

function MenuItem({
  title = '',
  icon,
  keyValue = '',
  level = 0,
}) {
  const { theme, selectedKey, mode, onSelect, onHoverKey } = useMenuContext();

  const handleOnClick = () => {
    onSelect(keyValue);
  };

  const renderMenuItem = () => {
    return (
      <li
        className={cx(styles['menu-item'], styles[`menu-${theme}`], {
          [styles['menu-item-selected']]:
            selectedKey && selectedKey.split('').indexOf(keyValue) > -1,
        })}
        onMouseEnter={() => {
          onHoverKey(keyValue);
        }}
        onMouseLeave={() => onHoverKey('')}
        onClick={handleOnClick}
        style={getMenuStyle(level, mode)}
      >
        {icon ? <span className={cx(styles['menu-icon'])}>{icon}</span> : null}
        <span className={cx(styles['menu-item-title'])}>{title}</span>
      </li>
    );
  };

  return renderMenuItem();
}

export default MenuItem;
