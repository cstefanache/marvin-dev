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

interface Props {
  workspaceName?: string;
}

const Header = ({ workspaceName }: Props) => {
  return (
    <Navbar className="nav-container" fixedToTop>
      <NavbarGroup align={Alignment.LEFT}>
        <NavbarHeading>Marvin</NavbarHeading>
        <NavLink to="/workspaces" className="menu-link">
          <AnchorButton className="bp4-button bp4-minimal button" icon="box" text={`Workspace ${workspaceName ? `(${workspaceName})` : ''}`} />
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
