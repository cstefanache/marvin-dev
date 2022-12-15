import React from 'react';
import {
  Grid,
  Stack,
  AppBar,
  Button,
  Toolbar,
  Typography,
} from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Link } from 'react-router-dom';
import CreateList from './createList';
const Dashboard = ({ user, reload }) => {
  const token = localStorage.getItem('token');

  const deleteList = (id) => (evt) => {
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', token: token }
    };
    fetch(`http://localhost:3333/api/item/${id}`, requestOptions).then(() => {
      reload();
    });
  }

  return (
    <Grid container spacing={2}>
      {user.data.map((item) => (
        <Grid className='grid-card' key={item.key} item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <div>
                  Number of items: <b>{item.items.length}</b>
                </div>
                <div>
                  Created {new Date(item.key).toLocaleDateString()}{' '}
                  {new Date(item.key).toLocaleTimeString()}
                </div>
              </Typography>
            </CardContent>
            <CardActions>
              {/* <Button size="small">Open</Button> */}
              <Button component={Link} to={`/item/${item.key}`} color="secondary">Open</Button>
              <Button size="small" color="error" onClick={deleteList(item.key)}>
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Dashboard;
