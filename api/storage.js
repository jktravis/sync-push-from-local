import localForage from 'localforage';
import * as R from 'ramda';

const syncItem = R.curry((mapper, data) => {
  return localForage.getItem(data.id).then(item => {
    if (item) {
      return mapper(item);
    }
    return data;
  });
});

const saveItem = item => {
  return localForage.setItem(item.id, item).then(() => item);
};

export {syncItem, saveItem};
