import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RemoveIcon from '@mui/icons-material/RemoveCircle';
import { Link } from 'react-router-dom';
const CreateList = ({ onSave, onCancel }) => {
  const [listName, setListName] = React.useState('');
  const [titleError, setTitleError] = React.useState(false);
  const [newItemError, setNewItemError] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [newItem, setNewItem] = React.useState('');

  const addNewItemClick = (evt) => {
    if (newItem && newItem.length > 0) {
      setItems([...items, { key: Date.now(), name: newItem }]);
      setNewItem('');
      setNewItemError(false);
    } else {
      setNewItemError(true);
    }
  };

  const save = () => {
    if (listName && listName.length > 0) {
      setTitleError(false);
      onSave({ key: Date.now(), name: listName, items });
    } else {
      setTitleError(true);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Create a new list
        </Typography>
        <TextField
          label="List Name"
          placeholder="Enter list name"
          variant="outlined"
          fullWidth
          error={titleError}
          helperText={titleError ? 'List name is required' : ''}
          required
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />

        <Typography sx={{ mt: 4 }} variant="body2">
          Add items to the list
        </Typography>
        <Box sx={{ display: 'flex', mt: 2 }}>
          <TextField
            label="Item"
            variant="outlined"
            fullWidth
            error={newItemError}
            helperText={newItemError ? 'Invalid item name' : ''}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <Button sx={{ ml: 2 }} variant="contained" onClick={addNewItemClick}>
            Add
          </Button>
        </Box>
        {items.map((item) => (
          <Box key={item.key} sx={{ display: 'flex', mt: 2, ml: 2 }}>
            <Box sx={{ width: 1 }}>
              <Typography>{item.name}</Typography>
            </Box>
            <IconButton>
              <RemoveIcon />
            </IconButton>
          </Box>
        ))}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={save}>
          Save
        </Button>
        <Button component={Link} to="/" color="secondary">Cancel</Button>
      </CardActions>
    </Card>
  );
};

export default CreateList;
