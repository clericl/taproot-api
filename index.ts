import cors from 'cors';
import express, { Request, Response } from 'express';
import Redis from './util/Redis';
import isValidRequest from './util/isValidRequest';
import {GeoReplyWith} from 'redis';

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

    if (client.isOpen) {
      const nearbyTrees = await client.geoSearchWith(
        'trees',
        { latitude, longitude },
        { radius: radius || 0.1, unit: 'mi' },
        [GeoReplyWith.COORDINATES],
      );
      
      res.send(nearbyTrees);
      await client.quit();
    } else {
      res.status(503).send('client was not ready!');
    }
  } else {
    res.status(400).send('invalid parameters');
  };
});

app.get('/ntas', async (req: Request, res: Response) => {
  const { latitude, longitude, radius } = req.query;
  
  if (isValidRequest(latitude, longitude)) {
    await client.connect();

    if (client.isOpen) {
      const nearbyNtas = await client.geoSearchWith(
        'ntas',
        { latitude, longitude },
        { radius: radius || 0.1, unit: 'mi' },
        [GeoReplyWith.COORDINATES],
      );
      
      res.send(nearbyNtas);
      await client.quit();
    } else {
      res.status(503).send('client was not ready!');
    }
  } else {
    res.status(400).send('invalid parameters');
  };
});

app.get('/species', async (req: Request, res: Response) => {
  const { latitude, longitude, radius, species } = req.query;
  
  if (isValidRequest(latitude, longitude)) {
    await client.connect();

    if (client.isOpen) {
      let transaction = await client.multi()
      const speciesList = typeof species === 'string' ? species.split(',') : []

      for (const individualSpecies of speciesList) {
        transaction = await transaction.geoSearchWith(
          `species:${individualSpecies.replaceAll(' ', '_')}`,
          { latitude, longitude },
          { radius: radius || 0.1, unit: 'mi' },
          [GeoReplyWith.COORDINATES],
        )
      }

      const nearbyTreesOfSpecies = await transaction.exec()
      
      res.send(nearbyTreesOfSpecies);
      await client.quit();
    } else {
      res.status(503).send('client was not ready!');
    }
  } else {
    res.status(400).send('invalid parameters');
  };
});

const port = parseInt(process.env.PORT || '') || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
