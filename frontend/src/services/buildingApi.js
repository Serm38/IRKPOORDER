import axios from 'axios';

export const getBuildings = async () => {
  const res = await axios.get('/api/buildings');
  return res.data;
};