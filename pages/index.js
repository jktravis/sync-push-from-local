import React, {useState, useEffect} from 'react';
import {FixedSizeList as List} from 'react-window';
import io from 'socket.io-client';
import * as R from 'ramda';
import {syncItem, saveItem} from '../api/storage';

const Row = ({id, message, onClick, toggled}) => (
  <li>
    <button onClick={() => onClick(id)}>{String(toggled)}</button> {message}{' '}
    {id}
  </li>
);

const remapData = R.compose(
  R.indexBy(R.prop('id')),
  R.map(R.assoc('toggled', false)),
);

const merge = R.curry((d, item) => {
  return R.assoc('toggled', item.toggled, d);
});

function Hello() {
  const [data, setData] = useState([]);

  const toggleRow = id => {
    const lens = R.lensPath([id, 'toggled']);
    const newData = R.over(lens, R.not, data);
    saveItem(R.compose(R.pick(['id', 'toggled']), R.prop(id))(newData))
      .then()
      .catch();
    setData(newData);
  };

  useEffect(() => {
    const socket = io();
    socket.on('now', resp => {
      const d = R.compose(remapData, R.prop('data'))(resp);
      Promise.all(
        R.compose(
          R.map(d => syncItem(merge(d), d)),
          R.values,
        )(d),
      ).then(
        R.compose(
          setData,
          R.indexBy(R.prop('id')),
        ),
      );
    });
    return socket.close.bind(socket);
  }, []);

  const values = R.values(data);

  if (R.length(values)) {
    return (
      <>
        <ul style={{listStyle: 'none'}}>
          {R.map(
            row => (
              <Row key={row.id} {...row} onClick={toggleRow} />
            ),
            values,
          )}{' '}
        </ul>
      </>
    );
  }
  return <div>No data!</div>;
}

export default Hello;
