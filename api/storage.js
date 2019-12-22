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
  if (item.toggled) {
    return localForage.setItem(item.id, item).then(() => item);
  }
  return localForage.removeItem(item.id).then(() => item);
};

export {syncItem, saveItem};
