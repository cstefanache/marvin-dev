import { NavLink } from "react-router-dom";
import {
  Alignment,
  AnchorButton,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import "./HeaderStyles.scss";

const Header = () => {
  return (
    <Navbar className="bp4-dark nav-container" fixedToTop>
      <NavbarGroup align={Alignment.LEFT}>
        <NavbarHeading>Marvin</NavbarHeading>
        <NavLink to="/workspaces" className="menu-link">
          <AnchorButton className="bp4-button bp4-minimal button" icon="box" text="Workspaces" />
        </NavLink>
        <NavbarDivider />
        <NavLink to="/configuration" className="menu-link">
         <AnchorButton className="bp4-button bp4-minimal button" icon="wrench" text="Config" />
        </NavLink>
        <NavLink to="/" className="menu-link">
          <AnchorButton className="bp4-button bp4-minimal button" icon="layout-hierarchy" text="Execution Workflow" />
        </NavLink>
    </NavbarGroup>
    </Navbar>
  );
}

export default Header;
