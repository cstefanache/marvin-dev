import React from 'react';
import { useParams } from 'react-router-dom';

const ViewList = ({ user }) => {
  const token = localStorage.getItem('token');

  let { id } = useParams();
  const [list, setList] = React.useState(
    user.data.find((list) => list.key == id)
  );

  console.log(list)

  return (
    <div key={id}>
      <h1>{list.name}</h1>
      <ul>
        {list.items.map((item) => (
          <li key={item.key}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ViewList;
