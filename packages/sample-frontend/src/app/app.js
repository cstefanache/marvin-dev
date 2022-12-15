import React from 'react';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import ViewList from './pages/ViewList';
import NewList from './pages/NewList';

import { Stack, AppBar, Button, Toolbar, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
const darkTheme = createTheme({});

export function App() {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = React.useState(true);
  const [shouldLogin, setShouldLogin] = React.useState(false);
  const [user, setUser] = React.useState(null);

  const [reload, setReload] = React.useState(Date.now());

  React.useEffect(() => {
    if (token) {
      fetch('http://localhost:3333/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
          setLoading(false);
          setShouldLogin(false);
        })
        .catch((err) => {
          console.log('errrrr', err);
          setShouldLogin(true);
          setLoading(false);
        });
    } else {
      setShouldLogin(true);
      setLoading(false);
    }
  }, [reload]);

  const logout = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token: token },
    };
    fetch('http://localhost:3333/api/logout', requestOptions).then(() => {
      localStorage.removeItem('token');
      setReload(Date.now())
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      {loading && <div>Loading...</div>}
      {!loading && (
        <>
          {shouldLogin && <Login />}
          {!shouldLogin && (
            <Router>
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <AppBar position="static" color="primary" enableColorOnDark>
                  <Toolbar>
                    <Link to="/">
                      <Typography
                        variant="h6"
                        noWrap
                        sx={{ flexGrow: 1 }}
                      >
                        Marvin Sample App
                      </Typography>
                    </Link>
                    <Typography
                      variant="h6"
                      noWrap
                      component="div"
                      sx={{ flexGrow: 1 }}
                    >
                      {user.email}
                    </Typography>
                    <Button component={Link} to="/newitem" color="secondary">
                      Create New List
                    </Button>
                    <Button color="inherit" onClick={logout}>
                      Logout
                    </Button>
                  </Toolbar>
                </AppBar>
                <Routes>
                  <Route
                    path="/"
                    exact
                    element={
                      <Dashboard
                        user={user}
                        reload={() => {
                          setReload(Date.now());
                        }}
                      />
                    }
                  ></Route>
                  <Route
                    path="/newitem"
                    exact
                    element={<NewList reload={() => setReload(Date.now())} />}
                  />
                  <Route path="/item/:id" exact element={<ViewList user={user} />} />
                </Routes>
              </Stack>
            </Router>
          )}
        </>
      )}
    </ThemeProvider>
  );
}
export default App;
