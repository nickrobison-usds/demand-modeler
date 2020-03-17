import React from "react";

interface HeaderProps {
  title: string;
  titleRoute: string;
}

const Header: React.FunctionComponent<HeaderProps> = ({
  title,
  titleRoute
}) => {
  return (
    <header className="usa-header usa-header--basic">
      <div className="usa-nav-container">
        <div className="usa-navbar">
          <div className="usa-logo" id="basic-logo">
            <em className="usa-logo__text">
              <a href={titleRoute} title="Home" aria-label="Home">
                {title}
              </a>
            </em>
          </div>
          <button className="usa-menu-btn">Menu</button>
        </div>
        <nav aria-label="Primary navigation" className="usa-nav">
          <button className="usa-nav__close">
            <img src="/assets/img/close.svg" alt="close" />
          </button>
          <ul className="usa-nav__primary usa-accordion">
            <li className="usa-nav__primary-item">
              <button
                className="usa-accordion__button usa-nav__link  usa-current"
                aria-expanded="false"
                aria-controls="basic-nav-section-one"
              >
                <span>Current section</span>
              </button>
              <ul id="basic-nav-section-one" className="usa-nav__submenu">
                <li className="usa-nav__submenu-item">
                  <a href="#">Navigation link</a>
                </li>
                <li className="usa-nav__submenu-item">
                  <a href="#">Navigation link</a>
                </li>
                <li className="usa-nav__submenu-item">
                  <a href="#">Navigation link</a>
                </li>
              </ul>
            </li>
            <li className="usa-nav__primary-item">
              <button
                className="usa-accordion__button usa-nav__link"
                aria-expanded="false"
                aria-controls="basic-nav-section-two"
              >
                <span>Section</span>
              </button>
              <ul id="basic-nav-section-two" className="usa-nav__submenu">
                <li className="usa-nav__submenu-item">
                  <a href="#">Navigation link</a>
                </li>
                <li className="usa-nav__submenu-item">
                  <a href="#">Navigation link</a>
                </li>
                <li className="usa-nav__submenu-item">
                  <a href="#">Navigation link</a>
                </li>
              </ul>
            </li>
            <li className="usa-nav__primary-item">
              <a className="usa-nav__link" href="javascript:void(0)">
                <span>Simple link</span>
              </a>
            </li>
          </ul>
          <form className="usa-search usa-search--small ">
            <div role="search">
              <label className="usa-sr-only" htmlFor="basic-search-field-small">
                Search small
              </label>
              <input
                className="usa-input"
                id="basic-search-field-small"
                type="search"
                name="search"
              />
              <button className="usa-button" type="submit">
                <span className="usa-sr-only">Search</span>
              </button>
            </div>
          </form>
        </nav>
      </div>
    </header>
  );
};

export default Header;
