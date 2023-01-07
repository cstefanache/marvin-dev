import { Link } from "react-router-dom";
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
    <Navbar className="bp4-dark" fixedToTop>
      <NavbarGroup align={Alignment.LEFT}>
        <NavbarHeading>Marvin</NavbarHeading>
        <Link to="/workspaces" className="menu-link">
          <AnchorButton className="bp4-button bp4-minimal button" icon="box" text="Workspaces" />
        </Link>
        <NavbarDivider />
        <Link to="/configuration">
         <AnchorButton className="bp4-button bp4-minimal" icon="wrench" text="Config" />
        </Link>
        <Link to="/">
          <AnchorButton className="bp4-button bp4-minimal" icon="layout-hierarchy" text="Execution Workflow" />
        </Link>
    </NavbarGroup>
    </Navbar>
  );
}

export default Header;
