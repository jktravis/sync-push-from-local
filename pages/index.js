import React, {useState, useEffect} from 'react';
import {FixedSizeList as List} from 'react-window';
import io from 'socket.io-client';
import * as R from 'ramda';

const Row = ({id, message, onClick, toggled}) => (
  <li>
    <button onClick={() => onClick(id)}>{toggled? 'on' : 'off'}</button> {message} {id}
  </li>
);

const remapData = R.compose(
  R.indexBy(R.prop('id')),
  R.map(R.assoc('toggled', false)),
);

function Hello() {
  const [data, setData] = useState([]);

  const toggleRow = id => setData(R.over(R.lensPath([id, 'toggled']), R.not, data));

  useEffect(() => {
    const socket = io();
    socket.on('now', R.compose(setData, remapData, R.prop('data')));
    return socket.close.bind(socket);
  });

  const values = R.values(data);

  if (R.length(values)) {
    return (
      <ul style={{listStyle: 'none'}}>
        {R.map(
          row => (
            <Row key={row.id} {...row} onClick={toggleRow} />
          ),
          values,
        )}{' '}
      </ul>
    );
  }
  return <div>No data!</div>;
}

export default Hello;
