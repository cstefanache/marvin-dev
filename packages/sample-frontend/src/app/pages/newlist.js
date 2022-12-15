import React from 'react';
import {
  Grid,
} from '@mui/material';
import CreateList from './createList';
import { useNavigate } from 'react-router-dom';
const NewList = ({ reload }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const onSave = (data) => {
    console.log('on saving')
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token: token },
      body: JSON.stringify(data),
    };
    fetch('http://localhost:3333/api/submit', requestOptions).then(() => {
      console.log('submitting')
      reload();
      console.log('... navigating')
      navigate('/')
    });
  };

  return (
    <Grid container spacing={2}>      
        <Grid item xs={12} sm={6} md={4}>
          <CreateList onSave={onSave}/>
        </Grid>    
    </Grid>
  );
};

export default NewList;
