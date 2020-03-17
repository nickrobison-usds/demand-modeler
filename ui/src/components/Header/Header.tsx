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
        </div>
      </div>
    </header>
  );
};

export default Header;
