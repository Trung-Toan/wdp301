import {
  Container,
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  Dropdown,
} from "react-bootstrap";
import {
  PersonCircle,
  BoxArrowRight,
  Receipt,
  InfoCircle,
  LockFill,
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import { useSessionStorage } from "../../../utility/useSessionStorage";

const Header = () => {
  const user = useSessionStorage("user");
  const navigate = useNavigate();

  const onLogout = () => {
    navigate("/login");
  };

  return (
    <Navbar bg="light" className="shadow-sm">
      <Container>
        {/* Logo */}
        <Navbar.Brand to="#" className="fw-bold">
          Project WDP
        </Navbar.Brand>

        {/* Toggle button for mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Search Bar */}
          <Form
            className="d-flex ms-auto me-4 align-items-center"
            style={{ maxWidth: "400px", flex: 1 }}
          >
            <FormControl
              type="search"
              placeholder="Search"
              className="rounded-pill"
              style={{ boxShadow: "none", borderColor: "#ced4da" }}
              aria-label="Search"
            />
            <Button
              variant="warning"
              className="rounded-pill ms-2 px-3"
              style={{ boxShadow: "none", whiteSpace: "nowrap" }}
            >
              Search
            </Button>
          </Form>

          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                <Receipt />
                <Nav.Link as={Link} to="list_invoice" className="me-3">
                Invoice
                </Nav.Link>
              </>
            ) : (
              ""
            )}
            
            {/* User Section */}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-basic"
                >
                  <PersonCircle size={24} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>
                    Hello, {user?.fullName || "you"}!
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="information">
                    <InfoCircle className="me-2" />
                    View information
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="list_invoice">
                    <Receipt className="me-2" />
                    View payment invoice
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="change_password">
                    <LockFill className="me-2" />
                    Change password
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={onLogout}>
                    <BoxArrowRight className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login" className="btn btn-outline-info">
                Login
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;