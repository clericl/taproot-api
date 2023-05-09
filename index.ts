import cors from 'cors';
import express, { Request, Response } from 'express';
import Redis from './util/Redis';
import isValidRequest from './util/isValidRequest';

require('dotenv').config();

const app = express();
const client = Redis.initClient();

app.use(express.json());
app.options('*', cors());

app.get('/', (_: Request, res: Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

app.get('/trees', async (req: Request, res: Response) => {
  const { latitude, longitude, radius } = req.query;
  
  if (isValidRequest(latitude, longitude)) {
    await client.connect();

    const nearbyTrees = await client.geoSearchWith(
      'trees',
      { latitude, longitude },
      { radius: radius || 0.1, unit: 'mi' },
      ['COORDINATES'],
    );
    
    res.send(nearbyTrees);
    await client.disconnect();
  } else {
    res.status(400).send('invalid parameters');
  };
});

const port = parseInt(process.env.PORT || '') || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
