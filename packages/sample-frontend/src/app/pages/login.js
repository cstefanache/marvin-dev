import React from 'react';
import {
  Grid,
  Paper,
  Avatar,
  TextField,
  Button,
  Typography,
  Link,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
const Login = () => {
  const paperStyle = {
    marginTop: 100,
    padding: 20,
    width: 380,
    margin: '20px auto',
  };
  const avatarStyle = { backgroundColor: '#1bbd7e' };
  const btnstyle = { margin: '8px 0' };

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const login = (evt) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    };
    fetch('http://localhost:3333/api/login', requestOptions)
      .then((response) => response.json())
      .then((data) => {        
        localStorage.setItem('token', data.sessionId);
        window.location.href = '/';
      });
      
  };

  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <Grid align="center">
          <Avatar style={avatarStyle}>
            <AccountBoxIcon />
          </Avatar>
          <h2>Sign In</h2>
        </Grid>
        <form autoComplete="on">
          <TextField
            label="Username"
            placeholder="Enter username"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            placeholder="Enter password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <FormControlLabel
            control={<Checkbox name="checkedB" color="primary" />}
            label="Remember me"
          />
          <Button
            data-ta="login-button"  
            color="primary"
            variant="contained"
            style={btnstyle}
            
            fullWidth
            onClick={login}
          >
            Sign in
          </Button>
        </form>
        <Typography>
          <Link href="#">Forgot password ?</Link>
        </Typography>
        <Typography>
          {' '}
          Do you have an account ?<Link href="#">Sign Up</Link>
        </Typography>
      </Paper>
    </Grid>
  );
};

export default Login;
